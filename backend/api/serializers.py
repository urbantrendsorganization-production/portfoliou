from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, WorkSample, Gig, GigApplication, Message, Bookmark, Analytics, Subscription

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
    avatar_url = serializers.SerializerMethodField()

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

class WorkSampleSerializer(serializers.ModelSerializer):
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
    gig_title = serializers.CharField(source='gig.title', read_only=True)
    
    class Meta:
        model = GigApplication
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.name', read_only=True)
    sender_profile = ProfileSerializer(source='sender', read_only=True)
    receiver_profile = ProfileSerializer(source='receiver', read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'

class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = '__all__'

class AnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analytics
        fields = '__all__'

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'
