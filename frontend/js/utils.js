/**
 * Shared utility functions for SkillSwapping frontend
 */

// Device fingerprinting utility
export function generateDeviceFingerprint() {
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

// Validation utilities
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePassword(password) {
    return password.length >= 6;
}

// Error handling utilities
export function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const field = document.getElementById(fieldId);
    
    if (field) field.style.borderColor = '#dc3545';
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

export function hideError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const field = document.getElementById(fieldId);
    
    if (field) field.style.borderColor = '#e1e5e9';
    if (errorElement) errorElement.style.display = 'none';
}

// API utilities
export async function apiCall(endpoint, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    try {
        const response = await fetch(endpoint, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Session management
export function getCurrentUser() {
    try {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error retrieving current user:', error);
        return null;
    }
}

export function getCurrentSession() {
    try {
        const sessionData = localStorage.getItem('currentSession');
        return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
        console.error('Error retrieving current session:', error);
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem('currentSession');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMeToken');
}