/**
 * Secure frontend utilities for SkillSwapping
 */

class SecureFrontend {
    constructor() {
        this.csrfToken = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.initSecurity();
    }

    initSecurity() {
        // Remove password hashing from frontend
        // Passwords should NEVER be hashed client-side in production
        
        // Set up CSRF protection
        this.setupCSRFProtection();
        
        // Set up session timeout
        this.setupSessionTimeout();
        
        // Set up secure storage
        this.setupSecureStorage();
    }

    async setupCSRFProtection() {
        try {
            const response = await fetch('/api/csrf-token');
            const data = await response.json();
            this.csrfToken = data.token;
        } catch (error) {
            console.error('Failed to get CSRF token:', error);
        }
    }

    setupSessionTimeout() {
        let lastActivity = Date.now();
        
        // Track user activity
        const updateActivity = () => {
            lastActivity = Date.now();
        };
        
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

    setupSecureStorage() {
        // Use secure storage methods
        this.storage = {
            set: (key, value) => {
                try {
                    // Encrypt sensitive data before storing
                    const encrypted = this.encryptData(JSON.stringify(value));
                    sessionStorage.setItem(key, encrypted);
                } catch (error) {
                    console.error('Failed to store data securely:', error);
                }
            },
            
            get: (key) => {
                try {
                    const encrypted = sessionStorage.getItem(key);
                    if (!encrypted) return null;
                    
                    const decrypted = this.decryptData(encrypted);
                    return JSON.parse(decrypted);
                } catch (error) {
                    console.error('Failed to retrieve data securely:', error);
                    return null;
                }
            },
            
            remove: (key) => {
                sessionStorage.removeItem(key);
            }
        };
    }

    // Simple encryption for demo - use proper encryption in production
    encryptData(data) {
        // This is a placeholder - implement proper encryption
        return btoa(data);
    }

    decryptData(encryptedData) {
        // This is a placeholder - implement proper decryption
        return atob(encryptedData);
    }

    async secureApiCall(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': this.csrfToken,
                ...options.headers
            },
            credentials: 'same-origin', // Include cookies
            ...options
        };

        // Add session token if available
        const sessionToken = this.getSessionToken();
        if (sessionToken) {
            config.headers['Authorization'] = `Bearer ${sessionToken}`;
        }

        try {
            const response = await fetch(endpoint, config);
            
            // Handle common security responses
            if (response.status === 401) {
                this.logout('Session expired');
                throw new Error('Authentication required');
            }
            
            if (response.status === 403) {
                throw new Error('Access forbidden');
            }
            
            if (response.status === 429) {
                throw new Error('Too many requests. Please try again later.');
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Secure API call failed:', error);
            throw error;
        }
    }

    async login(username, password) {
        // Never hash passwords on the frontend!
        // Send plain password to server over HTTPS
        
        try {
            const response = await this.secureApiCall('/api/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (response.success) {
                // Store session token securely
                this.storage.set('sessionToken', response.session_token);
                this.storage.set('currentUser', response.user);
                
                // Set up automatic token refresh
                this.setupTokenRefresh();
                
                return response.user;
            } else {
                throw new Error(response.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    async register(userData) {
        try {
            // Validate data client-side first
            this.validateRegistrationData(userData);
            
            const response = await this.secureApiCall('/api/users', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            if (response.success) {
                // Automatically log in after successful registration
                return await this.login(userData.username, userData.password);
            } else {
                throw new Error(response.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    validateRegistrationData(data) {
        const errors = [];

        // Email validation
        if (!data.username || !this.isValidEmail(data.username)) {
            errors.push('Valid email address is required');
        }

        // Password validation
        if (!data.password || data.password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        // Name validation
        if (!data.firstName || data.firstName.trim().length < 2) {
            errors.push('First name is required');
        }

        if (!data.lastName || data.lastName.trim().length < 2) {
            errors.push('Last name is required');
        }

        // Skills validation
        if (!Array.isArray(data.skillsHave) || data.skillsHave.length === 0) {
            errors.push('At least one skill you have is required');
        }

        if (!Array.isArray(data.skillsWant) || data.skillsWant.length === 0) {
            errors.push('At least one skill you want to learn is required');
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getSessionToken() {
        return this.storage.get('sessionToken');
    }

    getCurrentUser() {
        return this.storage.get('currentUser');
    }

    setupTokenRefresh() {
        // Refresh token every 25 minutes (before 30-minute expiry)
        setInterval(async () => {
            try {
                const response = await this.secureApiCall('/api/refresh-token', {
                    method: 'POST'
                });
                
                if (response.token) {
                    this.storage.set('sessionToken', response.token);
                }
            } catch (error) {
                console.error('Token refresh failed:', error);
                this.logout('Session expired');
            }
        }, 25 * 60 * 1000);
    }

    logout(reason = 'Logged out') {
        // Clear all stored data
        this.storage.remove('sessionToken');
        this.storage.remove('currentUser');
        
        // Notify server
        this.secureApiCall('/api/logout', { method: 'POST' }).catch(() => {
            // Ignore errors on logout
        });
        
        // Redirect to login page
        if (reason !== 'Logged out') {
            alert(reason);
        }
        
        window.location.href = '/login.html';
    }

    // XSS protection utility
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Input sanitization
    sanitizeInput(input, maxLength = 255) {
        if (typeof input !== 'string') return '';
        
        return this.escapeHtml(input.trim().substring(0, maxLength));
    }
}

// Initialize secure frontend
const secureFrontend = new SecureFrontend();

// Export for use in other scripts
window.SecureFrontend = SecureFrontend;
window.secureFrontend = secureFrontend;