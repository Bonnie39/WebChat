document.addEventListener('DOMContentLoaded', function () {
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const addImageButton = document.getElementById('add-image-button');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message');
    const maxImagePreviews = 4;

    imagePreviewContainer.style.visibility = 'hidden'; // make sure it's hidden on page load

    addImageButton.addEventListener('click', function () {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*, video/*, .gif';
        input.multiple = true;
        input.setAttribute('style', 'display: none');
        document.body.appendChild(input);

        input.click();

        let imagePreview = null;
        let videoPreview = null;

        // Add change event listener to handle selected files
        input.addEventListener('change', function () {
            // Display up to maxImagePreviews image previews
            for (let i = 0; i < Math.min(input.files.length, maxImagePreviews); i++) {
                // Create a container div for each image
                const imageContainer = document.createElement('div');
                imageContainer.className = 'image-container';
            
                // Create the image delete button
                const closeButton = document.createElement('button');
                closeButton.className = 'close-button';
                closeButton.innerHTML = 'X';
            
                const fileExtension = input.files[i].name.split('.').pop();
            
                if (fileExtension === "png" || fileExtension === "jpg" || fileExtension === "gif") {
                    // Create the image preview
                    imagePreview = document.createElement('img');
                    imagePreview.src = URL.createObjectURL(input.files[i]);
                    // imagePreview.setAttribute('data-extension', fileExtension);
                } else if (fileExtension === "mp4") {
                    videoPreview = document.createElement('video');
                    videoPreview.src = URL.createObjectURL(input.files[i]);
                }
            
                // Add close button click event listener to remove the image
                closeButton.addEventListener('click', function () {
                    imageContainer.remove();
                    toggleImageContainerVisibility();
                });
            
                // Append elements to the container div
                imageContainer.appendChild(closeButton);
                if (imagePreview !== null) {
                    imageContainer.appendChild(imagePreview);
                }
                if (videoPreview !== null) {
                    imageContainer.appendChild(videoPreview);
                }
            
                // Append the container div to the image preview container
                imagePreviewContainer.appendChild(imageContainer);
            }

            toggleImageContainerVisibility();

            // Clear the file input to allow adding more images
            input.value = '';

            messageInput.focus();
        });

        messageForm.appendChild(input);
    });

    function toggleImageContainerVisibility() {
        imagePreviewContainer.style.visibility = imagePreviewContainer.children.length > 0 ? 'visible' : 'hidden';
    }
});
