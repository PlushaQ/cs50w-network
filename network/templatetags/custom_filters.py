from django import template
from network.models import User, Follower


register = template.Library()

@register.filter()
def is_logged_in_user_following_user(logged_user, user_on_page):
    return logged_user.is_following_user(user_on_page.username)
