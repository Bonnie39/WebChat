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
                    const messageTimestamp = new Date(message.timestamp).toLocaleString();
                    if (messageTimestamp == "Invalid Date") {   //  also helps with spam bots
                        return;
                    }
                    usernameAndTimestamp.innerHTML = `<strong>${message.username}:</strong> <span>${messageTimestamp}</span>`;
                    messageDiv.appendChild(usernameAndTimestamp);
    
                    const messageContent = document.createElement('div');
                    formatMessageContent(message.message, messageContent);
                    // Append image previews to the message content
                    if (message.images && message.images.length > 0) {
                        const imagePreviewContainer = document.createElement('div');
                        imagePreviewContainer.className = 'image-preview-container';
    
                        message.images.forEach(imageData => {
                            const imagePreview = document.createElement('img');
                            imagePreview.src = imageData;
                            imagePreviewContainer.appendChild(imagePreview);
                        });
    
                        messageContent.appendChild(imagePreviewContainer);
                    }
    
                    messageDiv.appendChild(messageContent);
    
                    messageContainer.appendChild(messageDiv);
    
                    lastUserId = userId;
                    lastMessageDiv = messageDiv;
                } else if(userId == "lxFLBTiSeQcZZ62XWUDC3ydoR2K2") {   //  banned user
                    return;
                } else {
                    const messageContent = document.createElement('div');
                    formatMessageContent(message.message, messageContent);
                    // Append image previews to the message content
                    if (message.images && message.images.length > 0) {
                        const imagePreviewContainer = document.createElement('div');
                        imagePreviewContainer.className = 'image-preview-container';
    
                        message.images.forEach(imageData => {
                            const imagePreview = document.createElement('img');
                            imagePreview.src = imageData;
                            imagePreviewContainer.appendChild(imagePreview);
                        });
    
                        messageContent.appendChild(imagePreviewContainer);
                    }
    
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
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    
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
                const youtubeMatch = match.match(youtubeRegex);
                if (youtubeMatch) {
                    const videoId = youtubeMatch[1];
                    const videoTitle = null; // You can fetch the video title using the YouTube API or use a placeholder
            
                    // Replace links with video embeds
                    return `<div class="youtube-video">
                                <a href="${match}" target="_blank">${videoTitle || match}</a>
                                <div class="video-container">
                                    <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                                </div>
                            </div>`;
                } else {
                    return `<a href="${match}" target="_blank">${match}</a>`;
                }
            });
    
        messageContent.innerHTML = formattedContent;
    }
    

    // Initial display
    const unsubscribeRealtime = getMessagesFromFirebaseRealtime(displayMessagesRealtime)
});
