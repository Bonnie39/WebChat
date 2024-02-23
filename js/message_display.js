document.addEventListener('DOMContentLoaded', function () {
    const messageContainer = document.getElementById('message-container');
    const emojiMap = window.emojiMap;

    async function renderGif(container, gifURL) {
        return new Promise((resolve) => {
            const gif = new GIF({
                workers: 2,
                quality: 10,
                width: container.clientWidth,
                height: container.clientHeight,
            });
    
            const img = new Image();
            img.src = gifURL;
    
            img.onload = () => {
                gif.addFrame(img, { delay: 200 }); // Set the delay as needed
                gif.on('finished', (blob) => {
                    const imgElement = document.createElement('img');
                    imgElement.src = URL.createObjectURL(blob);
                    container.appendChild(imgElement);
                    resolve();
                });
    
                gif.render();
            };
        });
    }

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
        getMessagesFromFirebaseRealtime(async (messages) => {
            messageContainer.innerHTML = '';
    
            let lastUserId = null;
            let lastMessageDiv = null;
    
            for (const message of messages) {
                const userId = message.uid;
    
                if (userId !== lastUserId) {
                    const messageDiv = document.createElement('div');
                    messageDiv.classList.add('message');
    
                    const usernameAndTimestamp = document.createElement('div');
                    const messageTimestamp = new Date(message.timestamp).toLocaleString();
                    if (messageTimestamp == "Invalid Date") {
                        // Also helps with spam bots
                        return;
                    }
                    if (message.username == "") {
                        return;
                    }
                    usernameAndTimestamp.innerHTML = `<strong>${message.username}:</strong> <span>${messageTimestamp}</span>`;
                    messageDiv.appendChild(usernameAndTimestamp);
    
                    const messageContent = document.createElement('div');
                    formatMessageContent(message.message, messageContent);
    
                    const mediaPreviewContainer = document.createElement('div');
                    mediaPreviewContainer.className = 'media-preview-container';
                    await appendMediaPreviews(message, mediaPreviewContainer);
    
                    messageDiv.appendChild(messageContent);
                    messageDiv.appendChild(mediaPreviewContainer);
    
                    messageContainer.appendChild(messageDiv);
    
                    lastUserId = userId;
                    lastMessageDiv = messageDiv;
                } else if (userId == "lxFLBTiSeQcZZ62XWUDC3ydoR2K2") {   //  banned user
                    return;
                } else {
                    const messageContent = document.createElement('div');
                    formatMessageContent(message.message, messageContent);
    
                    const mediaPreviewContainer = document.createElement('div');
                    mediaPreviewContainer.className = 'media-preview-container';
                    await appendMediaPreviews(message, mediaPreviewContainer);
    
                    lastMessageDiv.appendChild(messageContent);
                    lastMessageDiv.appendChild(mediaPreviewContainer);
                }
            }
    
            var numberOfScrolls = 3;
    
            // After displaying messages, scroll to the bottom
            for (var i = 0; i < numberOfScrolls; i++) {
                setTimeout(scrollToBottom, i * 360); // Adjust the delay (in milliseconds) as needed
            }
        });
    }
    
    async function appendMediaPreviews(message, mediaPreviewContainer) {
        if (message.media && message.media.length > 0) {
            for (const mediaData of message.media) {
                const mediaElement = await createMediaElement(mediaData);
                if (mediaElement && typeof mediaElement === 'object') {
                    mediaPreviewContainer.appendChild(mediaElement);
                } else {
                    console.error('Invalid media element:', mediaElement);
                }
            }
        }
    }
    
    // Update createMediaElement to handle GIF rendering
    async function createMediaElement(mediaData) {
        if (!mediaData || !mediaData.type || !mediaData.data) {
            console.error('Invalid media data:', mediaData);
            return null;
        }
    
        const mediaElement = document.createElement(mediaData.type === 'image' ? 'img' : mediaData.type);
    
        if (mediaData.type === 'img' || mediaData.type === 'image') {
            mediaElement.src = mediaData.data;
        } else if (mediaData.type === 'video' || mediaData.type === 'audio') {
            mediaElement.src = mediaData.data;
            mediaElement.controls = true;
        } else if (mediaData.type === 'gif') {
            // Handle GIF rendering using gif.js
            await renderGif(mediaElement, mediaData.data);
        } else {
            console.error('Unsupported media type:', mediaData.type);
            return null;
        }
    
        return mediaElement;
    }
    
    function scrollToBottom() {
        messageContainer.scrollTop = messageContainer.scrollHeight;
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
            
                    // Replace links with video embeds
                    return `<div class="youtube-video">
                                <a href="${match}" target="_blank">${match}</a>
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
