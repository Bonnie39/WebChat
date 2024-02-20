document.addEventListener('DOMContentLoaded', function () {
    const messageForm = document.getElementById('message-form');

    messageForm.addEventListener('submit', async function (event) {
        event.preventDefault();
    
        const username = window.userDisplayName;
        const messageText = document.getElementById('message').value;
    
        // Gather image data from the image preview container
        const imagePreviews = document.getElementById('image-preview-container').children;
        const imageArray = [];
    
        for (const imageContainer of imagePreviews) {
            const image = imageContainer.querySelector('img');
            if (image) {
                // Convert the image to base64 and add to the array
                const base64Image = await getBase64Image(image);
                imageArray.push(base64Image);
            }
        }
    
        // Check if there's text or images to send
        if ((messageText && messageText.trim() !== '') || imageArray.length > 0) {
            const newMessage = {
                username: username,
                message: messageText,
                images: imageArray,
                timestamp: Date.now(),
                uid: auth.currentUser.uid,
            };
    
            messageForm.reset();
            clearImagePreviews();
            await addMessageToFirebase(newMessage);
        }
    });
    
    async function addMessageToFirebase(message) {
        if (message.username != "") {
            try {
                // Add a new document to the "messages" collection
                const docRef = await addDoc(window.messagesRef, {
                    ...message,
                });
                console.log('Message added successfully with ID:', docRef.id);
            } catch (error) {
                console.error('Error adding message:', error);
            }
        }
    }
    
    // Function to convert image to base64
    function getBase64Image(img) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
    
            ctx.drawImage(img, 0, 0, img.width, img.height);
    
            canvas.toBlob((blob) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        });
    }
    
    // Function to clear image previews container
    function clearImagePreviews() {
        const imagePreviewContainer = document.getElementById('image-preview-container');
        imagePreviewContainer.innerHTML = '';
        imagePreviewContainer.style.visibility = 'hidden';
    }
});
