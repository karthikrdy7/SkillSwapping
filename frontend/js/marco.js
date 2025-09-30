// marco.js
// Fetch all users and display skills that users want to learn

document.addEventListener('DOMContentLoaded', async function() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const skillsWantContainer = document.getElementById('skillsWantContainer');
    const usersContainer = document.getElementById('usersContainer');
    const errorMessage = document.getElementById('errorMessage');
    
    console.log('Marco.js loaded - starting to fetch users data...');
    
    // Show a simple message first to test if JavaScript is working
    loadingIndicator.innerHTML = '<p>JavaScript is working! Fetching data...</p>';
    
    try {
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        console.log('Fetching from /api/users...');
        
        // Fetch all users from backend
        const response = await fetch('http://127.0.0.1:8001/api/users');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const users = await response.json();
        console.log('Users data received:', users);
        
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        
        if (!users || users.length === 0) {
            console.log('No users found');
            errorMessage.innerHTML = '<p>No users found in the database.</p>';
            errorMessage.style.display = 'block';
            return;
        }
        
        console.log(`Found ${users.length} users, processing skills...`);
        
        // Simple test display first
        skillsWantContainer.innerHTML = `<h3>Skills Data Found!</h3><p>Successfully loaded ${users.length} users.</p>`;
        skillsWantContainer.style.display = 'block';
        
        // Process skills that users want to learn
        try {
            displaySkillsFrequency(users);
            displayUsersAndGoals(users);
        } catch (displayError) {
            console.error('Error in display functions:', displayError);
            errorMessage.innerHTML = `<p>Error processing data: ${displayError.message}</p>`;
            errorMessage.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error fetching users:', error);
        loadingIndicator.style.display = 'none';
        errorMessage.innerHTML = `<p>Error loading data: ${error.message}</p><p>Please make sure the backend server is running.</p>`;
        errorMessage.style.display = 'block';
    }
});

function displaySkillsFrequency(users) {
    console.log('Displaying skills frequency...');
    try {
        const skillsWantContainer = document.getElementById('skillsWantContainer');
        const skillsList = document.getElementById('skillsList');
        
        // Count frequency of skills that users want to learn
        const skillsCount = {};
        const totalUsers = users.length;
        
        users.forEach(user => {
            console.log('Processing user:', user.first_name, 'Skills want:', user.skills_want);
            if (user.skills_want && user.skills_want.length > 0) {
                user.skills_want.forEach(skill => {
                    // Ensure skill is a string before calling trim
                    const skillStr = String(skill || '');
                    const normalizedSkill = skillStr.trim().toLowerCase();
                    if (normalizedSkill) {
                        skillsCount[normalizedSkill] = (skillsCount[normalizedSkill] || 0) + 1;
                    }
                });
            }
        });
        
        console.log('Skills count:', skillsCount);
        
        if (Object.keys(skillsCount).length === 0) {
            skillsList.innerHTML = '<p>No learning goals found among users.</p>';
            skillsWantContainer.style.display = 'block';
            return;
        }
        
        // Sort skills by frequency
        const sortedSkills = Object.entries(skillsCount)
            .sort((a, b) => b[1] - a[1])
            .map(([skill, count]) => ({
                name: skill,
                count: count,
                percentage: Math.round((count / totalUsers) * 100)
            }));
        
        console.log('Sorted skills:', sortedSkills);
        
        // Create skills grid - simplified version first
        skillsList.innerHTML = '<h4>Most Wanted Skills:</h4>';
        sortedSkills.forEach(skill => {
            const skillName = String(skill.name || '').trim();
            const displayName = skillName ? skillName.charAt(0).toUpperCase() + skillName.slice(1) : 'Unknown';
            
            skillsList.innerHTML += `<div style="margin: 10px 0; padding: 10px; background: #f0f0f0; border-radius: 5px;">
                <strong>${displayName}</strong> - 
                ${skill.count} user${skill.count > 1 ? 's' : ''} want to learn this (${skill.percentage}%)
            </div>`;
        });
        
        skillsWantContainer.style.display = 'block';
        console.log('Skills frequency display completed');
    } catch (error) {
        console.error('Error in displaySkillsFrequency:', error);
        throw error;
    }
}

function displayUsersAndGoals(users) {
    console.log('Displaying users and goals...');
    const usersContainer = document.getElementById('usersContainer');
    const usersList = document.getElementById('usersList');
    
    usersList.innerHTML = '<h4>All Users:</h4>';
    
    users.forEach(user => {
        const firstName = String(user.first_name || '').trim();
        const lastName = String(user.last_name || '').trim();
        const fullName = `${firstName} ${lastName}`.trim();
        const skillsWant = user.skills_want || [];
        const skillsHave = user.skills_have || [];
        
        usersList.innerHTML += `<div style="margin: 15px 0; padding: 15px; background: #fff; border: 1px solid #ddd; border-radius: 8px;">
            <h5>${fullName || 'Anonymous User'}</h5>
            ${skillsWant.length > 0 ? `<p><strong>Wants to learn:</strong> ${skillsWant.join(', ')}</p>` : ''}
            ${skillsHave.length > 0 ? `<p><strong>Can teach:</strong> ${skillsHave.join(', ')}</p>` : ''}
        </div>`;
    });
    
    usersContainer.style.display = 'block';
    console.log('Users and goals display completed');
}

function displaySkillsFrequency(skillsMap, container) {
    // Sort skills by frequency (most wanted first)
    const sortedSkills = Array.from(skillsMap.entries())
        .sort((a, b) => b[1] - a[1]);
    
    let html = '<div class="skills-grid">';
    
    sortedSkills.forEach(([skill, count]) => {
        const percentage = Math.round((count / skillsMap.size) * 100);
        html += `
            <div class="skill-card">
                <div class="skill-name">${capitalizeFirst(skill)}</div>
                <div class="skill-count">${count} user${count > 1 ? 's' : ''} want${count === 1 ? 's' : ''} to learn this</div>
                <div class="skill-bar">
                    <div class="skill-progress" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function displayUsersWithSkills(users, container) {
    let html = '<div class="users-grid">';
    
    users.forEach(user => {
        html += `
            <div class="user-card">
                <div class="user-header">
                    <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                    <div class="user-name">${user.name}</div>
                </div>
                <div class="user-skills">
                    <div class="skills-section">
                        <h4>Wants to Learn:</h4>
                        <div class="skills-tags">
                            ${user.skills.map(skill => 
                                `<span class="skill-tag want">${skill.trim()}</span>`
                            ).join('')}
                        </div>
                    </div>
                    ${user.skillsHave.length > 0 ? `
                        <div class="skills-section">
                            <h4>Can Teach:</h4>
                            <div class="skills-tags">
                                ${user.skillsHave.map(skill => 
                                    `<span class="skill-tag have">${skill.trim()}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
