// Generate device fingerprint
function generateDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
}

const deviceFingerprint = generateDeviceFingerprint();

// Hash password function
// Simple password hashing function for mobile compatibility
async function hashPassword(password) {
    // For demo purposes, we'll use a simple hash
    // In production, this should be done server-side
    return btoa(password + 'skillswap_salt').replace(/[^a-zA-Z0-9]/g, '');
}

// Validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const field = document.getElementById(fieldId);
    
    if (field) field.style.borderColor = '#dc3545';
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const field = document.getElementById(fieldId);
    
    if (field) field.style.borderColor = '#e1e5e9';
    if (errorElement) errorElement.style.display = 'none';
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const button = document.getElementById('loginBtn');
    
    if (show) {
        loading.style.display = 'block';
        button.disabled = true;
        button.textContent = 'Signing In...';
    } else {
        loading.style.display = 'none';
        button.disabled = false;
        button.textContent = 'Sign In';
    }
}


async function loginUser(email, password, rememberMe) {
    const hashedPassword = await hashPassword(password);
    // Send login request to backend
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: email, password: hashedPassword })
    });
    const result = await response.json();
    if (response.ok) {
        // Create session (frontend only, for demo)
        const sessionData = {
            email: email,
            deviceFingerprint: deviceFingerprint,
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe,
            user: result.user
        };
        localStorage.setItem('currentSession', JSON.stringify(sessionData));
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        if (rememberMe) {
            localStorage.setItem('rememberMeToken', btoa(email + ':' + deviceFingerprint));
        }
        return result.user;
    } else {
        if (result.error === 'Invalid username or password') {
            throw new Error('Invalid password');
        } else if (result.error === 'Username and password required') {
            throw new Error('Please enter your email and password');
        } else {
            throw new Error(result.error || 'Login failed');
        }
    }
}

// Form submission handler
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Reset errors
    hideError('email');
    hideError('password');
    
    // Validate inputs
    let isValid = true;
    
    if (!email) {
        showError('email', 'Please enter your email address');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!password) {
        showError('password', 'Please enter your password');
        isValid = false;
    }
    
    if (!isValid) return;
    
    showLoading(true);
    
    try {
        const user = await loginUser(email, password, rememberMe);
        
        // Show success message
        document.getElementById('successMessage').style.display = 'block';
        
        // Redirect after a short delay
        setTimeout(() => {
            // Check if home page exists, otherwise redirect to dashboard
            window.location.href = 'home.html';
        }, 1500);
        
    } catch (error) {
        showLoading(false);
        
        if (error.message.includes('device is permanently bound') || 
            error.message.includes('device is not bound') || 
            error.message.includes('bound to a different device')) {
            alert(error.message);
        } else if (error.message === 'User not found' || error.message === 'This email is not registered') {
            showError('email', 'No account found with this email address');
        } else if (error.message === 'Invalid password') {
            showError('password', 'Incorrect password');
        } else {
            alert('Login failed: ' + error.message);
        }
    }
});

// Forgot password function
function forgotPassword() {
    const email = document.getElementById('email').value.trim();
    if (email && validateEmail(email)) {
        alert(`Password reset instructions would be sent to ${email}\n\nNote: This is a demo - password reset is not implemented yet.`);
    } else {
        alert('Please enter your email address first');
        document.getElementById('email').focus();
    }
}

// Add input event listeners to hide errors
document.addEventListener('DOMContentLoaded', function() {
    const fields = ['email', 'password'];
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', function() {
                hideError(field);
            });
        }
    });

    // Check for remember me token
    const rememberToken = localStorage.getItem('rememberMeToken');
    if (rememberToken) {
        try {
            const [email, deviceId] = atob(rememberToken).split(':');
            if (deviceId === deviceFingerprint) {
                document.getElementById('email').value = email;
                document.getElementById('rememberMe').checked = true;
            }
        } catch (e) {
            // Invalid token, remove it
            localStorage.removeItem('rememberMeToken');
        }
    }
});

// Check for existing session on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentSession = localStorage.getItem('currentSession');
    if (currentSession) {
        try {
            const session = JSON.parse(currentSession);
            if (session.email && session.deviceFingerprint === deviceFingerprint) {
                // Valid session exists for this device, redirect to home
                window.location.href = 'home.html';
            }
        } catch (e) {
            // Invalid session, remove it
            localStorage.removeItem('currentSession');
        }
    }
});

// Add some nice enter key handling
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        const form = document.getElementById('loginForm');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
});
