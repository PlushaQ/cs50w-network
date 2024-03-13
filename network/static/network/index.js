document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('new-post-textarea').addEventListener('input', () => countChars());
  document.getElementById('new-post-form').addEventListener('submit', createNewPost);
  
  showAllPosts()
});


function countChars() {
    let text = document.getElementById('new-post-textarea').value;
    let charCount = 300 - text.length;
    document.getElementById('char-counter').innerText = `Remaining characters: ${charCount}`
}

function clearNewPostForm() {
  document.querySelector('#new-post-textarea').value = "";

}

function createNewPost(event) {
  event.preventDefault()
  clearNewPostForm()
}

function getAllPosts() {
  return fetch('/posts/').then(response => response.json())
  .then(response => {
    return response }
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
        </div>
      `
      postsContainer.appendChild(postDiv);
  }));
}