/**
 * Secure login implementation for SkillSwapping
 * This replaces the insecure client-side password hashing
 */

class SecureLogin {
    constructor() {
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.init();
    }

    init() {
        // Check for existing session on page load
        this.checkExistingSession();
        
        // Set up form handlers
        this.setupFormHandlers();
        
        // Set up session timeout
        this.setupSessionTimeout();
    }

    setupFormHandlers() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Add input event listeners to hide errors
        const fields = ['email', 'password'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', () => this.hideError(field));
            }
        });

        // Handle remember me token
        this.handleRememberMeToken();
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Reset errors
        this.hideError('email');
        this.hideError('password');
        
        // Validate inputs
        if (!this.validateInputs(email, password)) {
            return;
        }
        
        this.showLoading(true);
        
        try {
            const user = await this.loginUser(email, password, rememberMe);
            
            // Show success message
            document.getElementById('successMessage').style.display = 'block';
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
            
        } catch (error) {
            this.showLoading(false);
            this.handleLoginError(error);
        }
    }

    validateInputs(email, password) {
        let isValid = true;
        
        if (!email) {
            this.showError('email', 'Please enter your email address');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!password) {
            this.showError('password', 'Please enter your password');
            isValid = false;
        }
        
        return isValid;
    }

    async loginUser(username, password, rememberMe) {
        // Send plain password to server over HTTPS
        // Server will handle secure password verification
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.user) {
            // Store session data securely
            this.storeSession(result, username, rememberMe);
            return result.user;
        } else {
            throw new Error(result.error || 'Login failed');
        }
    }

    storeSession(loginResult, email, rememberMe) {
        const sessionData = {
            email: email,
            sessionToken: loginResult.session_token,
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe,
            user: loginResult.user
        };
        
        // Use sessionStorage instead of localStorage for better security
        sessionStorage.setItem('currentSession', JSON.stringify(sessionData));
        sessionStorage.setItem('currentUser', JSON.stringify(loginResult.user));
        
        // Only store remember me token if requested
        if (rememberMe) {
            localStorage.setItem('rememberMeEmail', email);
        }
    }

    handleLoginError(error) {
        if (error.message.includes('Invalid')) {
            this.showError('password', 'Invalid email or password');
        } else if (error.message.includes('required')) {
            this.showError('email', 'Please enter your email and password');
        } else {
            alert('Login failed: ' + error.message);
        }
    }

    checkExistingSession() {
        const currentSession = sessionStorage.getItem('currentSession');
        if (currentSession) {
            try {
                const session = JSON.parse(currentSession);
                if (session.sessionToken && session.email) {
                    // Check if session is still valid (basic client-side check)
                    const loginTime = new Date(session.loginTime);
                    const now = new Date();
                    const timeDiff = now - loginTime;
                    
                    if (timeDiff < this.sessionTimeout) {
                        // Redirect to home if session appears valid
                        window.location.href = 'home.html';
                        return;
                    }
                }
            } catch (e) {
                // Invalid session, remove it
                this.clearSession();
            }
        }
    }

    handleRememberMeToken() {
        const rememberEmail = localStorage.getItem('rememberMeEmail');
        if (rememberEmail) {
            const emailField = document.getElementById('email');
            const rememberCheckbox = document.getElementById('rememberMe');
            
            if (emailField) emailField.value = rememberEmail;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }
    }

    setupSessionTimeout() {
        let lastActivity = Date.now();
        
        const updateActivity = () => {
            lastActivity = Date.now();
        };
        
        // Track user activity
        document.addEventListener('click', updateActivity);
        document.addEventListener('keypress', updateActivity);
        document.addEventListener('scroll', updateActivity);
        
        // Check for timeout every minute
        setInterval(() => {
            if (Date.now() - lastActivity > this.sessionTimeout) {
                this.logout('Session expired due to inactivity');
            }
        }, 60000);
    }

    // Utility methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showError(fieldId, message) {
        const errorElement = document.getElementById(fieldId + 'Error');
        const field = document.getElementById(fieldId);
        
        if (field) field.style.borderColor = '#dc3545';
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    hideError(fieldId) {
        const errorElement = document.getElementById(fieldId + 'Error');
        const field = document.getElementById(fieldId);
        
        if (field) field.style.borderColor = '#e1e5e9';
        if (errorElement) errorElement.style.display = 'none';
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const button = document.getElementById('loginBtn');
        
        if (show) {
            if (loading) loading.style.display = 'block';
            if (button) {
                button.disabled = true;
                button.textContent = 'Signing In...';
            }
        } else {
            if (loading) loading.style.display = 'none';
            if (button) {
                button.disabled = false;
                button.textContent = 'Sign In';
            }
        }
    }

    clearSession() {
        sessionStorage.removeItem('currentSession');
        sessionStorage.removeItem('currentUser');
    }

    logout(reason = 'Logged out') {
        this.clearSession();
        
        if (reason !== 'Logged out') {
            alert(reason);
        }
        
        window.location.href = 'login.html';
    }
}

// Forgot password function (standalone)
function forgotPassword() {
    const email = document.getElementById('email').value.trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert(`Password reset instructions would be sent to ${email}\n\nNote: This is a demo - password reset is not implemented yet.`);
    } else {
        alert('Please enter your email address first');
        document.getElementById('email').focus();
    }
}

// Initialize secure login when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    new SecureLogin();
});

// Handle enter key
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        const form = document.getElementById('loginForm');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
});