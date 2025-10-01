/**
 * Secure signup implementation for SkillSwapping
 * This replaces the insecure client-side password hashing
 */

class SecureSignup {
    constructor() {
        this.currentStep = 1;
        this.skillsHave = [];
        this.skillsWant = [];
        this.deviceFingerprint = '';
        this.generatedOTP = '';
        this.init();
    }

    init() {
        this.deviceFingerprint = this.generateDeviceFingerprint();
        document.getElementById('deviceId').textContent = this.deviceFingerprint;
        
        this.updateStepButtons();
        this.setupEventListeners();
        this.checkDeviceBinding();
    }

    setupEventListeners() {
        // Skills input handlers
        document.getElementById('skillsHaveInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addSkill('have');
            }
        });

        document.getElementById('skillsWantInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addSkill('want');
            }
        });

        // Form submission
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    generateDeviceFingerprint() {
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

    checkDeviceBinding() {
        const deviceBindings = JSON.parse(localStorage.getItem('deviceBindings') || '{}');
        const boundEmail = deviceBindings[this.deviceFingerprint];
        if (boundEmail) {
            alert(`This device is already permanently bound to account: ${boundEmail}. You cannot create a new account on this device.`);
            window.location.href = 'login.html';
            return;
        }
    }

    // Step navigation
    changeStep(direction) {
        if (direction === 1 && !this.validateCurrentStep()) {
            return;
        }
        
        const newStep = this.currentStep + direction;
        if (newStep < 1 || newStep > 4) return;
        
        // Hide current step
        document.getElementById(`step${this.currentStep}`).classList.remove('active');
        document.getElementById(`step${this.currentStep}Content`).classList.remove('active');
        
        // Update current step
        this.currentStep = newStep;
        
        // Show new step
        document.getElementById(`step${this.currentStep}`).classList.add('active');
        document.getElementById(`step${this.currentStep}Content`).classList.add('active');
        
        // Mark previous steps as completed
        for (let i = 1; i < this.currentStep; i++) {
            document.getElementById(`step${i}`).classList.add('completed');
        }
        
        this.updateStepButtons();
        
        // Generate OTP when reaching step 4
        if (this.currentStep === 4) {
            this.generateOTP();
        }
    }

    updateStepButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
        
        if (this.currentStep === 4) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }

    validateCurrentStep() {
        let isValid = true;
        
        if (this.currentStep === 1) {
            const fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'preferredLanguage'];
            
            fields.forEach(field => {
                const value = document.getElementById(field).value.trim();
                this.hideError(field);
                
                if (!value) {
                    this.showError(field, 'This field is required');
                    isValid = false;
                }
            });
            
            const email = document.getElementById('email').value.trim();
            if (email && !this.validateEmail(email)) {
                this.showError('email', 'Please enter a valid email address');
                isValid = false;
            }
            
            const password = document.getElementById('password').value;
            if (password && !this.validatePassword(password)) {
                this.showError('password', 'Password must be at least 8 characters long with at least one letter and one number');
                isValid = false;
            }
            
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (password && confirmPassword && password !== confirmPassword) {
                this.showError('confirmPassword', 'Passwords do not match');
                isValid = false;
            }
        }
        
        if (this.currentStep === 2) {
            if (this.skillsHave.length === 0) {
                alert('Please add at least one skill you have');
                isValid = false;
            }
            if (this.skillsWant.length === 0) {
                alert('Please add at least one skill you want to learn');
                isValid = false;
            }
        }
        
        if (this.currentStep === 3) {
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

    // Validation functions
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePassword(password) {
        // Strong password requirements
        return password.length >= 8 && 
               /[A-Za-z]/.test(password) && 
               /[0-9]/.test(password);
    }

    // Skills management
    addSkill(type) {
        const inputId = type === 'have' ? 'skillsHaveInput' : 'skillsWantInput';
        const skillsArray = type === 'have' ? this.skillsHave : this.skillsWant;
        const tagsContainer = type === 'have' ? 'skillsHaveTags' : 'skillsWantTags';
        
        const input = document.getElementById(inputId);
        const skill = input.value.trim();
        
        if (skill && !skillsArray.includes(skill)) {
            skillsArray.push(skill);
            input.value = '';
            this.renderSkillTags(type, skillsArray, tagsContainer);
        }
    }

    renderSkillTags(type, skillsArray, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        skillsArray.forEach((skill, index) => {
            const tag = document.createElement('div');
            tag.className = 'skill-tag';
            tag.innerHTML = `
                ${skill}
                <button type="button" class="remove-skill" onclick="secureSignup.removeSkill('${type}', ${index})">×</button>
            `;
            container.appendChild(tag);
        });
    }

    removeSkill(type, index) {
        const skillsArray = type === 'have' ? this.skillsHave : this.skillsWant;
        const tagsContainer = type === 'have' ? 'skillsHaveTags' : 'skillsWantTags';
        
        skillsArray.splice(index, 1);
        this.renderSkillTags(type, skillsArray, tagsContainer);
    }

    // OTP Generation and Verification
    generateOTP() {
        this.generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        document.getElementById('otpDisplay').textContent = this.generatedOTP;
    }

    validateOTP() {
        const enteredOTP = document.getElementById('otpInput').value.trim();
        return enteredOTP === this.generatedOTP;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Final validation
        if (!this.validateOTP()) {
            this.showError('otp', 'Invalid verification code. Please check and try again.');
            return;
        }
        
        try {
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value; // Send plain password
            
            const userData = {
                username: email,
                password: password, // Plain password - server will hash it securely
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                preferredLanguage: document.getElementById('preferredLanguage').value.trim(),
                skillsHave: this.skillsHave,
                skillsWant: this.skillsWant,
                deviceFingerprint: this.deviceFingerprint,
                createdAt: new Date().toISOString()
            };
            
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                document.getElementById('successMessage').style.display = 'block';
                document.getElementById('submitBtn').disabled = true;
                
                // Automatically log in after successful registration
                const loginResponse = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: email, password: password })
                });
                
                const loginResult = await loginResponse.json();
                
                if (loginResponse.ok) {
                    // Store session info
                    const sessionData = {
                        email: email,
                        sessionToken: loginResult.session_token,
                        loginTime: new Date().toISOString(),
                        rememberMe: false,
                        user: loginResult.user
                    };
                    
                    sessionStorage.setItem('currentSession', JSON.stringify(sessionData));
                    sessionStorage.setItem('currentUser', JSON.stringify(loginResult.user));
                    
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 1500);
                } else {
                    alert('Signup succeeded but automatic login failed: ' + (loginResult.error || 'Unknown error'));
                }
            } else {
                alert('Registration failed: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    }

    // Error handling utilities
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
}

// Initialize secure signup when DOM is ready
let secureSignup;
document.addEventListener('DOMContentLoaded', function() {
    secureSignup = new SecureSignup();
});

// Global functions for button handlers
function changeStep(direction) {
    if (secureSignup) {
        secureSignup.changeStep(direction);
    }
}

function addSkill(type) {
    if (secureSignup) {
        secureSignup.addSkill(type);
    }
}