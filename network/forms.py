from django import forms

from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={'id': 'new-post-textarea', 'class': 'form-control', 'rows': 4})
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

        if user:
            self.instance.owner = user
        