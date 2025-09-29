// marco.js
// Fetch user skills_want and display as selectable options

document.addEventListener('DOMContentLoaded', async function() {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    let skillsWant = [];
    if (user && user.skillsWant) {
        // skillsWant may be a string (comma separated) or array
        if (Array.isArray(user.skillsWant)) {
            skillsWant = user.skillsWant;
        } else if (typeof user.skillsWant === 'string') {
            skillsWant = user.skillsWant.split(',').map(s => s.trim()).filter(Boolean);
        }
    }
    const container = document.getElementById('skillsWantContainer');
    container.innerHTML = '';
    if (skillsWant.length === 0) {
        container.innerHTML = '<p>No skills found. Please add skills you want to learn in your profile.</p>';
        return;
    }
    // Create radio buttons for each skill
    skillsWant.forEach((skill, idx) => {
        const label = document.createElement('label');
        label.className = 'skill-radio-label';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'skillWant';
        radio.value = skill;
        if (idx === 0) radio.checked = true;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(' ' + skill));
        container.appendChild(label);
        container.appendChild(document.createElement('br'));
    });
});
