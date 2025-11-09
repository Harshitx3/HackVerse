// Tab switching functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked tab button
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Password toggle functionality
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.parentElement.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Tab button event listeners
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showTab(tabName);
        });
    });

    // Form submission handlers
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }
});

// Login handler
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Add loading state
    const submitBtn = document.querySelector('#loginForm .submit-btn');
    const originalText = submitBtn.querySelector('.btn-text').textContent;
    submitBtn.querySelector('.btn-text').textContent = 'Logging in...';
    submitBtn.classList.add('loading');
    
    // Make actual API call
    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
      // Reset button state
      submitBtn.querySelector('.btn-text').textContent = originalText;
      submitBtn.classList.remove('loading');
      
      if (data.success) {
        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.data.user));
        
        // Show success message
        showMessage('Login successful! Redirecting...', 'success');
        
        // Redirect to profile after 2 seconds
        setTimeout(() => {
          window.location.href = '/profile';
        }, 2000);
      } else {
        // Show error message
        showMessage(data.message || 'Login failed', 'error');
      }
    })
    .catch(error => {
      // Reset button state
      submitBtn.querySelector('.btn-text').textContent = originalText;
      submitBtn.classList.remove('loading');
      
      // Show error message
      showMessage('Network error occurred', 'error');
      console.error('Login error:', error);
    });
}

// Register handler
function handleRegister() {
    const fullName = document.getElementById('registerFullName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const termsCheckbox = document.getElementById('termsCheckbox');
    
    // Validation
    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }
    
    if (!termsCheckbox.checked) {
        showMessage('Please agree to the Terms & Conditions', 'error');
        return;
    }
    
    // Add loading state
    const submitBtn = document.querySelector('#registerForm .submit-btn');
    const originalText = submitBtn.querySelector('.btn-text').textContent;
    submitBtn.querySelector('.btn-text').textContent = 'Creating Account...';
    submitBtn.classList.add('loading');
    
    // Make actual API call
    fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, password })
    })
    .then(response => response.json())
    .then(data => {
      // Reset button state
      submitBtn.querySelector('.btn-text').textContent = originalText;
      submitBtn.classList.remove('loading');
      
      if (data.success) {
        // Show success message
        showMessage('Account created successfully! Please login.', 'success');
        
        // Switch to login tab after delay
        setTimeout(() => {
            showTab('login');
        }, 1500);
      } else {
        // Show error message
        let errorMessage = data.message || 'Registration failed';
        if (data.errors && data.errors.length > 0) {
            errorMessage = data.errors.map(err => err.msg).join(', ');
        }
        showMessage(errorMessage, 'error');
      }
    })
    .catch(error => {
      // Reset button state
      submitBtn.querySelector('.btn-text').textContent = originalText;
      submitBtn.classList.remove('loading');
      
      // Show error message
      showMessage('Network error occurred', 'error');
      console.error('Registration error:', error);
    });
}

// Message display function
function showMessage(text, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Insert at the top of the login card
    const loginCard = document.querySelector('.login-card');
    loginCard.insertBefore(message, loginCard.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 5000);
}

// Social login placeholder
function socialLogin(provider) {
    showMessage(`${provider} login coming soon!`, 'success');
}