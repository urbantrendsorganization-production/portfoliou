from django.db import models
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .models import Profile, WorkSample, Gig, GigApplication, Message, Bookmark, Analytics, Notification, Subscription
from .serializers import (
    UserSerializer, RegisterSerializer, ProfileSerializer,
    WorkSampleSerializer, GigSerializer, GigApplicationSerializer,
    MessageSerializer, BookmarkSerializer, AnalyticsSerializer,
    NotificationSerializer, SubscriptionSerializer
)
from django.db.models import Count, Q

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = self.queryset
        role = self.request.query_params.get('role')
        username = self.request.query_params.get('username')
        discipline = self.request.query_params.get('discipline')
        if role:
            qs = qs.filter(role=role)
        if username:
            qs = qs.filter(models.Q(username=username) | models.Q(user__username=username))
        if discipline:
            qs = qs.filter(discipline=discipline)
        return qs

    def perform_update(self, serializer):
        if self.request.user.profile != serializer.instance:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only update your own profile.")
        serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        profile = request.user.profile
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def search(self, request):
        """Search profiles by name for starting new conversations."""
        q = request.query_params.get('q', '').strip()
        if len(q) < 2:
            return Response([])
        profiles = Profile.objects.filter(
            models.Q(name__icontains=q) | models.Q(username__icontains=q)
        ).exclude(user=request.user)[:20]
        serializer = self.get_serializer(profiles, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        """Change user password."""
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        if not current_password or not new_password:
            return Response({'error': 'Both current and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        if not user.check_password(current_password):
            return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({'error': 'New password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({'status': 'Password changed successfully.'})

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def delete_account(self, request):
        """Permanently delete user account and all associated data."""
        password = request.data.get('password')
        if not password:
            return Response({'error': 'Password is required to delete your account.'}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        if not user.check_password(password):
            return Response({'error': 'Incorrect password.'}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({'status': 'Account deleted successfully.'}, status=status.HTTP_200_OK)

class WorkSampleViewSet(viewsets.ModelViewSet):
    queryset = WorkSample.objects.all()
    serializer_class = WorkSampleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        profile_id = self.request.query_params.get('profile_id')
        if profile_id:
            return self.queryset.filter(profile_id=profile_id)
        return self.queryset

class GigViewSet(viewsets.ModelViewSet):
    queryset = Gig.objects.all()
    serializer_class = GigSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        status = self.request.query_params.get('status')
        discipline = self.request.query_params.get('discipline')
        qs = self.queryset
        if status:
            qs = qs.filter(status=status)
        if discipline:
            qs = qs.filter(discipline=discipline)
        return qs

class GigApplicationViewSet(viewsets.ModelViewSet):
    queryset = GigApplication.objects.all()
    serializer_class = GigApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = self.queryset.filter(
            models.Q(student_profile__user=self.request.user) |
            models.Q(gig__client_profile__user=self.request.user)
        )
        gig_id = self.request.query_params.get('gig_id')
        if gig_id:
            qs = qs.filter(gig_id=gig_id)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user.profile
        partner_id = self.request.query_params.get('partner_id')

        qs = self.queryset.filter(
            models.Q(sender=user_profile) | models.Q(receiver=user_profile)
        )

        if partner_id:
            qs = qs.filter(
                models.Q(sender_id=partner_id) | models.Q(receiver_id=partner_id)
            )

        return qs.order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user.profile)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        if message.receiver == request.user.profile:
            message.read = True
            message.save()
        return Response({'status': 'ok'})

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_read_bulk(self, request):
        """Mark all messages from a partner as read."""
        partner_id = request.data.get('partner_id')
        if partner_id:
            count = Message.objects.filter(
                sender_id=partner_id,
                receiver=request.user.profile,
                read=False,
            ).update(read=True)
            return Response({'marked': count})
        return Response({'marked': 0})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def unread_count(self, request):
        """Get total unread message count."""
        count = Message.objects.filter(
            receiver=request.user.profile,
            read=False,
        ).count()
        return Response({'count': count})

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(profile__user=self.request.user)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = self.get_queryset().filter(read=False).count()
        return Response({'count': count})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(read=False).update(read=True)
        return Response({'marked': updated})


class BookmarkViewSet(viewsets.ModelViewSet):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(client_profile__user=self.request.user)

    def create(self, request, *args, **kwargs):
        student_profile_id = request.data.get('student_profile')
        if not student_profile_id:
            return Response({'error': 'student_profile is required'}, status=status.HTTP_400_BAD_REQUEST)

        client_profile = request.user.profile

        # Return existing bookmark if already bookmarked (idempotent)
        existing = Bookmark.objects.filter(
            client_profile=client_profile,
            student_profile_id=student_profile_id,
        ).first()
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(client_profile=client_profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(profile__user=self.request.user)

    def get_permissions(self):
        # Allow internal webhook calls to create subscriptions
        if self.action == 'create':
            internal_key = self.request.headers.get('X-Internal-Key', '')
            if internal_key and internal_key == getattr(
                __import__('django.conf', fromlist=['settings']).settings,
                'INTERNAL_API_KEY', ''
            ):
                return [permissions.AllowAny()]
        return super().get_permissions()


class AnalyticsViewSet(viewsets.ModelViewSet):
    queryset = Analytics.objects.all()
    serializer_class = AnalyticsSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return self.queryset.filter(profile__user=self.request.user)
        return self.queryset.none()
