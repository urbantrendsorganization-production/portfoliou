from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, WorkSample, Gig, GigApplication, Message, Bookmark, Analytics, Notification, Subscription

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            validated_data['username'],
            validated_data['email'],
            validated_data['password']
        )
        return user

class ProfileSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)
    avatar_url = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = '__all__'

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None

class FlexibleTagsField(serializers.Field):
    """Accepts a Python list (from JSON body) or a JSON-encoded string (from multipart FormData).
    DRF's built-in JSONField calls json.loads() on whatever it receives, which breaks when
    the value is already a parsed list — this field handles both cases explicitly."""

    def to_internal_value(self, data):
        import json
        if isinstance(data, list):
            return data
        if isinstance(data, str):
            try:
                result = json.loads(data)
                if isinstance(result, list):
                    return result
            except (json.JSONDecodeError, ValueError):
                pass
        return []

    def to_representation(self, value):
        return value if value is not None else []


class WorkSampleSerializer(serializers.ModelSerializer):
    tags = FlexibleTagsField(required=False, default=list)

    class Meta:
        model = WorkSample
        fields = '__all__'

class GigSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client_profile.name', read_only=True)
    
    class Meta:
        model = Gig
        fields = '__all__'

class GigApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student_profile.name', read_only=True)
    student_discipline = serializers.CharField(source='student_profile.discipline', read_only=True)
    student_avatar = serializers.SerializerMethodField()
    student_username = serializers.CharField(source='student_profile.username', read_only=True)
    gig_title = serializers.CharField(source='gig.title', read_only=True)

    class Meta:
        model = GigApplication
        fields = '__all__'

    def get_student_avatar(self, obj):
        if obj.student_profile.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.student_profile.avatar.url)
            return obj.student_profile.avatar.url
        return None

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.name', read_only=True)
    sender_profile = ProfileSerializer(source='sender', read_only=True)
    receiver_profile = ProfileSerializer(source='receiver', read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'
        extra_kwargs = {'sender': {'read_only': True}}

class BookmarkSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student_profile.name', read_only=True)
    student_username = serializers.CharField(source='student_profile.username', read_only=True)
    student_discipline = serializers.CharField(source='student_profile.discipline', read_only=True)
    student_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Bookmark
        fields = '__all__'
        extra_kwargs = {'client_profile': {'read_only': True}}

    def get_student_avatar(self, obj):
        if obj.student_profile.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.student_profile.avatar.url)
            return obj.student_profile.avatar.url
        return None

class AnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analytics
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'


# ── Admin Serializers ────────────────────────────────────────

class AdminProfileSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)
    avatar_url = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'user_username', 'email', 'is_staff', 'role', 'name',
            'username', 'school', 'discipline', 'bio', 'avatar', 'avatar_url',
            'skills', 'location', 'is_premium', 'open_to_work',
            'created_at', 'updated_at', 'date_joined',
        ]

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None


class AdminGigSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client_profile.name', read_only=True)
    client_username = serializers.CharField(source='client_profile.username', read_only=True)
    applications_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Gig
        fields = [
            'id', 'client_profile', 'client_name', 'client_username',
            'title', 'description', 'discipline', 'budget', 'deadline',
            'status', 'applications_count', 'created_at',
        ]


class AdminWorkSampleSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='profile.name', read_only=True)
    owner_username = serializers.CharField(source='profile.username', read_only=True)
    media_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = WorkSample
        fields = [
            'id', 'profile', 'owner_name', 'owner_username',
            'title', 'description', 'sample_type', 'media', 'media_url',
            'link', 'thumbnail', 'thumbnail_url', 'tags', 'created_at',
        ]

    def get_media_url(self, obj):
        if obj.media:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.media.url)
            return obj.media.url
        return None

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None
