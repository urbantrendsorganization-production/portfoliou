from django.db import models
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .models import Profile, WorkSample, Gig, GigApplication, Message, Bookmark, Analytics, Subscription
from .serializers import (
    UserSerializer, RegisterSerializer, ProfileSerializer,
    WorkSampleSerializer, GigSerializer, GigApplicationSerializer,
    MessageSerializer, BookmarkSerializer, AnalyticsSerializer,
    SubscriptionSerializer
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

class BookmarkViewSet(viewsets.ModelViewSet):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(client_profile__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(client_profile=self.request.user.profile)


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(profile__user=self.request.user)


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
