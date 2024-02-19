document.addEventListener('DOMContentLoaded', function () {
    const messageForm = document.getElementById('message-form');
    const displayNameBlock = document.getElementById('display-name-block');
    const usernameInput = document.getElementById('username');
    const confirmUsernameButton = document.getElementById('confirm-username');
    const usernameErrorText = document.getElementById('error-text');

    const usernameCookie = getCookie('username');

    if (usernameCookie) {
        usernameInput.value = usernameCookie;
        displayNameBlock.style.display = 'none';
        // Sign in anonymously with Firebase Auth
        signInAnonymously(auth)
            .then((userCredential) => {
                const user = userCredential.user;
                //console.log("Anonymous user signed in:", user.uid);
            })
            .catch((error) => {
                console.error("Error signing in anonymously:", error);
            });
    } else {
        // Blur and darken bg
        document.body.style.overflow = 'hidden';
        displayNameBlock.style.position = 'fixed';
        displayNameBlock.style.top = '0';
        displayNameBlock.style.left = '0';
        displayNameBlock.style.width = '100vw';
        displayNameBlock.style.height = '100vh';
        displayNameBlock.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        confirmUsernameButton.style.display = 'block'; // Show the Confirm button
        usernameErrorText.style.visibility = 'hidden';
    }

    confirmUsernameButton.addEventListener('click', function () {
        const username = usernameInput.value;
        if (username.trim() !== "") { // Validate that the username is not an empty string
            // Save username as a cookie
            setCookie('username', username, 365);
            signInAnonymously(auth)
            .then((userCredential) => {
                const user = userCredential.user;
                //console.log("Anonymous user signed in:", user.uid);
            })
            .catch((error) => {
                console.error("Error signing in anonymously:", error);
            });

            // Hide display name block and Confirm button
            displayNameBlock.style.display = 'none';
            confirmUsernameButton.style.display = 'none';

            // Allow scrolling again
            document.body.style.overflow = 'auto';
        } else {
            // Oopsie daisy
            console.error('Username cannot be empty.');
            usernameErrorText.style.visibility = 'visible';
            setTimeout(function () {
                usernameErrorText.style.visibility = 'hidden';
            }, 1250);
        }
    });

    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }
    
    function getCookie(name) {
        const cookieName = `${name}=`;
        const cookies = document.cookie.split(';');
    
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.startsWith(cookieName)) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
    
        return '';
    }

    messageForm.addEventListener('submit', async function (event) {
        event.preventDefault();
    
        const username = usernameInput.value;
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

    function parseMarkdown(message) {
        return message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }
});
