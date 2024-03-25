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
const userUsername = document.getElementById('global-data').getAttribute('data-user-username');

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

function sendCreatePostRequestAndProcessResponse() {
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
  sendCreatePostRequestAndProcessResponse()
  .then(response => response.json())
  .then(data => {
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
  const page_number = getPageNumber(); 
  const username = getUsername()

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

function getPageNumber() {
  const urlParams = new URLSearchParams(window.location.search);
  let page_number = urlParams.get('page') || 1;
  page_number = parseInt(page_number)
  return page_number;
}

function createPostDiv(post) {
    const postDiv = document.createElement('div');
    postDiv.classList.add('post-container');
    postDiv.id = `post-${post.id}`
    postDiv.innerHTML = `
      <div class="post">
        <a href="/users/${post.owner}" class="creator-username"><strong>${post.owner}</strong></a>
        <div id="post${post.id}-content">
        <p class=post-content> ${post.content}</p>
        </div>
        <p><span class="like-button-container">
          </span>
          <span id="likes-${post.id}">${post.number_of_likes}</span> </p>
          <p class="created-time"> ${post.created}</p>
      </div>
    `
    createLikeButton()
    if (user_authenticated === 'true') {
      
      if (userUsername == post.owner) {
        createEditButton();
      }
    }
    return postDiv

  function createEditButton(){
    const editButton = document.createElement('button');
    const editSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3L21 10 10 21 3 21 3 14zM21 10L14 3"></path></svg>'
    editButton.id = `edit-button-${post.id}`;
    editButton.classList = 'edit-button'
    editButton.innerHTML = editSVG
    editButton.onclick = () => generateEditPostWindow(post.id)
    postDiv.prepend(editButton);
  }

  function createLikeButton() {
    const likeButton = document.createElement('button');
    likeButton.id = `like-button-${post.id}`;
    likeButton.classList.add('like-button')
    const heartSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path class="heart-path" fill="${post.is_liked ? 'red' : 'white'}" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
    `;
    likeButton.innerHTML = heartSVG
    if (user_authenticated === 'true') {
      likeButton.onclick = () => {
        addOrRemoveLike(post.id);
    }}
    else {
      likeButton.style.pointerEvents = 'none';
    }
    postDiv.querySelector('.like-button-container').appendChild(likeButton);
  }
}

function showNewPost(post) {
  const pageNum = getPageNumber();
  if (pageNum === 1) {
    const postsContainer = document.getElementById('posts-container');
    const postDiv = createPostDiv(post);
    postsContainer.prepend(postDiv);
    postDiv.style.animation = 'showNewPost 0.5s linear 1';
    postsContainer.lastChild.remove();
  }
  
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

function generateEmptyPost() {
  const emptyPost = document.createElement('div');
  emptyPost.classList.add('post-container');
  emptyPost.innerHTML = `
      <div class="post">
        <div class="post-info">
          <p style="text-align: center;">There's nothing to show you!</p>
        </div>
      </div>
  `;
  return emptyPost;
}


export function showPosts(criteria) {
  const postsContainer = document.getElementById('posts-container');
  getPosts(criteria)
  .then(data => {
    let posts = data.posts;
    if (posts.length === 0){
      const emptyPost = generateEmptyPost()
      postsContainer.appendChild(emptyPost)
    } else {
      posts.forEach(post => {
        const postDiv = createPostDiv(post);
        postsContainer.appendChild(postDiv);
      });
    }

    let paginator = generatePaginator(data.paginator_data)
    document.querySelector('#paginator').appendChild(paginator)

  });
}


// Edit posts function 
function getEditedPostContent(postId) {
  const content = document.getElementById(`edit-post${postId}-textarea`).value;
  return content;
}

function fetchEditData(postId) {
  let content = getEditedPostContent(postId)
  return fetch(`/post/edit/${postId}`, {
    method: 'PUT',
    headers: {
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify({'content': content})
  });

}

function editPost(postId) {
  fetchEditData(postId)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else if (response.status === 403) {
        throw new Error("Forbidden: You don't have permission to edit this post.");
      } else {
        throw new Error("Failed to fetch edit data.");
      }
    })
    .then(data => {
      regeneratePostDiv(data.post);
    })
    .catch(error => {
      console.error("Error editing post:", error);
    });
}


function generateEditPostWindow(postId) {
  const contentDiv = document.getElementById(`post${postId}-content`);
  const editButton = document.getElementById(`edit-button-${postId}`);
  editButton.remove()
  const val = contentDiv.innerHTML;

  const pContent = getParagraphContent();

  contentDiv.innerHTML = `
  <div class="form-group">
    <div class="form-group">
      <textarea name="content" cols="40" rows="4" id="edit-post${postId}-textarea" class="form-control" maxlength="300" required="">${pContent}</textarea>
    </div>
  </div>`

  createSubmitEditButton()


  function createSubmitEditButton() {
    const submitDiv = document.createElement('div')
    submitDiv.classList = 'text-right'
    const submitButton = document.createElement('button');
    submitButton.classList = "btn btn-primary text-right"
    submitButton.textContent = 'Edit';
    submitButton.onclick = () => editPost(postId)
    submitDiv.appendChild(submitButton)
    contentDiv.appendChild(submitDiv)
  }

  function getParagraphContent() {
    const temp = document.createElement('div');
    temp.innerHTML = val;
    const pContent = temp.querySelector('p').innerText;
    return pContent;
  }
}

function regeneratePostDiv(post) {
  const contentDiv = document.getElementById(`post-${post.id}`);
  const newContentDiv = createPostDiv(post);
  contentDiv.parentNode.replaceChild(newContentDiv, contentDiv);

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
  likesElement.innerHTML = `${numberOfLikes}`;
}

function alterButton(postId, isLiked) {
  const likeButton = document.getElementById(`like-button-${postId}`);
  const heartPath = likeButton.querySelector('.heart-path');
  heartPath.setAttribute('fill', isLiked ? 'red' : 'white');

}
