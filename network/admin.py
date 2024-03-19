from django.contrib import admin

# Register your models here.
from .models import Post, Like, User, Follower

admin.site.register(Post)
admin.site.register(Like)
admin.site.register(User)
admin.site.register(Follower)