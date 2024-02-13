document.addEventListener('DOMContentLoaded', function () {
    const messageContainer = document.getElementById('message-container');
    const messageForm = document.getElementById('message-form');

    const base64Token = 'Z2hwX3A0azNGeUZVcXlDVThlWWl1WmVudXpEcXRTWTFRaDBNa0hsdQ==';
    const decodedToken = atob(base64Token);

    messageForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const messageText = document.getElementById('message').value;

        if (username && messageText) {
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
                content: btoa(unescape(encodeURIComponent(jsonString))),
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
                const parsedData = JSON.parse(content);
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
                    messageDiv.innerHTML = `<strong>${message.username}:</strong> ${message.message} <span>${message.timestamp}</span>`;
                    messageContainer.appendChild(messageDiv);
                });
            })
            .catch(error => {
                console.error('Error displaying messages:', error);
            });
    }

    // Initial display
    displayMessages();
});
