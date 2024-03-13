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
    
    def serialize(self):
        return {
            "id": self.id,
            "owner": self.owner.username,
            "content": self.content,
            "created": self.created,
            "last_modified": self.last_modified,
        }

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.last_modified = timezone.now()

        super(Post, self).save(*args, **kwargs)


class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

