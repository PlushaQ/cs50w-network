document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('new-post-textarea');
  const form = document.getElementById('new-post-form');

  // Check if textarea and form exist before adding event listeners
  if (textarea && form) {
    textarea.addEventListener('input', () => countChars());
    form.addEventListener('submit', createNewPost);
  }
  
  showAllPosts()
});

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

function clearNewPostForm() {
  document.querySelector('#new-post-textarea').value = "";

}

function getFormInfo() {
  let content = document.getElementById('new-post-textarea').value;
  return {
    content: content,
  }
}

function send_data_to_server_and_process_response() {
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
  send_data_to_server_and_process_response()
  clearNewPostForm()
  countChars() // resets counter
}

function getAllPosts() {
  return fetch('/posts/').then(response => response.json())
  .then(response => {
    return response }
    )
}
function addOrRemoveLike(post_id) {
  const csrftoken = getCookie('csrftoken');
  fetch(`/like/${post_id}`,
  {
    method: "POST",
    headers: {
      'X-CSRFToken': csrftoken,
    },
  })
  .then(response => response.json()
  .then(data => {
    const likes_element = document.getElementById(`likes-${post_id}`);
    likes_element.innerHTML = `Likes: ${data.number_of_likes}`
  }
      
      
    )
  )
}

function showAllPosts() {
  const postsContainer = document.getElementById('all_posts')
  getAllPosts()
  .then(posts => 
    posts.forEach(post => {
      const postDiv = document.createElement('div');
      postDiv.classList.add('post-container');
      postDiv.innerHTML = `
        <div class="post">
          <p> ${post.owner}</p>
          <p> ${post.content}</p>
          <p> ${post.created}</p>
          <p id="likes-${post.id}"> Likes: ${post.number_of_likes}</p>
          <button onclick="addOrRemoveLike(${post.id})">Like</button>
        </div>
      `
      postsContainer.appendChild(postDiv);
  }));
}