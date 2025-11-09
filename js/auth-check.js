// Authentication check and navigation management
class AuthManager {
    constructor() {
        this.checkAuth();
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        return !!token;
    }

    // Get current user data
    getCurrentUser() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    // Set authentication data
    setAuthData(token, userData) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    // Clear authentication data
    clearAuthData() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    }

    // Check authentication and redirect if needed
    checkAuth() {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/login' || currentPath === '/register';
        
        // If not authenticated and trying to access protected page
        if (!this.isAuthenticated() && !isAuthPage) {
            window.location.href = '/login';
            return false;
        }
        
        // If authenticated and on login/register page
        if (this.isAuthenticated() && isAuthPage) {
            window.location.href = '/profile';
            return false;
        }
        
        return true;
    }

    // Handle login
    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.setAuthData(data.token, data.user);
                return { success: true, data };
            } else {
                return { success: false, error: data.message };
            }
        } catch (error) {
            return { success: false, error: 'Network error occurred' };
        }
    }

    // Handle logout
    logout() {
        this.clearAuthData();
        window.location.href = '/login';
    }

    // Setup navigation event listeners
    setupNavigation() {
        // Add click handlers to navigation links
        const navLinks = document.querySelectorAll('a[href^="/"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.navigate(href);
            });
        });
    }

    // Navigate to a page
    navigate(path) {
        if (this.checkAuth()) {
            window.location.href = path;
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Global functions for HTML onclick handlers
function requireAuth(path) {
    authManager.navigate(path);
}

function handleLogout() {
    authManager.logout();
}

// Check auth on page load
document.addEventListener('DOMContentLoaded', function() {
    authManager.setupNavigation();
});