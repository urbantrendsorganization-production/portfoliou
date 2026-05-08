from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve as static_serve

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Serve media files unconditionally — django.conf.urls.static.static() returns []
    # when DEBUG=False, so we register the route directly to make it work in production.
    re_path(r'^media/(?P<path>.*)$', static_serve, {'document_root': settings.MEDIA_ROOT}),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
