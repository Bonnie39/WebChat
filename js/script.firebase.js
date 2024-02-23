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
            const mediaVideo = mediaContainer.querySelector('video');
            
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
                await uploadTask;
    
                const downloadURL = await getDownloadURL(fileRef);
    
                mediaArray.push({ type: 'image', data: downloadURL });
            } else if (mediaVideo && mediaVideo.src) {
                console.log('Media Source:', mediaVideo.src);

                const fileId = generateUniqueFileName();
                const filePath = `media/${fileId}`;
                const fileRef = ref(storage, filePath);
    
                // Convert blob URL to Blob object
                const blob = await fetch(mediaVideo.src).then(res => res.blob());
    
                const uploadTask = uploadBytes(fileRef, blob);
                await uploadTask;
    
                const downloadURL = await getDownloadURL(fileRef);
    
                mediaArray.push({ type: 'video', data: downloadURL });
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
    
    // Function to clear previews container
    function clearMediaPreviews() {
        const mediaPreviewContainer = document.getElementById('image-preview-container');
        mediaPreviewContainer.innerHTML = '';
        mediaPreviewContainer.style.visibility = 'hidden';
    }
});
