import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time messaging and notifications.

    Each authenticated user joins their own group: user_{profile_id}
    Messages are sent to the receiver's group for real-time delivery.
    """

    async def connect(self):
        self.user = self.scope.get("user", AnonymousUser())

        if self.user.is_anonymous:
            await self.close()
            return

        self.profile = await self.get_profile()
        if not self.profile:
            await self.close()
            return

        self.room_group_name = f"user_{self.profile.id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

        # Send initial unread count
        unread = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            "type": "unread_count",
            "count": unread,
        }))

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name,
            )

    async def receive(self, text_data):
        """Handle incoming WebSocket messages from the client."""
        data = json.loads(text_data)
        msg_type = data.get("type")

        if msg_type == "chat_message":
            receiver_id = data.get("receiver_id")
            content = data.get("content", "").strip()

            if not receiver_id or not content:
                return

            # Save message to DB
            message = await self.save_message(receiver_id, content)
            if not message:
                return

            message_data = await self.serialize_message(message)

            # Send to sender (self)
            await self.send(text_data=json.dumps({
                "type": "new_message",
                "message": message_data,
            }))

            # Send to receiver's group
            await self.channel_layer.group_send(
                f"user_{receiver_id}",
                {
                    "type": "chat.message",
                    "message": message_data,
                }
            )

        elif msg_type == "mark_read":
            partner_id = data.get("partner_id")
            if partner_id:
                count = await self.mark_messages_read(partner_id)
                unread = await self.get_unread_count()
                await self.send(text_data=json.dumps({
                    "type": "unread_count",
                    "count": unread,
                }))

        elif msg_type == "typing":
            receiver_id = data.get("receiver_id")
            if receiver_id:
                await self.channel_layer.group_send(
                    f"user_{receiver_id}",
                    {
                        "type": "typing.indicator",
                        "sender_id": self.profile.id,
                        "sender_name": self.profile.name,
                    }
                )

    # ── Group message handlers ───────────────────────────

    async def chat_message(self, event):
        """Receive a message from the channel layer group."""
        await self.send(text_data=json.dumps({
            "type": "new_message",
            "message": event["message"],
        }))

        # Update unread count
        unread = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            "type": "unread_count",
            "count": unread,
        }))

    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps({
            "type": "typing",
            "sender_id": event["sender_id"],
            "sender_name": event["sender_name"],
        }))

    async def notification_event(self, event):
        """Forward notifications (gig applications, etc.) to the client."""
        await self.send(text_data=json.dumps({
            "type": "notification",
            "notification": event["notification"],
        }))

    # ── Database helpers ─────────────────────────────────

    @database_sync_to_async
    def get_profile(self):
        try:
            return self.user.profile
        except Exception:
            return None

    @database_sync_to_async
    def get_unread_count(self):
        from .models import Message
        return Message.objects.filter(
            receiver=self.profile,
            read=False,
        ).count()

    @database_sync_to_async
    def save_message(self, receiver_id, content):
        from .models import Message, Profile
        try:
            receiver = Profile.objects.get(id=receiver_id)
            return Message.objects.create(
                sender=self.profile,
                receiver=receiver,
                content=content,
            )
        except Profile.DoesNotExist:
            return None

    @database_sync_to_async
    def mark_messages_read(self, partner_id):
        from .models import Message
        return Message.objects.filter(
            sender_id=partner_id,
            receiver=self.profile,
            read=False,
        ).update(read=True)

    @database_sync_to_async
    def serialize_message(self, message):
        """Serialize a message instance to a dict for JSON."""
        sender_avatar = None
        if message.sender.avatar:
            sender_avatar = message.sender.avatar.url

        receiver_avatar = None
        if message.receiver.avatar:
            receiver_avatar = message.receiver.avatar.url

        return {
            "id": message.id,
            "sender": message.sender.id,
            "receiver": message.receiver.id,
            "sender_name": message.sender.name,
            "receiver_name": message.receiver.name,
            "sender_avatar": sender_avatar,
            "receiver_avatar": receiver_avatar,
            "content": message.content,
            "read": message.read,
            "created_at": message.created_at.isoformat(),
        }
