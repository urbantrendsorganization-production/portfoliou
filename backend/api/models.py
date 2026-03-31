from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('client', 'Client'),
    )
    
    DISCIPLINE_CHOICES = (
        ('', 'Select Discipline'),
        ('Beauty & Cosmetology', 'Beauty & Cosmetology'),
        ('Web/App Development', 'Web/App Development'),
        ('Graphic Design', 'Graphic Design'),
        ('Fashion & Styling', 'Fashion & Styling'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    name = models.CharField(max_length=255, blank=True)
    username = models.CharField(max_length=100, unique=True, null=True, blank=True)
    school = models.CharField(max_length=255, blank=True)
    discipline = models.CharField(max_length=100, choices=DISCIPLINE_CHOICES, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    cover_image = models.ImageField(upload_to='covers/', null=True, blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    skills = models.JSONField(default=list, blank=True)  # Using JSONField for skills list
    location = models.CharField(max_length=255, blank=True)
    is_premium = models.BooleanField(default=False)
    open_to_work = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class WorkSample(models.Model):
    TYPE_CHOICES = (
        ('image', 'Image'),
        ('link', 'Link'),
        ('video', 'Video'),
    )
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='work_samples')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    sample_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='image')
    media = models.FileField(upload_to='work_samples/', null=True, blank=True)
    link = models.URLField(max_length=500, blank=True)
    thumbnail = models.ImageField(upload_to='thumbnails/', null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.profile.user.username})"


class Gig(models.Model):
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('in_progress', 'In Progress'),
    )
    client_profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='posted_gigs')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    discipline = models.CharField(max_length=100, choices=Profile.DISCIPLINE_CHOICES, blank=True)
    budget = models.CharField(max_length=255, blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class GigApplication(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )
    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name='applications')
    student_profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='applications')
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('gig', 'student_profile')

    def __str__(self):
        return f"{self.student_profile.user.username} applied for {self.gig.title}"


class Message(models.Model):
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"From {self.sender.user.username} to {self.receiver.user.username}"


class Bookmark(models.Model):
    client_profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='bookmarks')
    student_profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('client_profile', 'student_profile')


class Analytics(models.Model):
    EVENT_CHOICES = (
        ('profile_view', 'Profile View'),
        ('link_click', 'Link Click'),
        ('work_sample_view', 'Work Sample View'),
    )
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='analytics')
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
    TYPE_CHOICES = (
        ('new_message', 'New Message'),
        ('gig_application', 'Gig Application'),
        ('application_accepted', 'Application Accepted'),
        ('application_rejected', 'Application Rejected'),
        ('profile_view', 'Profile View'),
    )
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    link = models.CharField(max_length=500, blank=True)
    read = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} for {self.profile.user.username}"


class Subscription(models.Model):
    PLAN_CHOICES = (
        ('student_premium', 'Student Premium'),
        ('client_premium', 'Client Premium'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('canceled', 'Canceled'),
        ('past_due', 'Past Due'),
        ('trialing', 'Trialing'),
        ('incomplete', 'Incomplete'),
    )
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name='subscription')
    stripe_customer_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    stripe_subscription_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    plan = models.CharField(max_length=50, choices=PLAN_CHOICES, default='student_premium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    current_period_end = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
