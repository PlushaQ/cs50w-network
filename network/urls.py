from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("posts/create_post", views.create_new_post, name='create_new_post'),
    path("posts/<str:criteria>", views.get_serialized_posts, name='posts'),
    path("like/<int:post_id>", views.add_or_remove_like, name='like'),
    path("users/<str:username>", views.profile_page, name="profile-page"),
]
