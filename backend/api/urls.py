from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, ProfileViewSet, WorkSampleViewSet,
    GigViewSet, GigApplicationViewSet, MessageViewSet,
    AnalyticsViewSet, BookmarkViewSet, SubscriptionViewSet,
    NotificationViewSet
)

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet)
router.register(r'work-samples', WorkSampleViewSet)
router.register(r'gigs', GigViewSet)
router.register(r'gig-applications', GigApplicationViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'analytics', AnalyticsViewSet)
router.register(r'bookmarks', BookmarkViewSet)
router.register(r'subscriptions', SubscriptionViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
