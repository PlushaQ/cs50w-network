import { showPosts, getCookie } from "./index.js";

document.addEventListener('DOMContentLoaded', function() {
  const username = document.getElementById('profile-username').innerHTML;
  document.getElementById('follow-button').addEventListener('click', () => processFollowUnfollow(username));
  showPosts('followers');
  });


function changeButtonStyle(isFollowing) {
  const followButton = document.getElementById('follow-button');
  followButton.textContent = isFollowing ? 'Unfollow': 'Follow';
  
  if (!isFollowing) { 
    followButton.classList.replace('following', 'not-following')
  }
  else {
    followButton.classList.replace('not-following', 'following')
  }
}

function changeNumberOfFollowers(numberOfFollowers) {
  const followersCount = document.getElementById('followers');
  followersCount.innerHTML = `Followers: ${numberOfFollowers}`;
}

function processFollowUnfollow(username) {
  const csrftoken = getCookie('csrftoken');
  fetch(`follow/${username}`, {
    method: "POST",
    headers: {
      'X-CSRFToken': csrftoken,
    },
  }).then(
    response => response.json()
  ).then(response => {
    console.log(response);
    changeButtonStyle(response.is_following);
    changeNumberOfFollowers(response.number_of_followers);
  })
  }
