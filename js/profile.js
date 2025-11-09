// Profile Page JavaScript - Complete Implementation

// Global variables
let currentUser = null;
let userSkills = [];
let isLoading = false;

// DOM Elements
const profileForm = document.getElementById('profileForm');
const fullNameInput = document.getElementById('fullName');
const roleSelect = document.getElementById('role');
const bioTextarea = document.getElementById('bio');
const bioCount = document.getElementById('bioCount');
const skillsInput = document.getElementById('skillsInput');
const skillsTags = document.getElementById('skillsTags');
const addSkillBtn = document.getElementById('addSkillBtn');
const profilePictureInput = document.getElementById('profilePictureInput');
const picturePreview = document.getElementById('picturePreview');
const profileImage = document.getElementById('profileImage');
const uploadPictureBtn = document.getElementById('uploadPictureBtn');
const completionPercentage = document.getElementById('completionPercentage');
const progressFill = document.getElementById('progressFill');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const saveDraftBtn = document.getElementById('saveDraftBtn');
const logoutBtn = document.getElementById('logoutBtn');
const notificationContainer = document.getElementById('notificationContainer');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeProfilePage();
    setupEventListeners();
    loadUserProfile();
});

// Initialize profile page
function initializeProfilePage() {
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Setup mobile menu
    setupMobileMenu();
    
    // Setup navigation
    setupNavigation();
    
    // Initialize form validation
    setupFormValidation();
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    profileForm.addEventListener('submit', handleProfileSubmit);
    
    // Bio character counter
    bioTextarea.addEventListener('input', updateBioCounter);
    
    // Skills management
    skillsInput.addEventListener('keypress', handleSkillInput);
    addSkillBtn.addEventListener('click', addSkill);
    
    // Profile picture upload
    uploadPictureBtn.addEventListener('click', () => profilePictureInput.click());
    picturePreview.addEventListener('click', () => profilePictureInput.click());
    profilePictureInput.addEventListener('change', handleProfilePictureChange);
    
    // Form field validation
    fullNameInput.addEventListener('blur', validateFullName);
    roleSelect.addEventListener('change', validateRole);
    bioTextarea.addEventListener('blur', validateBio);
    
    // Save draft
    saveDraftBtn.addEventListener('click', saveDraft);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Real-time validation
    setupRealTimeValidation();
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebar = document.querySelector('.sidebar');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            const icon = this.querySelector('i');
            if (sidebar.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', function() {
            sidebar.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    }

    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
            sidebar.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Setup navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get the href and navigate
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                window.location.href = href;
            }
        });
    });
}

// Load user profile data
async function loadUserProfile() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        showLoading(true);

        // Get current user data
        const response = await fetch('/api/users/profile/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const result = await response.json();
        currentUser = result.data.user;

        // Populate form with existing data
        populateFormData(currentUser);
        
        // Update profile completion
        updateProfileCompletion();
        
        // Update user avatar in sidebar
        updateUserAvatar();

        showNotification('Profile loaded successfully!', 'success');

    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile. Please refresh the page.', 'error');
    } finally {
        showLoading(false);
    }
}

// Populate form with user data
function populateFormData(user) {
    if (user.fullName) fullNameInput.value = user.fullName;
    if (user.role) roleSelect.value = user.role;
    if (user.bio) {
        bioTextarea.value = user.bio;
        updateBioCounter();
    }
    if (user.portfolioUrl) document.getElementById('portfolioUrl').value = user.portfolioUrl;
    if (user.githubUsername) document.getElementById('githubUsername').value = user.githubUsername;
    if (user.linkedinUrl) document.getElementById('linkedinUrl').value = user.linkedinUrl;
    if (user.preferences?.lookingFor) document.getElementById('lookingFor').value = user.preferences.lookingFor;
    
    // Load skills
    if (user.skills && user.skills.length > 0) {
        userSkills = [...user.skills];
        renderSkills();
    }
    
    // Load profile picture
    if (user.profilePicture) {
        profileImage.src = user.profilePicture;
    }
}

// Update user avatar in sidebar
function updateUserAvatar() {
    const userAvatar = document.getElementById('userAvatar');
    if (currentUser && currentUser.profilePicture) {
        userAvatar.innerHTML = `<img src="${currentUser.profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else if (currentUser && currentUser.fullName) {
        const initials = currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        userAvatar.innerHTML = `<span style="font-size: 1.125rem; font-weight: 600;">${initials}</span>`;
    }
}

// Bio character counter
function updateBioCounter() {
    const count = bioTextarea.value.length;
    bioCount.textContent = count;
    
    if (count > 450) {
        bioCount.style.color = '#ef4444';
    } else if (count > 400) {
        bioCount.style.color = '#f59e0b';
    } else {
        bioCount.style.color = '#a1a1aa';
    }
}

// Skills management
function handleSkillInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addSkill();
    }
}

function addSkill() {
    const skill = skillsInput.value.trim();
    if (skill && !userSkills.includes(skill)) {
        if (userSkills.length < 10) {
            userSkills.push(skill);
            renderSkills();
            skillsInput.value = '';
            updateProfileCompletion();
        } else {
            showNotification('Maximum 10 skills allowed', 'warning');
        }
    }
}

function removeSkill(skillToRemove) {
    userSkills = userSkills.filter(skill => skill !== skillToRemove);
    renderSkills();
    updateProfileCompletion();
}

function renderSkills() {
    skillsTags.innerHTML = '';
    userSkills.forEach(skill => {
        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.innerHTML = `
            <span>${skill}</span>
            <button type="button" class="remove-skill" onclick="removeSkill('${skill}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        skillsTags.appendChild(skillTag);
    });
}

// Profile picture handling
function handleProfilePictureChange(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showNotification('Image size must be less than 5MB', 'error');
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            profileImage.src = e.target.result;
            uploadProfilePicture(file);
        };
        reader.readAsDataURL(file);
    }
}

// Upload profile picture
async function uploadProfilePicture(file) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        showLoading(true);

        const response = await fetch('/api/users/profile/picture', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload profile picture');
        }

        const result = await response.json();
        
        // Update profile picture URL
        if (result.data && result.data.imageUrl) {
            profileImage.src = result.data.imageUrl;
            showNotification('Profile picture updated successfully!', 'success');
        }

    } catch (error) {
        console.error('Error uploading profile picture:', error);
        showNotification('Failed to upload profile picture', 'error');
    } finally {
        showLoading(false);
    }
}

// Form validation
function setupFormValidation() {
    // Add validation classes
    const inputs = profileForm.querySelectorAll('input[required], textarea[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearError);
    });
}

function setupRealTimeValidation() {
    // Real-time validation for specific fields
    fullNameInput.addEventListener('input', debounce(validateFullName, 500));
    bioTextarea.addEventListener('input', debounce(validateBio, 500));
}

function validateField(event) {
    const field = event.target;
    const fieldName = field.name;
    const value = field.value.trim();
    
    clearError(field);
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`);
        return false;
    }
    
    // Specific validations
    switch (fieldName) {
        case 'fullName':
            return validateFullName();
        case 'bio':
            return validateBio();
        case 'portfolioUrl':
        case 'linkedinUrl':
            return validateUrl(field);
        default:
            return true;
    }
}

function validateFullName() {
    const value = fullNameInput.value.trim();
    if (value.length < 2) {
        showFieldError(fullNameInput, 'Full name must be at least 2 characters');
        return false;
    }
    if (value.length > 50) {
        showFieldError(fullNameInput, 'Full name cannot exceed 50 characters');
        return false;
    }
    return true;
}

function validateRole() {
    if (!roleSelect.value) {
        showFieldError(roleSelect, 'Please select a role');
        return false;
    }
    return true;
}

function validateBio() {
    const value = bioTextarea.value.trim();
    if (value.length < 10) {
        showFieldError(bioTextarea, 'Bio must be at least 10 characters');
        return false;
    }
    if (value.length > 500) {
        showFieldError(bioTextarea, 'Bio cannot exceed 500 characters');
        return false;
    }
    return true;
}

function validateUrl(field) {
    const value = field.value.trim();
    if (value && !isValidUrl(value)) {
        showFieldError(field, 'Please enter a valid URL');
        return false;
    }
    return true;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showFieldError(field, message) {
    const errorElement = document.getElementById(`${field.name}Error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    field.classList.add('error');
}

function clearError(field) {
    const errorElement = document.getElementById(`${field.name}Error`);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    field.classList.remove('error');
}

// Profile completion calculation
function updateProfileCompletion() {
    let completed = 0;
    let total = 6; // fullName, role, bio, skills, profilePicture, social links
    
    if (fullNameInput.value.trim()) completed++;
    if (roleSelect.value) completed++;
    if (bioTextarea.value.trim().length >= 10) completed++;
    if (userSkills.length > 0) completed++;
    if (profileImage.src && !profileImage.src.includes('unsplash')) completed++;
    if (document.getElementById('portfolioUrl').value.trim() || 
        document.getElementById('githubUsername').value.trim() || 
        document.getElementById('linkedinUrl').value.trim()) completed++;
    
    const percentage = Math.round((completed / total) * 100);
    completionPercentage.textContent = `${percentage}%`;
    progressFill.style.width = `${percentage}%`;
    
    // Update progress bar color based on completion
    if (percentage >= 80) {
        progressFill.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else if (percentage >= 50) {
        progressFill.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    } else {
        progressFill.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    }
}

// Form submission
async function handleProfileSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        showNotification('Please fill in all required fields correctly', 'error');
        return;
    }
    
    if (userSkills.length === 0) {
        showNotification('Please add at least one skill', 'error');
        return;
    }
    
    await saveProfile();
}

function validateForm() {
    let isValid = true;
    
    if (!validateFullName()) isValid = false;
    if (!validateRole()) isValid = false;
    if (!validateBio()) isValid = false;
    
    // Validate URLs
    const urlFields = ['portfolioUrl', 'linkedinUrl'];
    urlFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field.value.trim() && !validateUrl(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Save profile
async function saveProfile() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        showLoading(true);

        const profileData = {
            fullName: fullNameInput.value.trim(),
            role: roleSelect.value,
            bio: bioTextarea.value.trim(),
            skills: userSkills,
            portfolioUrl: document.getElementById('portfolioUrl').value.trim() || undefined,
            githubUsername: document.getElementById('githubUsername').value.trim() || undefined,
            linkedinUrl: document.getElementById('linkedinUrl').value.trim() || undefined,
            preferences: {
                lookingFor: document.getElementById('lookingFor').value
            }
        };

        const response = await fetch('/api/users/profile', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save profile');
        }

        const result = await response.json();
        showNotification('Profile saved successfully!', 'success');
        
        // Update current user data
        currentUser = result.data.user;
        updateUserAvatar();
        
        // Redirect to swipe page after successful save
        setTimeout(() => {
            window.location.href = '/swipe';
        }, 1500);

    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification(error.message || 'Failed to save profile', 'error');
    } finally {
        showLoading(false);
    }
}

// Save draft
async function saveDraft() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        showLoading(true);

        const draftData = {
            fullName: fullNameInput.value.trim() || undefined,
            role: roleSelect.value || undefined,
            bio: bioTextarea.value.trim() || undefined,
            skills: userSkills.length > 0 ? userSkills : undefined,
            portfolioUrl: document.getElementById('portfolioUrl').value.trim() || undefined,
            githubUsername: document.getElementById('githubUsername').value.trim() || undefined,
            linkedinUrl: document.getElementById('linkedinUrl').value.trim() || undefined,
            preferences: {
                lookingFor: document.getElementById('lookingFor').value
            }
        };

        const response = await fetch('/api/users/profile', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(draftData)
        });

        if (!response.ok) {
            throw new Error('Failed to save draft');
        }

        showNotification('Draft saved successfully!', 'success');

    } catch (error) {
        console.error('Error saving draft:', error);
        showNotification('Failed to save draft', 'error');
    } finally {
        showLoading(false);
    }
}

// Logout functionality
async function handleLogout() {
    try {
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        
        // Show logout notification
        showNotification('Logged out successfully!', 'success');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
        
    } catch (error) {
        console.error('Error during logout:', error);
        window.location.href = '/login';
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function showLoading(show) {
    isLoading = show;
    saveProfileBtn.disabled = show;
    saveDraftBtn.disabled = show;
    
    if (show) {
        saveProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveDraftBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    } else {
        saveProfileBtn.innerHTML = '<i class="fas fa-check"></i> Save Profile';
        saveDraftBtn.innerHTML = '<i class="fas fa-save"></i> Save Draft';
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update profile completion on input changes
fullNameInput.addEventListener('input', updateProfileCompletion);
roleSelect.addEventListener('change', updateProfileCompletion);
bioTextarea.addEventListener('input', updateProfileCompletion);
document.getElementById('portfolioUrl').addEventListener('input', updateProfileCompletion);
document.getElementById('githubUsername').addEventListener('input', updateProfileCompletion);
document.getElementById('linkedinUrl').addEventListener('input', updateProfileCompletion);