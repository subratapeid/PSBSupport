function loadHTML(elementId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            // Insert the content into the target element
            document.getElementById(elementId).innerHTML = data;

            // Create a temporary div to parse the loaded HTML content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;

            // Handle <link> tags (CSS)
            const linkTags = tempDiv.querySelectorAll('link[rel="stylesheet"]');
            linkTags.forEach(linkTag => {
                document.head.appendChild(linkTag.cloneNode(true));
            });

            // Handle <script> tags (JS)
            const scriptTags = tempDiv.querySelectorAll('script');
            scriptTags.forEach(scriptTag => {
                const newScript = document.createElement('script');
                if (scriptTag.src) {
                    newScript.src = scriptTag.src;
                } else {
                    newScript.innerHTML = scriptTag.innerHTML;
                }
                document.body.appendChild(newScript);
            });
        })
        .catch(error => console.error('Error loading file:', error));
}

// Load the header and footer when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    loadHTML('header', 'include/header.html');
    loadHTML('footer', 'include/footer.html');
});
