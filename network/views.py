from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage

import json

from .models import User, Post, Like, Follower

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
    context = {'response': 'Post created',
               'post': post.serialize()}
    return JsonResponse(context, status=200)


def get_posts_by_criteria(user, criteria):
    if criteria == 'all':
        posts = Post.objects.all().order_by('-created')
    elif criteria == 'user':
        posts = Post.objects.filter(owner=user).order_by('-created')
    elif criteria == 'following':
        user_followers = user.followers.all() 
        follower_users = [follower.user for follower in user_followers]
        posts = Post.objects.filter(Q(owner__in=follower_users) | Q(owner=user)).order_by('-created')
    else:
        posts = Post.objects.none()
    return posts


def get_paginator(posts):
    paginator = Paginator(posts, 10)
    return paginator


def get_paginated_posts(paginator, page_number):
    return paginator.page(page_number)
    

def get_serialized_posts(request, criteria):
    posts = get_posts_by_criteria(request.user, criteria)
    paginator = get_paginator(posts)
    current_page = request.GET.get('page')
    paginated_posts = get_paginated_posts(paginator, current_page)

    serialized_posts = [post.serialize(current_user=request.user) for post in paginated_posts]
    return JsonResponse({
        'posts': serialized_posts,
        'paginator_data': {
            'number_of_pages': paginator.num_pages,
            'current_page': current_page,
            'has_next': paginated_posts.has_next(),
            'has_previous': paginated_posts.has_previous(),
            'next_page_number': paginated_posts.next_page_number() if paginated_posts.has_next() else None,
            'previous_page_number': paginated_posts.previous_page_number() if paginated_posts.has_previous() else None,}
    }, safe=False)


def index(request):
    return render(request, "network/index.html", {'following_page': False})


def following(request):
    return render(request, "network/index.html", {'following_page': True})


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


def follow_unfollow(request, username):
    if request.user.is_authenticated and request.method == "POST":
        user_to_follow = User.objects.get(username=username)
        if request.user == user_to_follow:
            return JsonResponse({'message': "You can't follow yourself"})
        
        follower, created = Follower.objects.get_or_create(follower=request.user, user=user_to_follow)
        if not created:
            follower.delete()
            message = 'unfollowed'
            is_following = False
        else:
            message = 'Followed'
            is_following = True
        number_of_followers = user_to_follow.get_followers_count()
        context = {
            'message': message,
            'number_of_followers': number_of_followers,
            'is_following': is_following,
            }
        return JsonResponse(context, status=200)

    else:
        return redirect('login')