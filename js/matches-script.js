/**
 * Simplified Matches Script - Fetches and displays user profiles as cards
 */

// Global variables
let currentUser = null;
let userProfiles = [];
let currentProfileIndex = 0;

/**
 * Initialize matches page
 */
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

/**
 * Initialize the matches page
 */
async function initializePage() {
    try {
        // Get current user
        await loadCurrentUser();
        
        // Load user profiles
        await loadUserProfiles();
        
        // Display first profile
        displayCurrentProfile();
        
    } catch (error) {
        console.error('Error initializing matches page:', error);
        showError('Failed to load profiles. Please try again.');
    }
}

/**
 * Load current user data
 */
async function loadCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load user data');
        }

        const result = await response.json();
        currentUser = result.data;
        
    } catch (error) {
        console.error('Error loading current user:', error);
        // Redirect to login on error
        window.location.href = '/login.html';
    }
}

/**
 * Load user profiles from MongoDB
 */
async function loadUserProfiles() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        showLoading(true);
        
        const response = await fetch('/api/users/discover', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load profiles');
        }

        const result = await response.json();
        userProfiles = result.data || [];
        
        if (userProfiles.length === 0) {
            showNoProfiles();
        } else {
            updateProfileCounter();
        }
        
    } catch (error) {
        console.error('Error loading user profiles:', error);
        showError('Failed to load user profiles');
    } finally {
        showLoading(false);
    }
}

/**
 * Display current profile card
 */
function displayCurrentProfile() {
    if (userProfiles.length === 0) {
        showNoProfiles();
        return;
    }

    const profile = userProfiles[currentProfileIndex];
    const cardContainer = document.getElementById('profileCardContainer');
    
    if (!cardContainer) return;

    // Create profile card HTML
    cardContainer.innerHTML = createProfileCard(profile);
    
    // Add event listeners for action buttons
    setupCardActions(profile);
}

/**
 * Create profile card HTML
 */
function createProfileCard(profile) {
    const skillsHtml = profile.skills && profile.skills.length > 0 
        ? profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')
        : '<span class="no-skills">No skills listed</span>';

    const portfolioLink = profile.portfolioUrl 
        ? `<a href="${profile.portfolioUrl}" target="_blank" class="profile-link"><i class="fas fa-external-link-alt"></i> Portfolio</a>`
        : '';

    const githubLink = profile.githubUsername 
        ? `<a href="https://github.com/${profile.githubUsername}" target="_blank" class="profile-link"><i class="fab fa-github"></i> GitHub</a>`
        : '';

    return `
        <div class="profile-card">
            <div class="card-header">
                <h2 class="profile-name">${profile.fullName || 'Unknown User'}</h2>
                <p class="profile-role">${profile.role || 'No role specified'}</p>
            </div>
            
            <div class="card-body">
                <div class="profile-bio">
                    <h3>About</h3>
                    <p>${profile.bio || 'No bio available'}</p>
                </div>
                
                <div class="profile-skills">
                    <h3>Skills</h3>
                    <div class="skills-container">
                        ${skillsHtml}
                    </div>
                </div>
                
                <div class="profile-links">
                    ${portfolioLink}
                    ${githubLink}
                </div>
            </div>
            
            <div class="card-actions">
                <button class="action-btn skip-btn" onclick="skipProfile()">
                    <i class="fas fa-times"></i> Skip
                </button>
                <button class="action-btn connect-btn" onclick="connectProfile('${profile._id}')">
                    <i class="fas fa-heart"></i> Connect
                </button>
            </div>
        </div>
    `;
}

/**
 * Setup card action buttons
 */
function setupCardActions(profile) {
    // Action buttons are already setup via onclick in the HTML
}

/**
 * Skip current profile
 */
function skipProfile() {
    currentProfileIndex++;
    
    if (currentProfileIndex >= userProfiles.length) {
        // Loop back to first profile
        currentProfileIndex = 0;
    }
    
    displayCurrentProfile();
    updateProfileCounter();
}

/**
 * Connect with current profile
 */
async function connectProfile(targetUserId) {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        showLoading(true);
        
        const response = await fetch('/api/matches/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ targetUserId })
        });

        if (!response.ok) {
            throw new Error('Failed to send connection request');
        }

        const result = await response.json();
        
        // Show success message
        showMessage('Connection request sent!', 'success');
        
        // Move to next profile
        setTimeout(() => {
            skipProfile();
        }, 1500);
        
    } catch (error) {
        console.error('Error sending connection:', error);
        showMessage('Failed to send connection request', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Update profile counter
 */
function updateProfileCounter() {
    const counterElement = document.getElementById('profileCounter');
    if (counterElement) {
        counterElement.textContent = `${currentProfileIndex + 1} of ${userProfiles.length}`;
    }
}

/**
 * Show loading state
 */
function showLoading(show) {
    const loadingElement = document.getElementById('loadingIndicator');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

/**
 * Show no profiles message
 */
function showNoProfiles() {
    const cardContainer = document.getElementById('profileCardContainer');
    if (cardContainer) {
        cardContainer.innerHTML = `
            <div class="no-profiles">
                <i class="fas fa-users-slash"></i>
                <h3>No Profiles Available</h3>
                <p>Check back later for new profiles!</p>
            </div>
        `;
    }
}

/**
 * Show error message
 */
function showError(message) {
    const cardContainer = document.getElementById('profileCardContainer');
    if (cardContainer) {
        cardContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="initializePage()" class="retry-btn">Try Again</button>
            </div>
        `;
    }
}

/**
 * Show message to user
 */
function showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// Make functions global for HTML onclick handlers
window.skipProfile = skipProfile;
window.connectProfile = connectProfile;