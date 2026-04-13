from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    GoogleAuthView, RegisterView, ProfileViewSet, WorkSampleViewSet,
    GigViewSet, GigApplicationViewSet, MessageViewSet,
    AnalyticsViewSet, BookmarkViewSet, SubscriptionViewSet,
    NotificationViewSet,
    # Admin views
    admin_stats, AdminUserViewSet, AdminGigViewSet,
    AdminWorkSampleViewSet, admin_activity,
    # Health
    health_check,
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

# Admin router
admin_router = DefaultRouter()
admin_router.register(r'users', AdminUserViewSet, basename='admin-users')
admin_router.register(r'gigs', AdminGigViewSet, basename='admin-gigs')
admin_router.register(r'work-samples', AdminWorkSampleViewSet, basename='admin-work-samples')

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/google/', GoogleAuthView.as_view(), name='auth_google'),
    path('admin/stats/', admin_stats, name='admin-stats'),
    path('admin/activity/', admin_activity, name='admin-activity'),
    path('admin/', include(admin_router.urls)),
    path('', include(router.urls)),
]
