/**
 * Skill Set Profile Setup Page JavaScript
 * Handles all interactive functionality for the profile setup form
 */

// Global variables to store form data
let profileData = {
    image: null,
    fullName: '',
    currentRole: '',
    bio: '',
    skills: [],
    portfolioUrl: '',
    githubUsername: ''
};

// DOM elements
const elements = {
    profileImageInput: null,
    profilePreview: null,
    fullName: null,
    currentRole: null,
    bio: null,
    skillInput: null,
    skillsContainer: null,
    portfolioUrl: null,
    githubUsername: null,
    // Preview elements
    previewProfileImage: null,
    previewName: null,
    previewRole: null,
    previewBio: null,
    previewSkills: null,
    previewPortfolio: null,
    previewGithub: null
};

/**
 * Initialize the page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    loadSavedData();
    setupMobileMenu();
});

/**
 * Cache DOM elements for better performance
 */
function initializeElements() {
    elements.profileImageInput = document.getElementById('profileImageInput');
    elements.profilePreview = document.getElementById('profilePreview');
    elements.fullName = document.getElementById('fullName');
    elements.currentRole = document.getElementById('currentRole');
    elements.bio = document.getElementById('bio');
    elements.skillInput = document.getElementById('skillInput');
    elements.skillsContainer = document.getElementById('skillsContainer');
    elements.portfolioUrl = document.getElementById('portfolioUrl');
    elements.githubUsername = document.getElementById('githubUsername');
    
    // Preview elements
    elements.previewProfileImage = document.getElementById('previewProfileImage');
    elements.previewName = document.getElementById('previewName');
    elements.previewRole = document.getElementById('previewRole');
    elements.previewBio = document.getElementById('previewBio');
    elements.previewSkills = document.getElementById('previewSkills');
    elements.previewPortfolio = document.getElementById('previewPortfolio');
    elements.previewGithub = document.getElementById('previewGithub');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Profile image upload
    elements.profileImageInput.addEventListener('change', handleImageUpload);
    
    // Live text updates
    elements.fullName.addEventListener('input', updatePreview);
    elements.currentRole.addEventListener('input', updatePreview);
    elements.bio.addEventListener('input', updatePreview);
    elements.portfolioUrl.addEventListener('input', updatePreview);
    elements.githubUsername.addEventListener('input', updatePreview);
    
    // Skills input
    elements.skillInput.addEventListener('keypress', handleSkillInput);
    
    // Form validation on input
    [elements.fullName, elements.currentRole, elements.bio].forEach(element => {
        element.addEventListener('input', validateForm);
    });
}

/**
 * Handle profile image upload
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
        showMessage('Please select an image file (PNG or JPG)', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showMessage('Image size must be less than 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        profileData.image = imageData;
        
        // Update both form and preview images
        elements.profilePreview.src = imageData;
        elements.previewProfileImage.src = imageData;
        
        showMessage('Profile picture uploaded successfully!', 'success');
        saveData();
    };
    
    reader.onerror = function() {
        showMessage('Error reading image file', 'error');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Remove profile image
 */
function removeProfileImage() {
    profileData.image = null;
    
    // Reset to default placeholder
    const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23333' rx='75'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
    const smallPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23222' rx='60'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23555' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
    
    elements.profilePreview.src = placeholder;
    elements.previewProfileImage.src = smallPlaceholder;
    
    showMessage('Profile picture removed', 'info');
    saveData();
}

/**
 * Handle skill input (Enter key)
 */
function handleSkillInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const skill = event.target.value.trim();
        
        if (skill && !profileData.skills.includes(skill)) {
            addSkill(skill);
            event.target.value = '';
        }
    }
}

/**
 * Add a skill tag
 */
function addSkill(skill) {
    profileData.skills.push(skill);
    renderSkills();
    updatePreview();
    saveData();
}

/**
 * Remove a skill tag
 */
function removeSkill(skill) {
    profileData.skills = profileData.skills.filter(s => s !== skill);
    renderSkills();
    updatePreview();
    saveData();
}

/**
 * Render all skill tags
 */
function renderSkills() {
    elements.skillsContainer.innerHTML = '';
    
    profileData.skills.forEach(skill => {
        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.innerHTML = `
            ${skill}
            <button type="button" class="remove-skill" onclick="removeSkill('${skill}')" aria-label="Remove ${skill}">
                <i class="fas fa-times"></i>
            </button>
        `;
        elements.skillsContainer.appendChild(skillTag);
    });
}

/**
 * Update live preview
 */
function updatePreview() {
    // Update profile data from form inputs
    profileData.fullName = elements.fullName.value.trim();
    profileData.currentRole = elements.currentRole.value.trim();
    profileData.bio = elements.bio.value.trim();
    profileData.portfolioUrl = elements.portfolioUrl.value.trim();
    profileData.githubUsername = elements.githubUsername.value.trim();
    
    // Update preview elements with smooth transitions
    updatePreviewText(elements.previewName, profileData.fullName || 'Your Name');
    updatePreviewText(elements.previewRole, profileData.currentRole || 'Your Role');
    updatePreviewText(elements.previewBio, profileData.bio || 'Your bio will appear here...');
    
    // Update skills in preview
    updatePreviewSkills();
    
    // Update links
    updatePreviewLinks();
    
    // Save to localStorage
    saveData();
}

/**
 * Update preview text with smooth transition
 */
function updatePreviewText(element, text) {
    element.style.opacity = '0.7';
    setTimeout(() => {
        element.textContent = text;
        element.style.opacity = '1';
    }, 150);
}

/**
 * Update preview skills
 */
function updatePreviewSkills() {
    elements.previewSkills.innerHTML = '';
    
    if (profileData.skills.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'skill-tag';
        placeholder.textContent = 'Add skills to see them here';
        elements.previewSkills.appendChild(placeholder);
        return;
    }
    
    profileData.skills.forEach(skill => {
        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.textContent = skill;
        elements.previewSkills.appendChild(skillTag);
    });
}

/**
 * Update preview links
 */
function updatePreviewLinks() {
    // Portfolio link
    if (profileData.portfolioUrl) {
        elements.previewPortfolio.href = profileData.portfolioUrl;
        elements.previewPortfolio.style.display = 'inline-flex';
    } else {
        elements.previewPortfolio.style.display = 'none';
    }
    
    // GitHub link
    if (profileData.githubUsername) {
        elements.previewGithub.href = `https://github.com/${profileData.githubUsername}`;
        elements.previewGithub.style.display = 'inline-flex';
    } else {
        elements.previewGithub.style.display = 'none';
    }
}

/**
 * Validate form before saving
 */
function validateForm() {
    const isValid = profileData.fullName.length >= 2 && 
                   profileData.currentRole.length >= 2 && 
                   profileData.bio.length >= 10 &&
                   profileData.skills.length > 0;
    
    return isValid;
}

/**
 * Save profile data
 */
function saveProfile() {
    if (!validateForm()) {
        showMessage('Please fill in all required fields and add at least one skill', 'error');
        return;
    }
    
    // Simulate API call
    const saveButton = document.querySelector('.btn-gradient');
    const originalText = saveButton.innerHTML;
    
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveButton.disabled = true;
    
    setTimeout(() => {
        saveData(); // Save to localStorage
        showMessage('Profile saved successfully!', 'success');
        
        // Reset button
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;
        
        // Redirect to dashboard after successful save
        setTimeout(() => {
            window.location.href = '/dashboard'; // Adjust this URL as needed
        }, 1500);
    }, 1500);
}

/**
 * Reset form to initial state
 */
function resetForm() {
    if (confirm('Are you sure you want to reset all changes?')) {
        profileData = {
            image: null,
            fullName: '',
            currentRole: '',
            bio: '',
            skills: [],
            portfolioUrl: '',
            githubUsername: ''
        };
        
        // Reset form inputs
        elements.fullName.value = '';
        elements.currentRole.value = '';
        elements.bio.value = '';
        elements.skillInput.value = '';
        elements.portfolioUrl.value = '';
        elements.githubUsername.value = '';
        
        // Reset images
        const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23333' rx='75'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
        const smallPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23222' rx='60'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23555' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
        
        elements.profilePreview.src = placeholder;
        elements.previewProfileImage.src = smallPlaceholder;
        
        // Reset skills and preview
        renderSkills();
        updatePreview();
        
        showMessage('Form reset successfully', 'info');
        saveData();
    }
}

/**
 * Save data to localStorage
 */
function saveData() {
    try {
        localStorage.setItem('skillSetProfile', JSON.stringify(profileData));
    } catch (error) {
        console.warn('Could not save to localStorage:', error);
    }
}

/**
 * Load saved data from localStorage
 */
function loadSavedData() {
    try {
        const saved = localStorage.getItem('skillSetProfile');
        if (saved) {
            profileData = JSON.parse(saved);
            
            // Restore form state
            elements.fullName.value = profileData.fullName;
            elements.currentRole.value = profileData.currentRole;
            elements.bio.value = profileData.bio;
            elements.portfolioUrl.value = profileData.portfolioUrl;
            elements.githubUsername.value = profileData.githubUsername;
            
            // Restore image
            if (profileData.image) {
                elements.profilePreview.src = profileData.image;
                elements.previewProfileImage.src = profileData.image;
            }
            
            // Restore skills
            renderSkills();
            updatePreview();
        }
    } catch (error) {
        console.warn('Could not load from localStorage:', error);
    }
}

/**
 * Show user feedback messages
 */
function showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    // Style the message
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                   type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 
                   'linear-gradient(135deg, #6b7280, #4b5563)'};
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
    `;
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Remove after delay
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageEl.remove(), 300);
    }, 3000);
}

/**
 * Setup mobile menu functionality
 */
function setupMobileMenu() {
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-menu-toggle';
    mobileToggle.innerHTML = '☰';
    mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
    document.body.appendChild(mobileToggle);
    
    const sidebar = document.querySelector('.dashboard-sidebar');
    const closeButton = document.querySelector('.sidebar-close');
    
    mobileToggle.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-open');
    });
    
    // Close sidebar when clicking close button
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            sidebar.classList.remove('mobile-open');
        });
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && !mobileToggle.contains(event.target)) {
            sidebar.classList.remove('mobile-open');
        }
    });
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);