document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('id_content').addEventListener('input', () => countChars());
});


function countChars() {
    let text = document.getElementById('id_content').value;
    let charCount = 300 - text.length;
    document.getElementById('char-counter').innerText = `Remaining characters: ${charCount}`
}