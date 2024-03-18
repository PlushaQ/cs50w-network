from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

import json

from .models import User, Post, Like

@login_required
def create_new_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    data = json.loads(request.body)
    owner = User.objects.get(pk=request.user.id)
    content = data.get('content', '')
    if not content:
        return JsonResponse({'error': 'You need to provide content of the post'}, status=400)
    post = Post(owner=owner, content=content)
    post.save()

    return JsonResponse({'response': 'response OK'}, status=200)


def get_posts_by_criteria(user, criteria):
    if criteria == 'all':
        posts = Post.objects.all().order_by('-created')
    elif criteria == 'user':
        posts = Post.objects.filter(owner=user).order_by('-created')
    elif criteria == 'followers':
        user_followers = user.followers.all() 
        follower_users = [follower.user for follower in user_followers]
        posts = Post.objects.filter(Q(owner__in=follower_users) | Q(owner=user)).order_by('-created')
    else:
        posts = Post.objects.none()
    return posts


def get_serialized_posts(request, criteria):
    posts = get_posts_by_criteria(request.user, criteria)

    serialized_posts = [post.serialize(current_user=request.user) for post in posts]
    return JsonResponse(serialized_posts, safe=False)


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def add_or_remove_like(request, post_id):
    if request.user.is_authenticated and request.method == "POST":
        post = Post.objects.get(pk=post_id)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if not created:
            like.delete()
            message = 'like removed'
            is_liked = False
        else:
            message = 'like added'
            is_liked = True
        number_of_likes = Like.get_number_of_likes(post)
        context = {
            'message': message,
            'number_of_likes': number_of_likes,
            'is_liked': is_liked,
            }
        return JsonResponse(context, status=200)

    else:
        return redirect('login')

def profile_page(request, username):
    user = User.objects.get(username=username)
    return render(request, "network/profile_page.html", {'user_profile': user })