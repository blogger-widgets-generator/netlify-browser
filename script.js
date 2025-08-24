async function loadWebsite() {
    const urlInput = document.getElementById('urlInput').value;
    const websiteContent = document.getElementById('websiteContent');
    websiteContent.innerHTML = 'Loading...';

    try {
        const response = await fetch('/.netlify/functions/fetch-website?url=' + encodeURIComponent(urlInput));
        const data = await response.json();
        if (data.error) {
            websiteContent.innerHTML = 'Error: ' + data.error;
        } else {
            websiteContent.innerHTML = data.content;
        }
    } catch (error) {
        websiteContent.innerHTML = 'Error: Could not load website.';
    }
}