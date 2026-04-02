"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { wsClient } from "@/lib/websocket";
import { Search, Send, MoreVertical, Loader2, Plus, X, ArrowLeft } from "lucide-react";
import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface Conversation {
  id: number;
  name: string;
  avatar: string | null;
  avatar_url: string | null;
  role: string;
  lastMessage: any;
  unreadCount: number;
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <DashboardShell>
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardShell>
    }>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const profile = useAppStore((s) => s.profile);
  const setUnreadMessageCount = useAppStore((s) => s.setUnreadMessageCount);
  const searchParams = useSearchParams();
  const partnerParam = searchParams.get("partner");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatQuery, setNewChatQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedUserRef = useRef<Conversation | null>(null);

  // Keep ref in sync
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Load conversations on mount
  useEffect(() => {
    if (!profile) return;
    loadConversations();
  }, [profile]);

  // Auto-open conversation from ?partner= query param (e.g. from Hire Me button)
  useEffect(() => {
    if (!profile || !partnerParam) return;
    const partnerId = Number(partnerParam);
    if (!partnerId || partnerId === profile.id) return;

    async function openPartner() {
      try {
        const partnerProfile = await api.profiles.get(partnerId);
        if (partnerProfile) {
          handleSelectNewChatProfile(partnerProfile);
        }
      } catch (err) {
        console.error("Error opening partner chat:", err);
      }
    }
    openPartner();
  }, [profile, partnerParam]);

  // WebSocket: listen for real-time messages
  useEffect(() => {
    if (!profile) return;

    const offMessage = wsClient.on("new_message", (data) => {
      const msg = data.message;

      // If this message is in the currently open conversation, add it
      const current = selectedUserRef.current;
      if (current) {
        const isFromPartner = msg.sender === current.id;
        const isToPartner = msg.receiver === current.id;
        if (isFromPartner || isToPartner) {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });

          // Mark as read if the message is from the partner
          if (isFromPartner) {
            wsClient.send({ type: "mark_read", partner_id: current.id });
          }
        }
      }

      // Refresh conversation list
      loadConversations();
    });

    const offTyping = wsClient.on("typing", (data) => {
      const current = selectedUserRef.current;
      if (current && data.sender_id === current.id) {
        setTypingUser(data.sender_name);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
      }
    });

    return () => {
      offMessage();
      offTyping();
    };
  }, [profile]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUser]);

  // Debounced search for new chat
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (newChatQuery.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await api.profiles.search(newChatQuery);
        // Filter out self
        setSearchResults(
          results.filter((p: any) => p.id !== profile?.id)
        );
      } catch (err) {
        console.error("Error searching profiles:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [newChatQuery, profile?.id]);

  const loadConversations = useCallback(async () => {
    try {
      const allMessages = await api.messages.list();
      const partnersMap = new Map<number, Conversation>();

      allMessages.forEach((m: any) => {
        const isFromMe = m.sender === profile?.id;
        const partner = isFromMe ? m.receiver_profile : m.sender_profile;
        if (!partner) return;

        const existing = partnersMap.get(partner.id);
        const isUnread = !isFromMe && !m.read;

        if (!existing) {
          partnersMap.set(partner.id, {
            id: partner.id,
            name: partner.name,
            avatar: partner.avatar,
            avatar_url: partner.avatar_url,
            role: partner.role,
            lastMessage: m,
            unreadCount: isUnread ? 1 : 0,
          });
        } else {
          if (new Date(m.created_at) > new Date(existing.lastMessage.created_at)) {
            existing.lastMessage = m;
          }
          if (isUnread) {
            existing.unreadCount += 1;
          }
        }
      });

      const sorted = Array.from(partnersMap.values()).sort(
        (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );
      setConversations(sorted);
    } catch (err) {
      console.error("Error loading conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  async function selectConversation(conv: Conversation) {
    setSelectedUser(conv);
    setShowMobileChat(true);
    setTypingUser(null);

    // Load full message history
    try {
      const data = await api.messages.list(conv.id);
      setMessages(data);
    } catch (err) {
      console.error("Error loading messages:", err);
    }

    // Mark messages as read
    if (conv.unreadCount > 0) {
      await api.messages.markReadBulk(conv.id);
      wsClient.send({ type: "mark_read", partner_id: conv.id });

      // Update local state
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
      );

      // Refresh global unread count
      api.messages.unreadCount().then((data) => {
        setUnreadMessageCount(data.count);
      }).catch(() => {});
    }
  }

  function handleSelectNewChatProfile(p: any) {
    const conv: Conversation = {
      id: p.id,
      name: p.name,
      avatar: p.avatar ?? null,
      avatar_url: p.avatar_url ?? null,
      role: p.role ?? "",
      lastMessage: null,
      unreadCount: 0,
    };

    // Add to conversations list if not already present
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === conv.id);
      if (exists) return prev;
      return [conv, ...prev];
    });

    setSelectedUser(conv);
    setShowMobileChat(true);
    setMessages([]);
    setShowNewChat(false);
    setNewChatQuery("");
    setSearchResults([]);

    // Load existing messages with this person if any
    api.messages.list(conv.id).then((data) => {
      setMessages(data);
    }).catch(() => {});
  }

  function handleBackToList() {
    setShowMobileChat(false);
    setSelectedUser(null);
  }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !profile) return;

    // Send via WebSocket for real-time delivery
    wsClient.send({
      type: "chat_message",
      receiver_id: selectedUser.id,
      content: newMessage,
    });

    setNewMessage("");
  }

  function handleTyping() {
    if (!selectedUser) return;
    wsClient.send({
      type: "typing",
      receiver_id: selectedUser.id,
    });
  }

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return (
    <DashboardShell>
      <div className="h-[calc(100vh-12rem)] min-h-[500px] flex gap-0 md:gap-6">
        {/* Sidebar */}
        <Card
          className={`w-full md:w-80 flex-shrink-0 flex flex-col overflow-hidden ${
            showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewChat(!showNewChat);
                  setNewChatQuery("");
                  setSearchResults([]);
                }}
                className="text-gray-500 hover:text-indigo-600"
                title="New chat"
              >
                {showNewChat ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* New Chat Search */}
            {showNewChat && (
              <div className="mb-3 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search people..."
                    value={newChatQuery}
                    onChange={(e) => setNewChatQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-9 pr-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Search Results Dropdown */}
                {(searchResults.length > 0 || searchLoading) && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-black/30 z-20 max-h-60 overflow-y-auto">
                    {searchLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                      </div>
                    ) : (
                      searchResults.map((p: any) => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectNewChatProfile(p)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <Avatar
                            src={p.avatar_url || p.avatar}
                            name={p.name}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                              {p.role}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {newChatQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 p-4 text-center">
                    <p className="text-sm text-gray-400 dark:text-gray-500">No users found</p>
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="text-sm">
                  {searchQuery ? "No chats match your search." : "No conversations yet."}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l-4 ${
                    selectedUser?.id === conv.id
                      ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-600"
                      : "border-transparent"
                  }`}
                >
                  <div className="relative">
                    <Avatar src={conv.avatar_url || conv.avatar} name={conv.name} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className={`truncate ${conv.unreadCount > 0 ? "font-extrabold text-gray-900 dark:text-gray-100" : "font-bold text-gray-900 dark:text-gray-100"}`}>
                        {conv.name}
                      </p>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                          {formatTime(conv.lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      {conv.lastMessage ? (
                        <>
                          <p className={`text-xs truncate ${conv.unreadCount > 0 ? "text-gray-900 dark:text-gray-100 font-semibold" : "text-gray-500 dark:text-gray-400"}`}>
                            {conv.lastMessage.sender === profile?.id && (
                              <span className="text-gray-400">You: </span>
                            )}
                            {conv.lastMessage.content}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 flex-shrink-0 h-5 min-w-[20px] flex items-center justify-center bg-indigo-600 text-white text-[10px] font-bold rounded-full px-1.5">
                              {conv.unreadCount}
                            </span>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No messages yet</p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card
          className={`flex-1 flex flex-col overflow-hidden ${
            !showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-1 -ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Avatar src={selectedUser.avatar_url || selectedUser.avatar} name={selectedUser.name} />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{selectedUser.name}</p>
                    {typingUser ? (
                      <p className="text-xs text-indigo-500 font-medium animate-pulse">
                        typing...
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 capitalize">{selectedUser.role}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 dark:bg-gray-900/30" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-400">
                      Start the conversation with {selectedUser.name}
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender === profile?.id;
                    const isGigApp = m.content?.startsWith("[Gig Application]");

                    return (
                      <div
                        key={m.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-tr-none"
                              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-600"
                          }`}
                        >
                          {isGigApp && !isMe && (
                            <Badge
                              variant="secondary"
                              className="mb-1.5 text-[10px] bg-amber-50 text-amber-700 border-amber-200"
                            >
                              Gig Application
                            </Badge>
                          )}
                          <p className="whitespace-pre-wrap">
                            {isGigApp ? m.content.replace("[Gig Application] ", "") : m.content}
                          </p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isMe ? "text-indigo-200" : "text-gray-400"
                            }`}
                          >
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing indicator */}
                {typingUser && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="rounded-xl"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-950/50 rounded-full flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-indigo-200 dark:text-indigo-700 -rotate-12" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Messages</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs mt-1">
                Select a conversation from the sidebar to start chatting with creatives and clients.
              </p>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
