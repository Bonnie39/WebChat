document.addEventListener('DOMContentLoaded', function () {
    const messageForm = document.getElementById('message-form');

    messageForm.addEventListener('submit', async function (event) {
        event.preventDefault();
    
        console.log('Submit button clicked');
    
        const username = window.userDisplayName;
        const messageText = document.getElementById('message').value;
    
        // Gather media data from the image preview container
        const mediaPreviews = document.getElementById('image-preview-container').children;
        const mediaArray = [];
    
        console.log('Media previews count:', mediaPreviews.length);
    
        // Create a reference to the Firebase Storage bucket
        const storageRef = window.storageRef;
        const storage = window.storage;
    
        for (const mediaContainer of mediaPreviews) {
            // Get the image directly from the container
            const mediaImage = mediaContainer.querySelector('img');
            
            console.log('Media image found:', mediaImage);
    
            // Check if media image is found
            if (mediaImage && mediaImage.src) {
                console.log('Media source:', mediaImage.src);
    
                const fileId = generateUniqueFileName();
                const filePath = `media/${fileId}`;
                const fileRef = ref(storage, filePath);
    
                // Convert blob URL to Blob object
                const blob = await fetch(mediaImage.src).then(res => res.blob());
    
                const uploadTask = uploadBytes(fileRef, blob);
                const snapshot = await uploadTask;
    
                const downloadURL = await getDownloadURL(fileRef);
    
                mediaArray.push({ type: 'image', data: downloadURL });
            }
        }
    
        console.log('Media array:', mediaArray);
    
        // Check if there's text or media to send
        if ((messageText && messageText.trim() !== '') || mediaArray.length > 0) {
            console.log('Sending message to Firebase');
            
            const newMessage = {
                username: username,
                message: messageText,
                media: mediaArray,
                timestamp: Date.now(),
                uid: auth.currentUser.uid,
            };
    
            messageForm.reset();
            clearMediaPreviews();
            await addMessageToFirebase(newMessage);
        }
    });
    
    
    function generateUniqueFileName() {
        // Implement a function to generate a unique file name, e.g., using a timestamp
        return Date.now().toString();
    }
    
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
    
    async function getBase64Media(mediaElement) {
        if (!mediaElement) {
            console.error('Media element is undefined');
            return null;
        }
    
        try {
            const fileExtension = mediaElement.getAttribute('data-extension');
    
            if (fileExtension === 'gif') {
                // If it's a GIF, read the file as base64 data
                const gifBase64 = await convertGifToBase64(mediaElement.src);
                return gifBase64;
            } else if (mediaElement.tagName.toLowerCase() === 'img') {
                // If it's an image (static or GIF), convert and get base64 data
                return await getBase64Image(mediaElement);
            } else if (mediaElement.tagName.toLowerCase() === 'video') {
                // For regular videos, get base64 data
                return await getBase64Video(mediaElement);
            } else if (mediaElement.tagName.toLowerCase() === 'audio') {
                // For regular audio, get base64 data
                return await getBase64Audio(mediaElement);
            } else {
                console.error('Unsupported media type:', mediaElement.tagName);
                return null;
            }
        } catch (error) {
            console.error('Error converting media to base64:', error);
            return null;
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
    
    function convertGifToBase64(gifURL) {
        return new Promise((resolve) => {
            import("https://raw.githubusercontent.com/matt-way/gifuct-js/master/lib/index.js").then(({ parseGIF, decompressFrames }) => {
                fetch(gifURL)
                    .then(resp => resp.arrayBuffer())
                    .then(buff => {
                        var gif = parseGIF(buff);
                        var frames = decompressFrames(gif, true);
    
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
    
                        // Set canvas dimensions based on the gif dimensions
                        canvas.width = gif.width;
                        canvas.height = gif.height;
    
                        // Draw each frame on the canvas
                        frames.forEach((frame, index) => {
                            ctx.putImageData(frame, 0, 0);
                            gif.addFrame(ctx, { delay: gif.frames[index].delay * 10 }); // Adjust delay as needed
                        });
    
                        gif.on('finished', (blob) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });
    
                        gif.render();
                    });
            });
        });
    }
    
    // Function to clear previews container
    function clearMediaPreviews() {
        const mediaPreviewContainer = document.getElementById('image-preview-container');
        mediaPreviewContainer.innerHTML = '';
        mediaPreviewContainer.style.visibility = 'hidden';
    }
});
