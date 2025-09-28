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
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    // Check if this device is permanently bound to any account
    const deviceBindings = JSON.parse(localStorage.getItem('deviceBindings') || '{}');
    const boundEmail = deviceBindings[deviceFingerprint];
    
    if (boundEmail && boundEmail !== email) {
        throw new Error(`This device is permanently bound to another account (${boundEmail}). No other accounts can be used on this device.`);
    }
    
    if (!boundEmail) {
        throw new Error('This device is not bound to any account. Please sign up first from this device.');
    }
    
    // Check if this email is bound to this device
    const emailBindings = JSON.parse(localStorage.getItem('emailBindings') || '{}');
    const boundDevice = emailBindings[email];
    
    if (!boundDevice) {
        throw new Error('This email is not registered. Please sign up first.');
    }
    
    if (boundDevice !== deviceFingerprint) {
        throw new Error('This email is bound to a different device. You cannot use this account on this device.');
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('skillSwapUsers') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) {
        throw new Error('User not found');
    }

    // Hash the provided password and compare
    const hashedPassword = await hashPassword(password);
    
    if (user.password !== hashedPassword) {
        throw new Error('Invalid password');
    }

    // Create session
    const sessionData = {
        email: email,
        deviceFingerprint: deviceFingerprint,
        loginTime: new Date().toISOString(),
        rememberMe: rememberMe,
        deviceInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screen: `${screen.width}x${screen.height}`
        }
    };

    localStorage.setItem('currentSession', JSON.stringify(sessionData));
    localStorage.setItem('currentUser', JSON.stringify(user));

    // If remember me is checked, set longer session
    if (rememberMe) {
        localStorage.setItem('rememberMeToken', btoa(email + ':' + deviceFingerprint));
    }

    return user;
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
