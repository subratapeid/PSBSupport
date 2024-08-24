// Function to load the content of a file into a specified element
function loadHTML(elementId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => console.error('Error loading file:', error));
}

// Load the header and footer when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    loadHTML('header', 'include/header.html');
    loadHTML('footer', 'include/footer.html');
});
