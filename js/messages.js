// Chat functionality for messages.html

class ChatManager {
    constructor() {
        this.currentUser = null;
        this.matchUser = null;
        this.matchId = null;
        this.messages = [];
        this.socket = null;
        
        this.initializeChat();
    }

    async initializeChat() {
        // Get match ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.matchId = urlParams.get('matchId');
        
        if (!this.matchId) {
            // Fallback to localStorage if no matchId in URL
            const lastMatch = localStorage.getItem('lastMatch');
            if (lastMatch) {
                this.matchId = JSON.parse(lastMatch).matchId;
                this.matchUser = JSON.parse(lastMatch);
            }
        }

        // Load current user info
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const userData = await response.json();
                this.currentUser = userData;
            } catch (error) {
                console.error('Error loading user:', error);
            }
        }

        // Load match info
        await this.loadMatchInfo();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load existing messages
        await this.loadMessages();
        
        // Setup WebSocket connection
        this.setupWebSocket();
    }

    async loadMatchInfo() {
        if (!this.matchId) return;

        try {
            const response = await fetch(`/api/matches/${this.matchId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const matchData = await response.json();
                this.matchUser = matchData.matchedUser;
                
                // Update UI with match info
                document.getElementById('matchName').textContent = this.matchUser.name;
                document.getElementById('matchNameSpan').textContent = this.matchUser.name;
                
                if (this.matchUser.avatar) {
                    document.getElementById('matchAvatar').src = this.matchUser.avatar;
                }
            }
        } catch (error) {
            console.error('Error loading match:', error);
        }
    }

    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const emojiBtn = document.getElementById('emojiBtn');
        const attachBtn = document.getElementById('attachBtn');

        // Send message on button click
        sendBtn.addEventListener('click', () => this.sendMessage());

        // Send message on Enter key
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Emoji button
        emojiBtn.addEventListener('click', () => {
            // Simple emoji picker (you can enhance this)
            const emojis = ['😊', '❤️', '👍', '😂', '🎉', '🔥', '💯', '✨'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            messageInput.value += randomEmoji;
            messageInput.focus();
        });

        // File attachment
        attachBtn.addEventListener('click', () => {
            this.handleFileAttachment();
        });
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();

        if (!message || !this.matchId) return;

        const messageData = {
            matchId: this.matchId,
            content: message,
            senderId: this.currentUser.id,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(messageData)
            });

            if (response.ok) {
                const savedMessage = await response.json();
                this.displayMessage(savedMessage, true);
                messageInput.value = '';
                
                // Scroll to bottom
                this.scrollToBottom();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    async loadMessages() {
        if (!this.matchId) return;

        try {
            const response = await fetch(`/api/messages/${this.matchId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const messages = await response.json();
                this.messages = messages;
                
                // Display all messages
                messages.forEach(message => {
                    const isSent = message.senderId === this.currentUser.id;
                    this.displayMessage(message, isSent);
                });
                
                this.scrollToBottom();
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    displayMessage(message, isSent = false) {
        const messagesArea = document.getElementById('messagesArea');
        
        // Remove welcome message if it exists
        const welcomeMessage = messagesArea.querySelector('.welcome-message');
        if (welcomeMessage && this.messages.length > 0) {
            welcomeMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;

        const time = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageDiv.innerHTML = `
            <div class="message-avatar"></div>
            <div class="message-content">
                <p>${this.escapeHtml(message.content)}</p>
                <div class="message-time">${time}</div>
            </div>
        `;

        messagesArea.appendChild(messageDiv);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        const messagesArea = document.getElementById('messagesArea');
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    setupWebSocket() {
        // Simple WebSocket simulation (you can replace with real WebSocket)
        // For now, we'll poll for new messages every 5 seconds
        setInterval(() => {
            this.checkForNewMessages();
        }, 5000);
    }

    async checkForNewMessages() {
        if (!this.matchId || !this.messages.length) return;

        const lastMessage = this.messages[this.messages.length - 1];
        const lastTimestamp = lastMessage ? lastMessage.timestamp : new Date().toISOString();

        try {
            const response = await fetch(`/api/messages/${this.matchId}?after=${lastTimestamp}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const newMessages = await response.json();
                newMessages.forEach(message => {
                    if (message.senderId !== this.currentUser.id) {
                        this.displayMessage(message, false);
                        this.messages.push(message);
                    }
                });
                
                if (newMessages.length > 0) {
                    this.scrollToBottom();
                }
            }
        } catch (error) {
            console.error('Error checking for new messages:', error);
        }
    }

    handleFileAttachment() {
        // Create file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,video/*,.pdf,.doc,.docx';
        
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Show file upload progress
            this.showUploadProgress(file.name);

            // Simulate file upload (replace with actual upload logic)
            setTimeout(() => {
                this.hideUploadProgress();
                this.sendMessageWithFile(file);
            }, 2000);
        };
        
        fileInput.click();
    }

    showUploadProgress(filename) {
        const messagesArea = document.getElementById('messagesArea');
        const progressDiv = document.createElement('div');
        progressDiv.className = 'message sent';
        progressDiv.id = 'uploadProgress';
        progressDiv.innerHTML = `
            <div class="message-content">
                <p>📎 Uploading ${filename}...</p>
                <div class="loading"></div>
            </div>
        `;
        messagesArea.appendChild(progressDiv);
        this.scrollToBottom();
    }

    hideUploadProgress() {
        const progressDiv = document.getElementById('uploadProgress');
        if (progressDiv) {
            progressDiv.remove();
        }
    }

    sendMessageWithFile(file) {
        // For now, just send a text message about the file
        // In a real app, you'd upload the file and send the URL
        const messageInput = document.getElementById('messageInput');
        messageInput.value = `📎 Shared a file: ${file.name}`;
        this.sendMessage();
    }
}

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatManager();
});