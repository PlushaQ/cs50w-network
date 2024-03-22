from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("following", views.following, name="following"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post/create", views.create_new_post, name='create_new_post'),
    path("post/edit/<int:post_id>", views.edit_post, name='edit_post'),
    path("posts/<str:criteria>", views.get_serialized_posts, name='posts'),
    path("like/<int:post_id>", views.add_or_remove_like, name='like'),
    path("users/<str:username>", views.profile_page, name="profile-page"),
    path('users/follow/<str:username>', views.follow_unfollow, name='follow-unfollow'),
]
