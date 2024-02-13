document.addEventListener('DOMContentLoaded', function () {
    const messageContainer = document.getElementById('message-container');
    const messageForm = document.getElementById('message-form');

    messageForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const messageText = document.getElementById('message').value;

        if (username && messageText) {
            const newMessage = {
                username: username,
                message: messageText,
                timestamp: new Date().toLocaleString()
            };

            addMessageToJSON(newMessage);
            displayMessages();
            messageForm.reset();
        }
    });

    function addMessageToJSON(message) {
        const currentMessages = getMessagesFromJSON();
        currentMessages.push(message);

        const jsonString = JSON.stringify(currentMessages, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'messages.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    function getMessagesFromJSON() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'messages.json', false);
    
        try {
            xhr.send();
            return JSON.parse(xhr.responseText) || [];
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return [];
        }
    }
    

    function displayMessages() {
        const messages = getMessagesFromJSON();
        messageContainer.innerHTML = '';

        messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.innerHTML = `<strong>${message.username}:</strong> ${message.message} <span>${message.timestamp}</span>`;
            messageContainer.appendChild(messageDiv);
        });
    }

    // Initial display
    displayMessages();
});
