// Swipe/Match Page JavaScript

// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const sidebar = document.querySelector('.sidebar');

function toggleMobileMenu() {
    sidebar.classList.toggle('active');
    const icon = mobileMenuToggle.querySelector('i');
    if (sidebar.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

// Close mobile menu when clicking outside
function closeMobileMenu(event) {
    if (!sidebar.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
        sidebar.classList.remove('active');
        const icon = mobileMenuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

// Initialize mobile menu functionality
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    document.addEventListener('click', closeMobileMenu);
}

// Navigation item interactions
const navItems = document.querySelectorAll('.nav-item');

function handleNavClick(event) {
    event.preventDefault();
    
    // Remove active class from all nav items
    navItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to clicked item
    this.classList.add('active');
    
    // Add click animation
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
        this.style.transform = '';
    }, 150);
}

// Add click handlers to nav items
navItems.forEach(item => {
    item.addEventListener('click', handleNavClick);
});

// Tinder-like swipe functionality
let currentCardIndex = 0;
let isAnimating = false;

function initSwipeCards() {
    const cards = document.querySelectorAll('.profile-card');
    
    cards.forEach((card, index) => {
        card.style.zIndex = cards.length - index;
        card.style.transform = 'scale(' + (20 - index) / 20 + ') translateY(-' + (index * 10) + 'px)';
        
        // Initialize interact.js for each card
        interact(card).draggable({
            inertia: false,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            autoScroll: true,
            listeners: {
                move: dragMoveListener,
                end: dragEndListener
            }
        });
    });
}

function dragMoveListener(event) {
    const target = event.target;
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + (x * 0.1) + 'deg)';
    
    // Add visual feedback
    if (x > 50) {
        target.classList.add('like');
        target.classList.remove('nope');
    } else if (x < -50) {
        target.classList.add('nope');
        target.classList.remove('like');
    } else {
        target.classList.remove('like', 'nope');
    }

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

function dragEndListener(event) {
    const target = event.target;
    const x = parseFloat(target.getAttribute('data-x')) || 0;
    
    if (Math.abs(x) > 100) {
        // Card was swiped
        if (x > 0) {
            swipeRight(target);
        } else {
            swipeLeft(target);
        }
    } else {
        // Return to center
        target.style.transform = 'translate(0px, 0px) rotate(0deg)';
        target.setAttribute('data-x', 0);
        target.setAttribute('data-y', 0);
        target.classList.remove('like', 'nope');
    }
}

function swipeRight(card) {
    if (isAnimating) return;
    isAnimating = true;

    const userId = card.dataset.userId;

    // Animate card flying right
    card.style.transform = 'translate(1000px, -100px) rotate(30deg)';
    card.style.opacity = '0';

    setTimeout(() => {
        card.style.display = 'none';
        currentCardIndex++;
        showNextCard();
        isAnimating = false;

        // Create a match
        fetch('/api/matches', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ matchedUserId: userId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store match info in localStorage for the chat page
                localStorage.setItem('lastMatch', JSON.stringify({
                    matchId: data.matchId,
                    matchedUser: {
                        id: userId,
                        name: card.querySelector('.user-name').textContent,
                        avatar: '' // No avatar in current structure
                    }
                }));
                // Redirect to new messages page
                window.location.href = `/html/messages.html?matchId=${data.matchId}`;
            } else {
                console.error('Failed to create match:', data.message);
            }
        })
        .catch(error => {
            console.error('Error creating match:', error);
        });
    }, 300);
}

function swipeLeft(card) {
    if (isAnimating) return;
    isAnimating = true;
    
    card.classList.add('nope');
    
    // Animate card flying left
    card.style.transform = 'translate(-1000px, -100px) rotate(-30deg)';
    card.style.opacity = '0';
    
    setTimeout(() => {
        card.style.display = 'none';
        currentCardIndex++;
        showNextCard();
        isAnimating = false;
        
        // Trigger pass action
        const passBtn = document.querySelector('.pass-btn');
        if (passBtn) {
            passBtn.click();
        }
    }, 300);
}

function showNextCard() {
    const cards = document.querySelectorAll('.profile-card');
    const nextCard = cards[currentCardIndex];
    
    if (nextCard) {
        nextCard.style.transform = 'scale(1) translateY(0px)';
        nextCard.style.opacity = '1';
    } else {
        // No more cards
        console.log('No more profiles');
    }
}

// Initialize swipe cards when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for interact.js to load
    if (typeof interact !== 'undefined') {
        initSwipeCards();
    } else {
        // Fallback: try again after a short delay
        setTimeout(function() {
            if (typeof interact !== 'undefined') {
                initSwipeCards();
            } else {
                console.warn('Interact.js not loaded, using fallback swipe buttons only');
                // Initialize button functionality only
                initSwipeButtons();
            }
        }, 1000);
    }
});

// Fallback function for button-only swiping
function initSwipeButtons() {
    const likeBtn = document.querySelector('.like-btn');
    const passBtn = document.querySelector('.pass-btn');
    
    if (likeBtn) {
        likeBtn.addEventListener('click', function() {
            const currentCard = document.querySelectorAll('.profile-card')[currentCardIndex];
            if (currentCard) {
                currentCard.style.transform = 'translate(1000px, -100px) rotate(30deg)';
                currentCard.style.opacity = '0';
                setTimeout(() => {
                    currentCard.style.display = 'none';
                    currentCardIndex++;
                    showNextCard();
                }, 300);
            }
        });
    }
    
    if (passBtn) {
        passBtn.addEventListener('click', function() {
            const currentCard = document.querySelectorAll('.profile-card')[currentCardIndex];
            if (currentCard) {
                currentCard.style.transform = 'translate(-1000px, -100px) rotate(-30deg)';
                currentCard.style.opacity = '0';
                setTimeout(() => {
                    currentCard.style.display = 'none';
                    currentCardIndex++;
                    showNextCard();
                }, 300);
            }
        });
    }
}

// Swipe button interactions
const swipeButtons = document.querySelectorAll('.swipe-btn');
const profileCard = document.querySelector('.profile-card');

function handleSwipeAnimation(button, direction) {
    // Add animation class to profile card
    profileCard.style.animation = 'none';
    
    if (direction === 'pass') {
        profileCard.style.animation = 'shake 0.5s ease-in-out';
    } else if (direction === 'like') {
        profileCard.style.animation = 'bounce 0.6s ease-in-out';
    }
    
    // Reset animation after completion
    setTimeout(() => {
        profileCard.style.animation = '';
    }, 600);
}

async function handleSwipeClick(event) {
    const button = event.currentTarget;
    const isLike = button.classList.contains('like-btn');
    const direction = isLike ? 'like' : 'pass';
    
    // Get current profile ID
    const currentProfileId = profileCard.dataset.profileId;
    
    // Add button animation
    button.style.transform = 'scale(0.9)';
    button.style.boxShadow = isLike 
        ? '0 0 40px rgba(240, 147, 251, 0.6)'
        : '0 0 30px rgba(239, 68, 68, 0.4)';
    
    // Handle swipe animation
    handleSwipeAnimation(button, direction);
    
    // Reset button state
    setTimeout(() => {
        button.style.transform = '';
        button.style.boxShadow = '';
    }, 200);
    
    // Record swipe action
    if (currentProfileId) {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                await fetch('/api/matches/swipe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        targetUserId: currentProfileId,
                        action: direction
                    })
                });
            }
        } catch (error) {
            console.error('Error recording swipe:', error);
        }
    }
    
    // Load next profile
    setTimeout(() => {
        loadNextProfile();
    }, 800);
}

// Add click handlers to swipe buttons
swipeButtons.forEach(button => {
    button.addEventListener('click', handleSwipeClick);
});

// Social link interactions
const socialLinks = document.querySelectorAll('.social-link');

function handleSocialClick(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const platform = link.querySelector('span').textContent;
    
    // Add click animation
    link.style.transform = 'scale(0.9)';
    setTimeout(() => {
        link.style.transform = '';
    }, 150);
    
    // Simulate opening social profile
    console.log(`Opening ${platform} profile...`);
    
    // Add pulse effect
    link.style.animation = 'pulse 0.6s ease-in-out';
    setTimeout(() => {
        link.style.animation = '';
    }, 600);
}

// Add click handlers to social links
socialLinks.forEach(link => {
    link.addEventListener('click', handleSocialClick);
});

// Skill tag interactions
const skillTags = document.querySelectorAll('.skill-tag');

function handleSkillClick(event) {
    const tag = event.currentTarget;
    
    // Toggle active state
    tag.classList.toggle('active');
    
    // Add click animation
    tag.style.transform = 'scale(0.9)';
    setTimeout(() => {
        tag.style.transform = '';
    }, 150);
    
    // Log skill interaction
    const skillName = tag.textContent;
    console.log(`User clicked on ${skillName} skill`);
}

// Add click handlers to skill tags
skillTags.forEach(tag => {
    tag.addEventListener('click', handleSkillClick);
});

// Settings and user avatar interactions
const settingsIcon = document.querySelector('.settings-icon');
const userAvatar = document.querySelector('.user-avatar');

function handleSettingsClick() {
    // Add rotation animation
    this.style.transform = 'rotate(180deg)';
    setTimeout(() => {
        this.style.transform = '';
    }, 300);
    
    console.log('Opening settings menu...');
}

function handleAvatarClick() {
    // Add pulse animation
    this.style.animation = 'pulse 0.6s ease-in-out';
    setTimeout(() => {
        this.style.animation = '';
    }, 600);
    
    console.log('Opening user profile...');
}

if (settingsIcon) {
    settingsIcon.addEventListener('click', handleSettingsClick);
}

if (userAvatar) {
    userAvatar.addEventListener('click', handleAvatarClick);
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        // Trigger pass swipe
        const passBtn = document.querySelector('.pass-btn');
        if (passBtn) {
            passBtn.click();
        }
    } else if (event.key === 'ArrowRight') {
        // Trigger like swipe
        const likeBtn = document.querySelector('.like-btn');
        if (likeBtn) {
            likeBtn.click();
        }
    }
});

// Touch/swipe gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
}

function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipeGesture();
}

function handleSwipeGesture() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - pass
            const passBtn = document.querySelector('.pass-btn');
            if (passBtn) {
                passBtn.click();
            }
        } else {
            // Swipe right - like
            const likeBtn = document.querySelector('.like-btn');
            if (likeBtn) {
                likeBtn.click();
            }
        }
    }
}

// Add touch event listeners to profile card
if (profileCard) {
    profileCard.addEventListener('touchstart', handleTouchStart);
    profileCard.addEventListener('touchend', handleTouchEnd);
}

// Load profiles from API
let currentProfileIndex = 0;
let profiles = [];
let showUserProfileFirst = false;

// Load next profile from API
async function loadNextProfile() {
    try {
        showLoadingState();
        
        // Get auth token
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No auth token found');
            hideLoadingState();
            return;
        }

        // If we don't have profiles or we've gone through all of them, fetch new ones
        if (profiles.length === 0 || currentProfileIndex >= profiles.length) {
            const response = await fetch('/api/users/discover', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load profiles');
            }

            const data = await response.json();
            profiles = data.data.users || [];
            currentProfileIndex = 0;
        }

        // If we have profiles to show
        if (profiles.length > 0 && currentProfileIndex < profiles.length) {
            const profile = profiles[currentProfileIndex];
            displayProfile(profile);
            currentProfileIndex++;
        } else {
            // No more profiles available
            profileCard.style.display = 'none';
        }

        hideLoadingState();
    } catch (error) {
        console.error('Error loading profile:', error);
        hideLoadingState();
        showErrorMessage('Failed to load profiles. Please try again.');
    }
}

// Display profile data in the card
function displayProfile(profile) {
    if (!profile) return;

    // Update profile photo
    const profilePhoto = document.querySelector('.profile-photo img');
    if (profilePhoto) {
        profilePhoto.src = profile.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face';
        profilePhoto.alt = profile.fullName;
    }

    // Update user info
    const userName = document.querySelector('.user-name');
    const userRole = document.querySelector('.user-role');
    
    if (userName) userName.textContent = profile.fullName;
    if (userRole) userRole.textContent = profile.role || 'Developer';

    // Update skill tags
    const skillTagsContainer = document.querySelector('.skill-tags');
    if (skillTagsContainer && profile.skills && Array.isArray(profile.skills)) {
        skillTagsContainer.innerHTML = '';
        profile.skills.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillTag.addEventListener('click', handleSkillClick);
            skillTagsContainer.appendChild(skillTag);
        });
    }

    // Update bio
    const userBio = document.querySelector('.user-bio p');
    if (userBio) {
        userBio.textContent = profile.bio || 'No bio available';
    }

    // Update social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        const platform = link.querySelector('span').textContent.toLowerCase();
        
        if (platform === 'github' && profile.githubUsername) {
            link.href = `https://github.com/${profile.githubUsername}`;
            link.style.display = 'flex';
        } else if (platform === 'portfolio' && profile.portfolioUrl) {
            link.href = profile.portfolioUrl;
            link.style.display = 'flex';
        } else if (platform === 'linkedin' && profile.linkedinUrl) {
            link.href = profile.linkedinUrl;
            link.style.display = 'flex';
        } else {
            link.style.display = 'none';
        }
    });

    // Store current profile ID for swipe actions
    profileCard.dataset.profileId = profile._id;
}



// Show error message
function showErrorMessage(message) {
    const cardContent = document.querySelector('.card-content');
    if (cardContent) {
        cardContent.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ef4444; margin-bottom: 20px;"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="loadNextProfile()" style="margin-top: 20px; padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer;">Try Again</button>
            </div>
        `;
    }
}

// Smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Add loading state management
function showLoadingState() {
    const card = document.querySelector('.profile-card');
    card.style.opacity = '0.6';
    card.style.pointerEvents = 'none';
}

function hideLoadingState() {
    const card = document.querySelector('.profile-card');
    card.style.opacity = '';
    card.style.pointerEvents = '';
}

// Check if user just saved their profile
function checkForNewProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const justSaved = urlParams.get('saved');
    
    if (justSaved === 'true') {
        showUserProfileFirst = true;
        // Remove the parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Load and display current user's profile
async function loadUserProfile() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) return;

        const result = await response.json();
        const userProfile = result.data;

        // Display user's own profile first
        displayProfile({
            _id: userProfile._id,
            fullName: userProfile.fullName,
            role: userProfile.role || userProfile.currentRole,
            bio: userProfile.bio,
            skills: userProfile.skills || [],
            githubUsername: userProfile.githubUsername,
            portfolioUrl: userProfile.portfolioUrl,
            profilePicture: userProfile.profilePicture
        });

        // Mark that we've shown the user profile
        showUserProfileFirst = false;
        
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

// Initialize page animations
window.addEventListener('load', function() {
    // Check if we should show user's profile first
    checkForNewProfile();
    
    if (showUserProfileFirst) {
        // Show user's own profile first
        loadUserProfile();
    } else {
        // Load first profile when page loads
        loadNextProfile();
    }
    
    // Add stagger animation to skill tags
    const tags = document.querySelectorAll('.skill-tag');
    tags.forEach((tag, index) => {
        tag.style.opacity = '0';
        tag.style.transform = 'translateY(20px)';
        setTimeout(() => {
            tag.style.transition = 'all 0.3s ease';
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Add stagger animation to social links
    const links = document.querySelectorAll('.social-link');
    links.forEach((link, index) => {
        link.style.opacity = '0';
        link.style.transform = 'translateY(20px)';
        setTimeout(() => {
            link.style.transition = 'all 0.3s ease';
            link.style.opacity = '1';
            link.style.transform = 'translateY(0)';
        }, 500 + index * 100);
    });
});

// Add hover effects to nav items
navItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        if (!this.classList.contains('active')) {
            this.style.background = 'rgba(255, 255, 255, 0.1)';
        }
    });
    
    item.addEventListener('mouseleave', function() {
        if (!this.classList.contains('active')) {
            this.style.background = '';
        }
    });
});

// Add parallax effect to profile card
window.addEventListener('mousemove', function(event) {
    const card = document.querySelector('.profile-card');
    if (card) {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        const deltaX = (mouseX - centerX) / rect.width;
        const deltaY = (mouseY - centerY) / rect.height;
        
        const rotateX = deltaY * 5;
        const rotateY = deltaX * 5;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
});

// Reset card transform when mouse leaves
window.addEventListener('mouseleave', function() {
    const card = document.querySelector('.profile-card');
    if (card) {
        card.style.transform = '';
    }
});