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
        console.log('Fetching users data...');
        const response = await fetch('/api/users');
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
            // Remove the detailed user display
            // displayUsersAndGoals(users);
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
        
        // Check if DOM elements exist
        if (!skillsWantContainer || !skillsList) {
            console.error('Required DOM elements not found:', {
                skillsWantContainer: !!skillsWantContainer,
                skillsList: !!skillsList
            });
            return;
        }
        
        // Count frequency of skills that users want to learn
        const skillsCount = {};
        const totalUsers = users.length;
        
        users.forEach(user => {
            console.log('Processing user:', user.first_name, 'Skills want:', user.skills_want);
            if (user.skills_want && user.skills_want.length > 0) {
                // Handle both string and array formats
                let skillsArray;
                if (typeof user.skills_want === 'string') {
                    skillsArray = user.skills_want.split(',').map(s => s.trim()).filter(s => s.length > 0);
                } else if (Array.isArray(user.skills_want)) {
                    skillsArray = user.skills_want;
                } else {
                    skillsArray = [];
                }
                
                skillsArray.forEach(skill => {
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
        
        // Just show the simple success message without detailed skills
        skillsList.innerHTML = '';
        skillsWantContainer.style.display = 'block';
        console.log('Skills frequency display completed (simplified)');
    } catch (error) {
        console.error('Error in displaySkillsFrequency:', error);
        throw error;
    }
}

function displayUsersAndGoals(users) {
    console.log('Displaying users and goals...');
    try {
        const usersContainer = document.getElementById('usersContainer');
        const usersList = document.getElementById('usersList');
        
        // Check if DOM elements exist
        if (!usersContainer || !usersList) {
            console.error('Required DOM elements not found:', {
                usersContainer: !!usersContainer,
                usersList: !!usersList
            });
            return;
        }
        
        usersList.innerHTML = '<h4>All Users:</h4>';
    
    users.forEach(user => {
        const firstName = String(user.first_name || '').trim();
        const lastName = String(user.last_name || '').trim();
        const fullName = `${firstName} ${lastName}`.trim();
        
        // Handle skills_want (can be string or array)
        let skillsWant = [];
        if (user.skills_want) {
            if (typeof user.skills_want === 'string') {
                skillsWant = user.skills_want.split(',').map(s => s.trim()).filter(s => s.length > 0);
            } else if (Array.isArray(user.skills_want)) {
                skillsWant = user.skills_want;
            }
        }
        
        // Handle skills_have (can be string or array)
        let skillsHave = [];
        if (user.skills_have) {
            if (typeof user.skills_have === 'string') {
                skillsHave = user.skills_have.split(',').map(s => s.trim()).filter(s => s.length > 0);
            } else if (Array.isArray(user.skills_have)) {
                skillsHave = user.skills_have;
            }
        }
        
        usersList.innerHTML += `<div style="margin: 15px 0; padding: 15px; background: #fff; border: 1px solid #ddd; border-radius: 8px;">
            <h5>${fullName || 'Anonymous User'}</h5>
            ${skillsWant.length > 0 ? `<p><strong>Wants to learn:</strong> ${skillsWant.join(', ')}</p>` : ''}
            ${skillsHave.length > 0 ? `<p><strong>Can teach:</strong> ${skillsHave.join(', ')}</p>` : ''}
        </div>`;
    });
    
        usersContainer.style.display = 'block';
        console.log('Users and goals display completed');
    } catch (error) {
        console.error('Error in displayUsersAndGoals:', error);
        throw error;
    }
}
