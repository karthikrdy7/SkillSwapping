let currentStep = 1;
let skillsHave = [];
let skillsWant = [];
let deviceFingerprint = '';
let generatedOTP = '';

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

// Initialize device fingerprint on page load
function signupInit() {
    deviceFingerprint = generateDeviceFingerprint();
    document.getElementById('deviceId').textContent = deviceFingerprint;
    // Check if device is already bound
    checkDeviceBinding();
    updateStepButtons();
    document.getElementById('skillsHaveInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill('have');
        }
    });
    document.getElementById('skillsWantInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill('want');
        }
    });
}
document.addEventListener('DOMContentLoaded', signupInit);

// Check if device is already bound to an account
function checkDeviceBinding() {
    const deviceBindings = JSON.parse(localStorage.getItem('deviceBindings') || '{}');
    const boundEmail = deviceBindings[deviceFingerprint];
    if (boundEmail) {
        alert(`This device is already permanently bound to account: ${boundEmail}. You cannot create a new account on this device.`);
        window.location.href = 'login.html';
        return;
    }
}

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

function validatePassword(password) {
    return password.length >= 6;
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

// Step navigation
function changeStep(direction) {
    if (direction === 1 && !validateCurrentStep()) {
        return;
    }
    const newStep = currentStep + direction;
    if (newStep < 1 || newStep > 4) return;
    // Hide current step
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`step${currentStep}Content`).classList.remove('active');
    // Update current step
    currentStep = newStep;
    // Show new step
    document.getElementById(`step${currentStep}`).classList.add('active');
    document.getElementById(`step${currentStep}Content`).classList.add('active');
    // Mark previous steps as completed
    for (let i = 1; i < currentStep; i++) {
        document.getElementById(`step${i}`).classList.add('completed');
    }
    // Update buttons
    updateStepButtons();
    // Generate OTP when reaching step 4
    if (currentStep === 4) {
        generateOTP();
    }
}

function updateStepButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
    if (currentStep === 4) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

// Validate current step
function validateCurrentStep() {
    let isValid = true;
    if (currentStep === 1) {
        const fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'preferredLanguage'];
        fields.forEach(field => {
            const value = document.getElementById(field).value.trim();
            hideError(field);
            if (!value) {
                showError(field, 'This field is required');
                isValid = false;
            }
        });
        const email = document.getElementById('email').value.trim();
        if (email && !validateEmail(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }
        const password = document.getElementById('password').value;
        if (password && !validatePassword(password)) {
            showError('password', 'Password must be at least 6 characters long');
            isValid = false;
        }
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password && confirmPassword && password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }
        // Check if email is already registered
        if (email && validateEmail(email)) {
            const users = JSON.parse(localStorage.getItem('skillSwapUsers') || '[]');
            if (users.some(user => user.email === email)) {
                showError('email', 'This email is already registered');
                isValid = false;
            }
        }
    }
    if (currentStep === 2) {
        if (skillsHave.length === 0) {
            alert('Please add at least one skill you have');
            isValid = false;
        }
        if (skillsWant.length === 0) {
            alert('Please add at least one skill you want to learn');
            isValid = false;
        }
    }
    if (currentStep === 3) {
        // User must acknowledge the permanent binding
        const confirmed = confirm(
            'FINAL WARNING: Your account will be PERMANENTLY bound to this device. ' +
            'You will NEVER be able to use this account on any other device, and no other account can be used on this device. ' +
            'This binding is irreversible. Do you want to proceed?'
        );
        if (!confirmed) {
            isValid = false;
        }
    }
    return isValid;
}

// Skills management
function addSkill(type) {
    const inputId = type === 'have' ? 'skillsHaveInput' : 'skillsWantInput';
    const skillsArray = type === 'have' ? skillsHave : skillsWant;
    const tagsContainer = type === 'have' ? 'skillsHaveTags' : 'skillsWantTags';
    const input = document.getElementById(inputId);
    const skill = input.value.trim();
    if (skill && !skillsArray.includes(skill)) {
        skillsArray.push(skill);
        input.value = '';
        renderSkillTags(type, skillsArray, tagsContainer);
    }
}

function renderSkillTags(type, skillsArray, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    skillsArray.forEach((skill, index) => {
        const tag = document.createElement('div');
        tag.className = 'skill-tag';
        tag.innerHTML = `
            ${skill}
            <button type="button" class="remove-skill" onclick="removeSkill('${type}', ${index})">×</button>
        `;
        container.appendChild(tag);
    });
}

function removeSkill(type, index) {
    const skillsArray = type === 'have' ? skillsHave : skillsWant;
    const tagsContainer = type === 'have' ? 'skillsHaveTags' : 'skillsWantTags';
    skillsArray.splice(index, 1);
    renderSkillTags(type, skillsArray, tagsContainer);
}

// OTP Generation and Verification
function generateOTP() {
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById('otpDisplay').textContent = generatedOTP;
}

function validateOTP() {
    const enteredOTP = document.getElementById('otpInput').value.trim();
    return enteredOTP === generatedOTP;
}

// Form submission
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        // Final validation
        if (!validateOTP()) {
            showError('otp', 'Invalid verification code. Please check and try again.');
            return;
        }
        try {
            // Check for permanent device binding conflicts one more time
            const deviceBindings = JSON.parse(localStorage.getItem('deviceBindings') || '{}');
            const emailBindings = JSON.parse(localStorage.getItem('emailBindings') || '{}');
            const email = document.getElementById('email').value.trim();
            // Check if device is bound to another account
            if (deviceBindings[deviceFingerprint]) {
                throw new Error('This device is already bound to another account.');
            }
            // Check if email is bound to another device
            if (emailBindings[email]) {
                throw new Error('This email is already bound to another device.');
            }
            // Hash the password
            const hashedPassword = await hashPassword(document.getElementById('password').value);
            // Create user object
            const user = {
                id: Date.now(),
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: email,
                password: hashedPassword,
                preferredLanguage: document.getElementById('preferredLanguage').value.trim(),
                skillsHave: skillsHave,
                skillsWant: skillsWant,
                deviceFingerprint: deviceFingerprint,
                createdAt: new Date().toISOString(),
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    screen: `${screen.width}x${screen.height}`
                }
            };
            // Save user to localStorage
            const users = JSON.parse(localStorage.getItem('skillSwapUsers') || '[]');
            users.push(user);
            localStorage.setItem('skillSwapUsers', JSON.stringify(users));
            // Create permanent bindings
            deviceBindings[deviceFingerprint] = email;
            emailBindings[email] = deviceFingerprint;
            localStorage.setItem('deviceBindings', JSON.stringify(deviceBindings));
            localStorage.setItem('emailBindings', JSON.stringify(emailBindings));
            // Show success message
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('submitBtn').disabled = true;
            // Redirect after success
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    });
}
