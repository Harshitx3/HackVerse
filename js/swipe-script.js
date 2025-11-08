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

function handleSwipeClick(event) {
    const button = event.currentTarget;
    const isLike = button.classList.contains('like-btn');
    const direction = isLike ? 'like' : 'pass';
    
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
    
    // Log swipe action (for demo purposes)
    console.log(`User swiped ${direction} on profile`);
    
    // Simulate loading next profile
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

// Simulate loading next profile
function loadNextProfile() {
    // This would typically fetch new profile data from an API
    console.log('Loading next profile...');
    
    // For demo purposes, we'll just add a subtle animation
    profileCard.style.opacity = '0.8';
    setTimeout(() => {
        profileCard.style.opacity = '';
    }, 300);
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

// Initialize page animations
window.addEventListener('load', function() {
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