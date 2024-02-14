document.addEventListener('DOMContentLoaded', function () {
    const messageContainer = document.getElementById('message-container');
    const messageForm = document.getElementById('message-form');
    const displayNameBlock = document.getElementById('display-name-block');
    const usernameInput = document.getElementById('username');
    const confirmUsernameButton = document.getElementById('confirm-username');
    const usernameErrorText = document.getElementById('error-text');

    const usernameCookie = getCookie('username');

    // Existing code for handling display name block
    if (usernameCookie) {
        usernameInput.value = usernameCookie;
        displayNameBlock.style.display = 'none';
        // Sign in anonymously with Firebase Auth
        signInAnonymously(auth)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Anonymous user signed in:", user.uid);
            })
            .catch((error) => {
                console.error("Error signing in anonymously:", error);
            });
    } else {
        // Show the full-screen black background with blur
        document.body.style.overflow = 'hidden';
        displayNameBlock.style.position = 'fixed';
        displayNameBlock.style.top = '0';
        displayNameBlock.style.left = '0';
        displayNameBlock.style.width = '100vw';
        displayNameBlock.style.height = '100vh';
        displayNameBlock.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        displayNameBlock.style.backdropFilter = 'blur(5px)';
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
            // Show an error message or handle it accordingly
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

    // Event listener for form submission
    messageForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const username = usernameInput.value;
        const messageText = document.getElementById('message').value;

        if (username && messageText) {
            // Save username as a cookie
            setCookie('username', username, 365);

            // Hide display name block if not hidden
            displayNameBlock.style.display = 'none';

            const newMessage = {
                username: username,
                message: messageText,
                timestamp: new Date().toISOString(),
                uid: auth.currentUser.uid,
            };

            await addMessageToFirebase(newMessage);
            messageForm.reset();
            displayMessages();
        }
    });

    async function addMessageToFirebase(message) {
        try {
            // Add a new document to the "messages" collection
            const docRef = await addDoc(window.messagesRef, message);
            console.log('Message added successfully with ID:', docRef.id);
        } catch (error) {
            console.error('Error adding message:', error);
        }
    }

    async function getMessagesFromFirebase() {
        try {
            // Retrieve messages from Firebase Firestore
            const querySnapshot = await getDocs(query(window.messagesRef, orderBy('timestamp')));
    
            const messages = [];
    
            querySnapshot.forEach(doc => {
                messages.push(doc.data());
            });
    
            return messages;
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    function displayMessages() {
        getMessagesFromFirebase()
            .then(messages => {
                messageContainer.innerHTML = '';

                messages.forEach(message => {
                    const messageDiv = document.createElement('div');
                    messageDiv.classList.add('message');
                    messageDiv.innerHTML = `<strong>${message.username}:</strong> ${message.message} <span>${new Date(message.timestamp).toLocaleString()}</span>`;
                    messageContainer.appendChild(messageDiv);
                });
            })
            .then(() => {
                // After displaying messages, scroll to the bottom
                messageContainer.scrollTop = messageContainer.scrollHeight;
            })
            .catch(error => {
                console.error('Error displaying messages:', error);
            });
    }

    // Initial display
    displayMessages();
});
