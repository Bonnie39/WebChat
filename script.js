document.addEventListener('DOMContentLoaded', function () {
    const messageContainer = document.getElementById('message-container');
    const messageForm = document.getElementById('message-form');
    const displayNameBlock = document.getElementById('display-name-block');
    const usernameInput = document.getElementById('username');
    const confirmUsernameButton = document.getElementById('confirm-username');
    const usernameErrorText = document.getElementById('error-text');

    const decodedToken = String.fromCharCode(103, 104, 112, 95, 98, 50, 98, 79, 68, 98, 67, 85, 65, 84, 99, 85, 84, 102, 105, 69, 114, 120, 75, 110, 112, 100, 66, 100, 82, 50, 78, 105, 50, 49, 52, 102, 77, 81, 65, 83);

    const usernameCookie = getCookie('username');

    if (usernameCookie) {
        usernameInput.value = usernameCookie;
        displayNameBlock.style.display = 'none';
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
                timestamp: new Date().toLocaleString(),
            };

            await addMessageToJSON(newMessage);
            messageForm.reset();
            displayMessages();
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


    async function addMessageToJSON(message) {
        try {
            const currentMessages = await getMessagesFromJSON();
            currentMessages.push(message);

            const jsonString = JSON.stringify(currentMessages, null, 2);
            const sha = await getSHAOfMessagesJSON();

            await updateMessagesInGitHub(jsonString, sha);
        } catch (error) {
            console.error('Error adding message:', error);
        }
    }

    async function updateMessagesInGitHub(jsonString, sha) {
        const response = await fetch('https://api.github.com/repos/Bonnie39/WebChat/contents/messages.json', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${decodedToken}`,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                path: 'messages.json',
                message: 'Update messages.json',
                content: btoa(unescape(encodeURIComponent(jsonString))).replace(/[\u00A0-\u2666]/g, function(c) {
                    return '&#' + c.charCodeAt(0) + ';';
                }),
                sha: sha,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update messages.json: ${response.statusText}`);
        }

        console.log('Message added successfully.');
    }

    async function getSHAOfMessagesJSON() {
        try {
            const response = await fetch('https://api.github.com/repos/Bonnie39/WebChat/contents/messages.json', {
                headers: {
                    'Authorization': `Bearer ${decodedToken}`,
                    'Content-Type': 'application/json;charset=UTF-8',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch messages.json SHA: ${response.statusText}`);
            }

            const data = await response.json();
            return data.sha;
        } catch (error) {
            console.error('Error fetching messages.json SHA:', error);
            return null;
        }
    }

    async function getMessagesFromJSON() {
        try {
            const response = await fetch('https://api.github.com/repos/Bonnie39/WebChat/contents/messages.json', {
                headers: {
                    'Authorization': `Bearer ${decodedToken}`,
                    'Content-Type': 'application/json;charset=UTF-8',
                },
            });
    
            if (!response.ok) {
                throw new Error(`Failed to fetch messages.json: ${response.statusText}`);
            }
    
            const data = await response.json();
    
            if (data && data.content) {
                const content = atob(data.content);
                const decodedContent = new TextDecoder('utf-8').decode(Uint8Array.from(content, c => c.charCodeAt(0)));
                const parsedData = JSON.parse(decodedContent);
                return parsedData;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error fetching messages.json:', error);
            return [];
        }
    }
    

    function displayMessages() {
        getMessagesFromJSON()
            .then(messages => {
                messageContainer.innerHTML = '';
    
                messages.forEach(message => {
                    const messageDiv = document.createElement('div');
                    messageDiv.classList.add('message');
                    messageDiv.innerHTML = `<strong>${message.username}:</strong> ${message.message} <span>${message.timestamp}</span>`;
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
