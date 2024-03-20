const isMainEntryPoint = window.isMainEntryPoint;

if (isMainEntryPoint) {
  document.addEventListener('DOMContentLoaded', function() {  
  const textarea = document.getElementById('new-post-textarea');
  const form = document.getElementById('new-post-form');

  // Check if textarea and form exist before adding event listeners
  if (textarea && form) {
    textarea.addEventListener('input', () => countChars());
    form.addEventListener('submit', createNewPost);
  }
  
  const followingPage = document.getElementById('global-data').getAttribute('data-following-page').toLowerCase();
  if (followingPage === 'true') {
    showPosts('following');
  } else {
    showPosts('all');
  }
});
};

const user_authenticated = document.getElementById('global-data').getAttribute('data-user-authenticated');


export function getCookie(name) {
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
  return fetch('/post/create', {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrftoken,
    },
    body: JSON.stringify(content)
  });
}

function createNewPost(event) {
  event.preventDefault()
  sendDataToServerAndProcessResponse()
  .then(response => response.json())
  .then(data => {
    console.log(data)
    const post = data.post
    showNewPost(post)
  })
  clearNewPostForm()
  countChars() // resets counter
}


// Showing the posts
function getUsername() {
  let username = document.getElementById('profile-username')
  if (username) {
    return username.innerHTML;
  }

}

function getPosts(criteria) {
  const urlParams = new URLSearchParams(window.location.search);
  const username = getUsername()
  const page_number = urlParams.get('page') || 1; 

  let url = `/posts/${criteria}?page=${page_number}`;

  if (username) {
    url += `&username=${username}`;
  }
  return fetch(url)
  .then(response => response.json())
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

function showNewPost(post) {
  const postsContainer = document.getElementById('posts-container');
  const postDiv = createPostDiv(post);
  postsContainer.prepend(postDiv);
}


function generatePaginator(paginator_data) {
  const paginatorContainer = document.createElement('nav');
  paginatorContainer.classList.add('paginator');
  const paginatorList = document.createElement('ul');
  paginatorList.classList.add('pagination')
  paginatorList.classList.add('justify-content-center')
  paginatorContainer.appendChild(paginatorList);

  const createPageLink = (num, textContent="") => {
    const listItem = document.createElement('li');
    listItem.classList.add('page-item')

    const pageLink = document.createElement('a');
    pageLink.href = `?page=${num}`;
    pageLink.textContent = textContent || num;
    pageLink.classList.add('page-link');
    
    listItem.appendChild(pageLink);
    paginatorList.appendChild(listItem);
  };

  const createEllipsis = () => {
    const listItem = document.createElement('li');
    listItem.classList.add('page-item');
    listItem.classList.add('page-link');
    listItem.textContent = '...'
    paginatorList.appendChild(listItem);
  };
  // Create previous button
  if (paginator_data.has_previous) {
    createPageLink(paginator_data.previous_page_number, "Previous")
  }

  if (paginator_data.number_of_pages < 5) {
    for (let num = 1; num <= paginator_data.number_of_pages; num++) { 
      createPageLink(num)
    }
  }
  else {
  const currentPage = paginator_data.current_page;
  const totalPages = paginator_data.number_of_pages;
  
  // First page
  createPageLink(1);

  // Ellipsis between first page and previous page if needed
  if (currentPage > 3) {
    createEllipsis()
  }

   // Previous page link
   if (currentPage > 2) {
    createPageLink(parseInt(currentPage) - 1);
  }
  

  // Current page
  if (currentPage != 1 & currentPage != totalPages) {
    createPageLink(currentPage);
  }

  // Next page link
  if (currentPage < totalPages & totalPages - 1 != currentPage) {
    createPageLink(parseInt(currentPage) + 1);
  }
  

  // Ellipsis between next page and last page if needed
  if (currentPage < totalPages - 2) {
    createEllipsis()
  }

  // Last page
  createPageLink(totalPages);
}

  if (paginator_data.has_next) {
    createPageLink(paginator_data.next_page_number, "Next")
  }

  return paginatorContainer;
}


export function showPosts(criteria) {
  const postsContainer = document.getElementById('posts-container');
  getPosts(criteria)
  .then(data => {
    let posts = data.posts;
    posts.forEach(post => {
      const postDiv = createPostDiv(post);
      postsContainer.appendChild(postDiv);
    });

    let paginator = generatePaginator(data.paginator_data)
    postsContainer.appendChild(paginator)

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
  if (isLiked) { 
    likesButton.classList.replace('btn-success', 'btn-danger')
  }
  else {
    likesButton.classList.replace('btn-danger', 'btn-success')
  }

  
}
