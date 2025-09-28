let deviceFingerprint = '';

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

function showStatus(message, type = 'success') {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

function refreshData() {
    deviceFingerprint = generateDeviceFingerprint();
    document.getElementById('deviceInfo').textContent = deviceFingerprint;
    
    // Check device binding
    const deviceBindings = JSON.parse(localStorage.getItem('deviceBindings') || '{}');
    const emailBindings = JSON.parse(localStorage.getItem('emailBindings') || '{}');
    const boundEmail = deviceBindings[deviceFingerprint];
    
    let bindingStatusHtml = '';
    if (boundEmail) {
        bindingStatusHtml = `
            <div style="color: #dc3545; padding: 15px; background: #f8d7da; border-radius: 8px;">
                <strong>Device is BOUND</strong><br>
                Bound to email: <code>${boundEmail}</code>
            </div>
        `;
    } else {
        bindingStatusHtml = `
            <div style="color: #28a745; padding: 15px; background: #d4edda; border-radius: 8px;">
                <strong>Device is FREE</strong><br>
                No account bound to this device
            </div>
        `;
    }
    document.getElementById('bindingStatus').innerHTML = bindingStatusHtml;
    
    // Load users
    const users = JSON.parse(localStorage.getItem('skillSwapUsers') || '[]');
    document.getElementById('userCount').innerHTML = `
        <p><strong>Total Users:</strong> ${users.length}</p>
        <p><strong>Device Bindings:</strong> ${Object.keys(deviceBindings).length}</p>
        <p><strong>Email Bindings:</strong> ${Object.keys(emailBindings).length}</p>
    `;
    
    // Show users table
    if (users.length > 0) {
        const tableBody = document.getElementById('usersTableBody');
        tableBody.innerHTML = '';
        
        users.forEach(user => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td><code>${user.deviceFingerprint || 'N/A'}</code></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            `;
        });
        
        document.getElementById('usersTable').style.display = 'table';
    } else {
        document.getElementById('usersTable').style.display = 'none';
    }
}

function clearDeviceBindings() {
    if (confirm('Are you sure you want to clear all device bindings? This will allow new accounts to be created on any device.')) {
        localStorage.removeItem('deviceBindings');
        localStorage.removeItem('emailBindings');
        showStatus('Device bindings cleared successfully!');
        refreshData();
    }
}

function clearAllUsers() {
    if (confirm('Are you sure you want to delete all user accounts? This action cannot be undone.')) {
        localStorage.removeItem('skillSwapUsers');
        showStatus('All user accounts deleted!');
        refreshData();
    }
}

function clearAllData() {
    if (confirm('This will delete EVERYTHING: users, bindings, and sessions. Are you absolutely sure?')) {
        if (confirm('Last chance! This will completely reset the application. Continue?')) {
            // Clear all skill swapping related data
            localStorage.removeItem('skillSwapUsers');
            localStorage.removeItem('deviceBindings');
            localStorage.removeItem('emailBindings');
            localStorage.removeItem('currentSession');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('rememberMeToken');
            
            showStatus('All data cleared! Application reset to initial state.');
            refreshData();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    refreshData();
});
