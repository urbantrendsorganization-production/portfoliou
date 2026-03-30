"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Search, Send, MoreVertical, Phone, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function MessagesPage() {
  const profile = useAppStore((s) => s.profile);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) return;
    loadConversations();
    
    // Simple polling for new messages every 5 seconds as a replacement for real-time
    const interval = setInterval(() => {
      if (selectedUser) loadMessages(selectedUser.id);
      loadConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [profile, selectedUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadConversations() {
    try {
      const allMessages = await api.messages.list();
      // Group by other user
      const partnersMap = new Map();
      allMessages.forEach((m: any) => {
        const partner = m.sender === profile?.id ? m.receiver_profile : m.sender_profile;
        if (!partner) return;
        if (!partnersMap.has(partner.id) || new Date(m.created_at) > new Date(partnersMap.get(partner.id).lastMessage.created_at)) {
          partnersMap.set(partner.id, { ...partner, lastMessage: m });
        }
      });
      setConversations(Array.from(partnersMap.values()));
    } catch (err) {
      console.error("Error loading conversations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(partnerId: number) {
    try {
      const data = await api.messages.list(partnerId);
      setMessages(data);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !profile) return;

    try {
      const sent = await api.messages.send({
        receiver: selectedUser.id,
        content: newMessage,
      });
      setMessages([...messages, sent]);
      setNewMessage("");
      loadConversations();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  return (
    <DashboardShell>
      <div className="h-[calc(100vh-12rem)] min-h-[500px] flex gap-6">
        {/* Sidebar */}
        <Card className="w-80 flex-shrink-0 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedUser(conv)}
                className={`w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors border-l-4 ${
                  selectedUser?.id === conv.id ? "bg-indigo-50/50 border-indigo-600" : "border-transparent"
                }`}
              >
                <Avatar src={conv.avatar} name={conv.name} />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="font-bold text-gray-900 truncate">{conv.name}</p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(conv.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.lastMessage.content}</p>
                </div>
              </button>
            ))}
            {!loading && conversations.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <p className="text-sm">No conversations yet.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={selectedUser.avatar} name={selectedUser.name} />
                  <div>
                    <p className="font-bold text-gray-900">{selectedUser.name}</p>
                    <p className="text-xs text-green-500 font-medium">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-400"><Phone className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-gray-400"><Video className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-gray-400"><MoreVertical className="h-4 w-4" /></Button>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30" ref={scrollRef}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === profile?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                        m.sender === profile?.id
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-white text-gray-900 rounded-tl-none border border-gray-100"
                      }`}
                    >
                      {m.content}
                      <p className={`text-[10px] mt-1 ${m.sender === profile?.id ? "text-indigo-200" : "text-gray-400"}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button type="submit" disabled={!newMessage.trim()} className="rounded-xl">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-indigo-200 -rotate-12" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Your Messages</h3>
              <p className="text-gray-500 max-w-xs mt-1">
                Select a conversation from the sidebar to start chatting with creatives and clients.
              </p>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
