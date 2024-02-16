document.addEventListener('DOMContentLoaded', function () {
    const messageContainer = document.getElementById('message-container');
    const emojiMap = window.emojiMap;

    async function getMessagesFromFirebaseRealtime(callback) {
        try {
            const unsubscribe = onSnapshot(query(window.messagesRef, orderBy('timestamp')), (querySnapshot) => {
                const messages = [];
                querySnapshot.forEach(doc => {
                    messages.push(doc.data());
                });
                callback(messages);
            });
    
            return unsubscribe;
        } catch (error) {
            console.error('Error fetching messages:', error);
            return null;
        }
    }
    
    
    function displayMessagesRealtime() {
        getMessagesFromFirebaseRealtime(messages => {
            messageContainer.innerHTML = '';
    
            let lastUserId = null;
            let lastMessageDiv = null;
    
            messages.forEach(message => {
                const userId = message.uid;
    
                if (userId !== lastUserId) {
                    const messageDiv = document.createElement('div');
                    messageDiv.classList.add('message');
    
                    const usernameAndTimestamp = document.createElement('div');
                    usernameAndTimestamp.innerHTML = `<strong>${message.username}:</strong> <span>${new Date(message.timestamp).toLocaleString()}</span>`;
                    messageDiv.appendChild(usernameAndTimestamp);
    
                    const messageContent = document.createElement('div');
                    formatMessageContent(message.message, messageContent);
                    messageDiv.appendChild(messageContent);
    
                    messageContainer.appendChild(messageDiv);
    
                    lastUserId = userId;
                    lastMessageDiv = messageDiv;
                } else {
                    const messageContent = document.createElement('div');
                    formatMessageContent(message.message, messageContent);
                    lastMessageDiv.appendChild(messageContent);
                }
            });
    
            // After displaying messages, scroll to the bottom
            messageContainer.scrollTop = messageContainer.scrollHeight;
        });
    }
    
    function getEmojiSymbol(emojiKeyword) {
        return emojiMap[emojiKeyword] || null;
    }
    
    function formatMessageContent(message, messageContent) {
        const linkRegex = /(https?:\/\/[^\s]+)/g;
    
        let formattedContent = message
            // Handle headers
            .replace(/(^|\n)# (.*?)(?=\n|$)/g, '$1<h1>$2</h1>')
            .replace(/(^|\n)## (.*?)(?=\n|$)/g, '$1<h2>$2</h2>')
            .replace(/(^|\n)### (.*?)(?=\n|$)/g, '$1<h3>$2</h3>')
            // Handle bold formatting
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Handle italic formatting
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Handle strikethrough formatting
            .replace(/~~(.*?)~~/g, '<s>$1</s>')
            // Handle inline code formatting
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Handle block code formatting
            .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
            // Replace emoji keywords with corresponding emoji symbols
            .replace(/:([a-zA-Z0-9_+-]+):/g, (match, p1) => {
                const emojiSymbol = getEmojiSymbol(p1);
                return emojiSymbol ? emojiSymbol : match;
            })
            // Replace links
            .replace(linkRegex, (match) => {
                return `<a href="${match}" target="_blank">${match}</a>`;
            });
    
        messageContent.innerHTML = formattedContent;
    }
    

    // Initial display
    const unsubscribeRealtime = getMessagesFromFirebaseRealtime(displayMessagesRealtime)
});
