// getstarted.js - Handles Get Started button navigation

document.addEventListener('DOMContentLoaded', function() {
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            window.location.href = 'learning.html';
        });
    }
});

// Add logout function for logout button
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear session data
        localStorage.removeItem('currentSession');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMeToken');
        // Redirect to login page
        window.location.href = 'login.html';
    }
}
