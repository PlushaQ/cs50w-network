from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    pass

class Post(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=300)
    created = models.DateTimeField(editable=False)
    last_modified = models.DateTimeField()

    def __str__(self) -> str:
        return f'Post by {self.owner} created at {self.created.strftime("%H:%M:%S %d.%m.%Y")}'
    
    def serialize(self, current_user=None):
        likes = Like.get_number_of_likes(self)
        is_liked = self.likes.filter(user=current_user).exists() if current_user else False
        return {
            "id": self.id,
            "owner": self.owner.username,
            "content": self.content,
            "created": self.created.strftime("%H:%M:%S %d.%m.%Y"),
            "last_modified": self.last_modified.strftime("%H:%M:%S %d.%m.%Y"),
            "number_of_likes": likes,
            "is_liked": is_liked,
        }

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.last_modified = timezone.now()

        super(Post, self).save(*args, **kwargs)


class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    @classmethod
    def get_number_of_likes(cls, post):
        number_of_likes = cls.objects.filter(post=post).count()
        return number_of_likes

class Follower(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    user = models.ForeignKey(User, on_delete=models.CASCADE)