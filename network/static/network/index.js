document.addEventListener('DOMContentLoaded', function() {  
  const textarea = document.getElementById('new-post-textarea');
  const form = document.getElementById('new-post-form');

  // Check if textarea and form exist before adding event listeners
  if (textarea && form) {
    textarea.addEventListener('input', () => countChars());
    form.addEventListener('submit', createNewPost);
  }

  showPosts('all')
});

const user_authenticated = document.getElementById('global-data').getAttribute('data-user-authenticated');


function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}



function countChars() {
    let text = document.getElementById('new-post-textarea').value;
    let charCount = 300 - text.length;
    document.getElementById('char-counter').innerText = `Remaining characters: ${charCount}`
}

// Creating new post

function clearNewPostForm() {
  document.querySelector('#new-post-textarea').value = "";

}

function getFormInfo() {
  let content = document.getElementById('new-post-textarea').value;
  return {
    content: content,
  }
}

function sendDataToServerAndProcessResponse() {
  const content = getFormInfo()
  const csrftoken = getCookie('csrftoken');
  return fetch('/posts/create', {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrftoken,
    },
    body: JSON.stringify(content)
  }).then(response => response.json())
  .then(result => {
      console.log(result);
  });
}

function createNewPost(event) {
  event.preventDefault()
  sendDataToServerAndProcessResponse()
  clearNewPostForm()
  countChars() // resets counter
}

// Showing the posts

function getPosts(criteria) {
  return fetch(`/posts/${criteria}`).then(response => response.json())
  .then(response => {
    return response }
    )
}

function createPostDiv(post) {
    const postDiv = document.createElement('div');
    postDiv.classList.add('post-container');
    postDiv.innerHTML = `
      <div class="post">
        <a href="/users/${post.owner}"><p> ${post.owner}</p></a>
        <p> ${post.content}</p>
        <p> ${post.created}</p>
        <p id="likes-${post.id}"> Likes: ${post.number_of_likes}</p>
      </div>
    `
    if (user_authenticated === 'true') {
      const likeButton = document.createElement('button');
      likeButton.id = `like-button-${post.id}`
      likeButton.textContent = post.is_liked ? 'Dislike': 'Like';
      likeButton.classList.add('btn')
      likeButton.classList.add(`btn-${post.is_liked ? "danger": 'success'}`);
      likeButton.onclick = () => addOrRemoveLike(post.id);
      postDiv.querySelector('.post').appendChild(likeButton);
    }
    return postDiv
  }

export function showPosts(criteria) {
  const postsContainer = document.getElementById('posts-container')
  getPosts(criteria)
  .then(posts => {
    posts.forEach(post => {
      const postDiv = createPostDiv(post);
      postsContainer.appendChild(postDiv);
    });
  });
}


// Likes functions

function addOrRemoveLike(postId) {
  const csrftoken = getCookie('csrftoken');
  fetch(`/like/${postId}`,
  {
    method: "POST",
    headers: {
      'X-CSRFToken': csrftoken,
    },
  })
  .then(response => response.json()
  .then(data => {
    console.log(data)
    alterLikesNumber(postId, data.number_of_likes);
    alterButton(postId, data.is_liked);
  }  
    )
  )
}

function alterLikesNumber(postId, numberOfLikes) {
  const likesElement = document.getElementById(`likes-${postId}`);
  likesElement.innerHTML = `Likes: ${numberOfLikes}`;
}

function alterButton(postId, isLiked) {
  const likesButton = document.getElementById(`like-button-${postId}`);
  likesButton.textContent = isLiked ? 'Dislike': 'Like';
  console.log(typeof(isLiked))
  if (isLiked) { 
    likesButton.classList.replace('btn-success', 'btn-danger')
  }
  else {
    likesButton.classList.replace('btn-danger', 'btn-success')
  }

  
}
