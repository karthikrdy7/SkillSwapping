// Marco Learning Dashboard JavaScript

class MarcoDashboardManager {
    constructor() {
        // Use relative URL so it works from any host (localhost, IP address, etc.)
        this.apiUrl = '/api';
        this.refreshInterval = null;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMarcoDashboard();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadMarcoDashboard());
        }

        // Skill filter
        const skillFilter = document.getElementById('skillFilter');
        if (skillFilter) {
            skillFilter.addEventListener('change', () => this.filterMentorships());
        }
    }

    startAutoRefresh() {
        // Auto-refresh every 60 seconds for macro learning (less frequent than micro)
        this.refreshInterval = setInterval(() => {
            this.loadMarcoDashboard(false);
        }, 60000);
    }

    async loadMarcoDashboard(showLoading = true) {
        try {
            if (showLoading) {
                this.showLoading();
            }

            // Fetch users data
            const usersResponse = await fetch(`${this.apiUrl}/users`);
            if (!usersResponse.ok) {
                throw new Error(`HTTP error! status: ${usersResponse.status}`);
            }
            
            const users = await usersResponse.json();
            console.log('Marco dashboard data loaded:', users);

            // Process data for macro learning
            const macroData = this.processMacroData(users);
            
            // Display the data
            this.displayMarcoDashboard(macroData);
            
        } catch (error) {
            console.error('Error loading Marco dashboard:', error);
            this.showError(error.message);
        }
    }

    processMacroData(users) {
        // Filter and process data for comprehensive learning
        const mentors = this.identifyMentors(users);
        const longTermMatches = this.findLongTermMatches(users);

        return {
            stats: {
                longTermMatches: users.length, // Use total users as "active users"
                comprehensiveSkills: this.getUniqueSkills(users).length,
                expertMentors: mentors.filter(m => m.isExpert).length
            },
            mentors,
            longTermMatches
        };
    }

    identifyMentors(users) {
        return users.filter(user => user.skills_have && user.skills_have.trim())
                   .map(user => {
                       const skills = user.skills_have.split(',').map(s => s.trim());
                       return {
                           ...user,
                           skillsArray: skills,
                           isExpert: skills.length >= 3, // Consider expert if has 3+ skills
                           availability: this.generateAvailability(),
                           experience: this.calculateExperience(skills),
                           mentorshipStyle: this.determineMentorshipStyle()
                       };
                   })
                   .sort((a, b) => b.skillsArray.length - a.skillsArray.length);
    }

    findLongTermMatches(users) {
        const matches = [];
        
        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                const userA = users[i];
                const userB = users[j];
                
                const aCanTeachB = this.getMatchingSkills(userA.skills_have, userB.skills_want);
                const bCanTeachA = this.getMatchingSkills(userB.skills_have, userA.skills_want);
                
                if (aCanTeachB.length > 0 && bCanTeachA.length > 0) {
                    matches.push({
                        mentor: userA,
                        mentee: userB,
                        skillsToTeach: aCanTeachB,
                        skillsToLearn: bCanTeachA,
                        compatibility: this.calculateCompatibility(userA, userB),
                        suggestedDuration: this.suggestDuration(aCanTeachB, bCanTeachA),
                        learningGoals: this.generateLearningGoals(aCanTeachB, bCanTeachA)
                    });
                }
            }
        }

        return matches.sort((a, b) => b.compatibility - a.compatibility).slice(0, 10);
    }

    // Helper methods
    getUniqueSkills(users) {
        const allSkills = new Set();
        users.forEach(user => {
            if (user.skills_have) {
                user.skills_have.split(',').forEach(skill => {
                    allSkills.add(skill.trim());
                });
            }
            if (user.skills_want) {
                user.skills_want.split(',').forEach(skill => {
                    allSkills.add(skill.trim());
                });
            }
        });
        return Array.from(allSkills);
    }

    getMatchingSkills(teacherSkills, studentWants) {
        if (!teacherSkills || !studentWants) return [];
        
        const teacherArray = teacherSkills.toLowerCase().split(',').map(s => s.trim());
        const wantArray = studentWants.toLowerCase().split(',').map(s => s.trim());
        
        return teacherArray.filter(skill => 
            wantArray.some(want => 
                skill.includes(want) || want.includes(skill) || skill === want
            )
        );
    }

    calculateCompatibility(userA, userB) {
        // Simple compatibility calculation based on shared interests and languages
        let score = 50; // Base score
        
        if (userA.preferred_language && userB.preferred_language) {
            const langA = userA.preferred_language.toLowerCase().split(',').map(l => l.trim());
            const langB = userB.preferred_language.toLowerCase().split(',').map(l => l.trim());
            const commonLangs = langA.filter(lang => langB.includes(lang));
            score += commonLangs.length * 15;
        }
        
        return Math.min(score, 100);
    }

    suggestDuration(skillsA, skillsB) {
        const totalSkills = skillsA.length + skillsB.length;
        if (totalSkills >= 6) return "6-12 months";
        if (totalSkills >= 4) return "3-6 months";
        return "2-4 months";
    }

    generateLearningGoals(skillsA, skillsB) {
        return [
            `Master ${skillsA.join(', ')} through structured learning`,
            `Develop expertise in ${skillsB.join(', ')} via practical projects`,
            `Build a comprehensive portfolio showcasing new skills`,
            `Achieve professional certification or recognition`
        ];
    }

    generateAvailability() {
        const availabilities = [
            "Weekends only",
            "Evenings (6-9 PM)",
            "Flexible schedule",
            "Mornings (9-12 PM)",
            "By appointment"
        ];
        return availabilities[Math.floor(Math.random() * availabilities.length)];
    }

    calculateExperience(skills) {
        const experiences = ["Beginner", "Intermediate", "Advanced", "Expert"];
        return experiences[Math.min(skills.length - 1, 3)];
    }

    determineMentorshipStyle() {
        const styles = [
            "Hands-on project-based",
            "Structured curriculum",
            "Flexible discussion-based",
            "Portfolio development",
            "Industry best practices"
        ];
        return styles[Math.floor(Math.random() * styles.length)];
    }

    getInitials(firstName, lastName) {
        const first = firstName && typeof firstName === 'string' ? firstName.charAt(0).toUpperCase() : 'U';
        const last = lastName && typeof lastName === 'string' ? lastName.charAt(0).toUpperCase() : 'N';
        return first + last;
    }

    isTechSkill(skill) {
        const techKeywords = ['programming', 'coding', 'javascript', 'python', 'java', 'web', 'software', 'development', 'database', 'api', 'framework', 'algorithm', 'data structure'];
        return techKeywords.some(keyword => skill.includes(keyword));
    }

    isBusinessSkill(skill) {
        const businessKeywords = ['management', 'leadership', 'marketing', 'sales', 'strategy', 'finance', 'operations', 'business', 'entrepreneurship', 'project management'];
        return businessKeywords.some(keyword => skill.includes(keyword));
    }

    isCreativeSkill(skill) {
        const creativeKeywords = ['design', 'art', 'creative', 'writing', 'photography', 'video', 'music', 'graphics', 'ui', 'ux', 'animation'];
        return creativeKeywords.some(keyword => skill.includes(keyword));
    }

    // Display methods
    displayMarcoDashboard(data) {
        try {
            this.updateStats(data.stats);
            this.displayMentorships(data.mentors);
            this.populateSkillFilter(data.mentors);
            this.showContent();
        } catch (error) {
            console.error('Error displaying Marco dashboard:', error);
            this.showError('Error processing data: ' + error.message);
        }
    }

    updateStats(stats) {
        const activeUsersElement = document.getElementById('activeUsers');
        const comprehensiveSkillsElement = document.getElementById('comprehensiveSkills');
        
        if (activeUsersElement) {
            activeUsersElement.textContent = stats.longTermMatches || 0;
        }
        if (comprehensiveSkillsElement) {
            comprehensiveSkillsElement.textContent = stats.comprehensiveSkills || 0;
        }
    }

    displayMentorships(mentors) {
        const container = document.getElementById('mentorshipList');
        const section = document.getElementById('mentorshipSection');
        
        if (mentors.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <div class="no-data-icon">🎓</div>
                    <p>No mentors available for comprehensive learning</p>
                </div>
            `;
        } else {
            container.innerHTML = mentors.slice(0, 12).map(mentor => `
                <div class="mentorship-card" data-skills="${mentor.skillsArray.join(',')}">
                    <div class="mentor-info">
                        <div class="mentor-avatar">${this.getInitials(mentor.first_name, mentor.last_name)}</div>
                        <div class="mentor-details">
                            <h3>${mentor.first_name || 'Unknown'} ${mentor.last_name || 'User'}</h3>
                            <div class="mentor-experience">${mentor.experience || 'Beginner'} Level</div>
                        </div>
                    </div>
                    <div class="mentor-skills">
                        ${mentor.skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                    <div class="mentorship-details">
                        <div class="mentorship-style">📚 Style: ${mentor.mentorshipStyle || 'Flexible'}</div>
                        <div class="availability">⏰ Available: ${mentor.availability || 'By appointment'}</div>
                        <div class="languages">🌍 Languages: ${mentor.preferred_language || 'English'}</div>
                    </div>
                    <button class="connect-btn" onclick="connectWithMentor('${mentor.id}')">
                        Connect for Long-term Learning
                    </button>
                </div>
            `).join('');
        }
        
        section.style.display = 'block';
    }

    populateSkillFilter(mentors) {
        const filter = document.getElementById('skillFilter');
        const allSkills = new Set();
        
        mentors.forEach(mentor => {
            mentor.skillsArray.forEach(skill => allSkills.add(skill));
        });
        
        const sortedSkills = Array.from(allSkills).sort();
        filter.innerHTML = '<option value="">All Skills</option>' + 
            sortedSkills.map(skill => `<option value="${skill}">${skill}</option>`).join('');
    }

    filterMentorships() {
        const selectedSkill = document.getElementById('skillFilter').value;
        const mentorshipCards = document.querySelectorAll('.mentorship-card');
        
        mentorshipCards.forEach(card => {
            const skills = card.dataset.skills.toLowerCase();
            if (!selectedSkill || skills.includes(selectedSkill.toLowerCase())) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    showLoading() {
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('errorState').style.display = 'none';
        this.hideContent();
    }

    showError(message) {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'block';
        document.getElementById('errorText').textContent = message;
        this.hideContent();
    }

    showContent() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'none';
    }

    hideContent() {
        document.getElementById('mentorshipSection').style.display = 'none';
    }
}

// Global functions for UI interactions
function connectWithMentor(mentorId) {
    alert(`Connecting with mentor ${mentorId} for long-term learning...`);
}

// Global function for retry button
function loadMarcoDashboard() {
    if (window.marcoDashboard) {
        window.marcoDashboard.loadMarcoDashboard();
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Marco dashboard page loaded, initializing...');
    window.marcoDashboard = new MarcoDashboardManager();
});