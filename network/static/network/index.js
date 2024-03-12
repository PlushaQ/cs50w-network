document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('new-post-textarea').addEventListener('input', () => countChars());
  document.getElementById('new-post-form').addEventListener('submit', createNewPost);
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