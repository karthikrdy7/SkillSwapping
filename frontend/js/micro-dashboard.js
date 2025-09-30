// Micro Learning Dashboard JavaScript

class MicroDashboardManager {
    constructor() {
        // Use relative URL so it works from any host (localhost, IP address, etc.)
        this.apiUrl = '/api';
        this.refreshInterval = null;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMicroDashboard();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadMicroDashboard());
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target.dataset.category);
            });
        });
    }

    startAutoRefresh() {
        // Auto-refresh every 15 seconds for micro learning (more frequent)
        this.refreshInterval = setInterval(() => {
            this.loadMicroDashboard(false);
        }, 15000);
    }

    async loadMicroDashboard(showLoading = true) {
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
            console.log('Micro dashboard data loaded:', users);

            // Process data for micro learning
            const microData = this.processMicroData(users);
            
            // Display the data
            this.displayMicroDashboard(microData);
            
        } catch (error) {
            console.error('Error loading Micro dashboard:', error);
            this.showError(error.message);
        }
    }

    processMicroData(users) {
        // Filter and process data for quick, bite-sized learning
        const onlineUsers = this.simulateOnlineUsers(users);
        const quickMatches = this.findQuickMatches(onlineUsers);
        const microSkills = this.extractMicroSkills(users);
        const liveTutoring = this.generateLiveTutoringSessions(onlineUsers);
        const quickTips = this.generateQuickTips();
        const challenges = this.generateChallenges();

        return {
            stats: {
                quickMatches: quickMatches.length,
                microSkills: microSkills.length,
                activeTutors: liveTutoring.length
            },
            quickMatches,
            microSkills,
            liveTutoring,
            quickTips,
            challenges,
            onlineUsers
        };
    }

    simulateOnlineUsers(users) {
        // Simulate some users being online
        return users.map(user => ({
            ...user,
            isOnline: Math.random() > 0.7, // 30% chance of being online
            lastSeen: new Date(Date.now() - Math.random() * 3600000) // Random time in last hour
        })).filter(user => user.isOnline);
    }

    findQuickMatches(onlineUsers) {
        const matches = [];
        
        for (let i = 0; i < onlineUsers.length; i++) {
            for (let j = i + 1; j < onlineUsers.length; j++) {
                const userA = onlineUsers[i];
                const userB = onlineUsers[j];
                
                const aCanTeachB = this.getMatchingSkills(userA.skills_have, userB.skills_want);
                const bCanTeachA = this.getMatchingSkills(userB.skills_have, userA.skills_want);
                
                if (aCanTeachB.length > 0 || bCanTeachA.length > 0) {
                    matches.push({
                        participants: [userA, userB],
                        skills: [...aCanTeachB, ...bCanTeachA],
                        isMutual: aCanTeachB.length > 0 && bCanTeachA.length > 0,
                        estimatedDuration: this.getQuickSessionDuration(),
                        sessionType: this.getSessionType()
                    });
                }
            }
        }

        return matches.slice(0, 10);
    }

    extractMicroSkills(users) {
        const allSkills = new Set();
        users.forEach(user => {
            if (user.skills_have) {
                user.skills_have.split(',').forEach(skill => {
                    allSkills.add(skill.trim());
                });
            }
        });

        return Array.from(allSkills).map(skill => ({
            name: skill,
            category: this.categorizeSkill(skill),
            icon: this.getSkillIcon(skill),
            duration: this.getMicroDuration(),
            difficulty: this.getDifficulty(),
            availableTutors: Math.floor(Math.random() * 5) + 1
        }));
    }

    generateLiveTutoringSessions(onlineUsers) {
        const sessions = [];
        const tutors = onlineUsers.filter(user => user.skills_have);

        tutors.slice(0, 6).forEach(tutor => {
            const skills = tutor.skills_have.split(',').map(s => s.trim());
            const randomSkill = skills[Math.floor(Math.random() * skills.length)];
            
            sessions.push({
                tutor: tutor,
                topic: this.generateSessionTopic(randomSkill),
                startTime: this.generateSessionTime(),
                duration: this.getQuickSessionDuration(),
                currentParticipants: Math.floor(Math.random() * 8) + 1,
                maxParticipants: 10,
                skill: randomSkill
            });
        });

        return sessions;
    }

    generateQuickTips() {
        const tips = [
            {
                category: "Productivity",
                content: "Use the Pomodoro Technique: 25 minutes focused work, 5-minute break. Repeat 4 times, then take a longer break.",
                icon: "⏰"
            },
            {
                category: "Programming",
                content: "Always write comments explaining WHY you're doing something, not WHAT you're doing.",
                icon: "💻"
            },
            {
                category: "Design",
                content: "Use the 60-30-10 rule for color schemes: 60% dominant color, 30% secondary, 10% accent.",
                icon: "🎨"
            },
            {
                category: "Communication",
                content: "Practice the 'pause and breathe' technique before responding in difficult conversations.",
                icon: "💬"
            },
            {
                category: "Learning",
                content: "Teach someone else what you just learned - it's the fastest way to solidify knowledge.",
                icon: "🧠"
            },
            {
                category: "Career",
                content: "Update your LinkedIn profile monthly, even with small achievements or new skills.",
                icon: "📈"
            }
        ];

        return tips.sort(() => Math.random() - 0.5).slice(0, 4);
    }

    generateChallenges() {
        const challenges = [
            {
                title: "CSS Flexbox Master",
                description: "Create a responsive navigation bar using only CSS Flexbox properties.",
                difficulty: "Beginner",
                category: "Web Development",
                timeLimit: "5:00"
            },
            {
                title: "JavaScript Array Ninja",
                description: "Transform data arrays using map, filter, and reduce in creative ways.",
                difficulty: "Intermediate",
                category: "Programming",
                timeLimit: "5:00"
            },
            {
                title: "Color Palette Creator",
                description: "Design a harmonious color palette for a mobile app interface.",
                difficulty: "Beginner",
                category: "Design",
                timeLimit: "5:00"
            },
            {
                title: "Elevator Pitch Pro",
                description: "Craft and record a compelling 60-second elevator pitch.",
                difficulty: "Intermediate",
                category: "Communication",
                timeLimit: "5:00"
            },
            {
                title: "Excel Formula Wizard",
                description: "Solve complex data problems using advanced Excel formulas.",
                difficulty: "Advanced",
                category: "Analytics",
                timeLimit: "5:00"
            }
        ];

        return challenges.sort(() => Math.random() - 0.5).slice(0, 3);
    }

    // Helper methods
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

    categorizeSkill(skill) {
        const skillLower = skill.toLowerCase();
        
        if (this.isTechSkill(skillLower)) return 'tech';
        if (this.isDesignSkill(skillLower)) return 'design';
        if (this.isBusinessSkill(skillLower)) return 'business';
        if (this.isLanguageSkill(skillLower)) return 'language';
        
        return 'other';
    }

    isTechSkill(skill) {
        const techKeywords = ['programming', 'coding', 'javascript', 'python', 'java', 'web', 'software', 'development', 'database', 'api'];
        return techKeywords.some(keyword => skill.includes(keyword));
    }

    isDesignSkill(skill) {
        const designKeywords = ['design', 'ui', 'ux', 'graphics', 'photoshop', 'illustrator', 'figma', 'sketch'];
        return designKeywords.some(keyword => skill.includes(keyword));
    }

    isBusinessSkill(skill) {
        const businessKeywords = ['management', 'marketing', 'sales', 'business', 'finance', 'accounting', 'strategy'];
        return businessKeywords.some(keyword => skill.includes(keyword));
    }

    isLanguageSkill(skill) {
        const languageKeywords = ['english', 'spanish', 'french', 'german', 'chinese', 'japanese', 'language', 'communication'];
        return languageKeywords.some(keyword => skill.includes(keyword));
    }

    getSkillIcon(skill) {
        const skillLower = skill.toLowerCase();
        
        if (this.isTechSkill(skillLower)) return '💻';
        if (this.isDesignSkill(skillLower)) return '🎨';
        if (this.isBusinessSkill(skillLower)) return '💼';
        if (this.isLanguageSkill(skillLower)) return '🗣️';
        
        return '⚡';
    }

    getMicroDuration() {
        const durations = ['5 min', '10 min', '15 min', '20 min'];
        return durations[Math.floor(Math.random() * durations.length)];
    }

    getQuickSessionDuration() {
        const durations = ['15 min', '30 min', '45 min'];
        return durations[Math.floor(Math.random() * durations.length)];
    }

    getDifficulty() {
        const levels = ['Beginner', 'Intermediate', 'Advanced'];
        return levels[Math.floor(Math.random() * levels.length)];
    }

    getInitials(firstName, lastName) {
        const first = firstName && typeof firstName === 'string' ? firstName.charAt(0).toUpperCase() : 'U';
        const last = lastName && typeof lastName === 'string' ? lastName.charAt(0).toUpperCase() : 'N';
        return first + last;
    }

    getFirstInitial(firstName) {
        return firstName && typeof firstName === 'string' ? firstName.charAt(0).toUpperCase() : 'U';
    }

    getSessionType() {
        const types = ['Q&A Session', 'Quick Tutorial', 'Skill Demo', 'Practice Session'];
        return types[Math.floor(Math.random() * types.length)];
    }

    generateSessionTopic(skill) {
        const topics = [
            `Quick ${skill} Tips`,
            `${skill} Fundamentals`,
            `Common ${skill} Mistakes`,
            `${skill} Best Practices`,
            `${skill} Q&A Session`
        ];
        return topics[Math.floor(Math.random() * topics.length)];
    }

    generateSessionTime() {
        const now = new Date();
        const minutes = Math.floor(Math.random() * 60);
        const startTime = new Date(now.getTime() + minutes * 60000);
        return startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Display methods
    displayMicroDashboard(data) {
        try {
            this.updateStats(data.stats);
            this.displayQuickMatches(data.quickMatches);
            this.displayMicroSkills(data.microSkills);
            this.displayLiveTutoring(data.liveTutoring);
            this.displayQuickTips(data.quickTips);
            this.displayChallenges(data.challenges);
            this.showContent();
        } catch (error) {
            console.error('Error displaying Micro dashboard:', error);
            this.showError('Error processing data: ' + error.message);
        }
    }

    updateStats(stats) {
        document.getElementById('quickMatches').textContent = stats.quickMatches;
        document.getElementById('microSkills').textContent = stats.microSkills;
        document.getElementById('activeTutors').textContent = stats.activeTutors;
    }

    displayQuickMatches(matches) {
        const container = document.getElementById('quickMatchesList');
        const section = document.getElementById('quickMatchesSection');
        
        if (matches.length === 0) {
            container.innerHTML = `
                <div class="micro-no-data">
                    <div class="micro-no-data-icon">⚡</div>
                    <p>No quick matches available right now</p>
                </div>
            `;
        } else {
            container.innerHTML = matches.map(match => `
                <div class="quick-match-card">
                    <div class="online-indicator">🟢 ONLINE</div>
                    <div class="match-participants">
                        <div class="participant">
                            <div class="participant-avatar">${this.getFirstInitial(match.participants[0].first_name)}</div>
                            <div>${match.participants[0].first_name || 'User'}</div>
                        </div>
                        <div class="exchange-icon">⚡</div>
                        <div class="participant">
                            <div class="participant-avatar">${this.getFirstInitial(match.participants[1].first_name)}</div>
                            <div>${match.participants[1].first_name || 'User'}</div>
                        </div>
                    </div>
                    <div class="match-skills">
                        ${match.skills.map(skill => `<span class="quick-skill">${skill}</span>`).join('')}
                    </div>
                    <div class="session-info">
                        <div>⏱️ Duration: ${match.estimatedDuration}</div>
                        <div>📝 Type: ${match.sessionType}</div>
                        ${match.isMutual ? '<div class="quick-learning-badge">Mutual Exchange</div>' : ''}
                    </div>
                    <button class="start-session-btn" onclick="startQuickSession('${match.participants[0].id}', '${match.participants[1].id}')">
                        Start Quick Session
                    </button>
                </div>
            `).join('');
        }
        
        section.style.display = 'block';
    }

    displayMicroSkills(skills) {
        const container = document.getElementById('microSkillsList');
        const section = document.getElementById('microSkillsSection');
        
        container.innerHTML = skills.map(skill => `
            <div class="micro-skill-card" data-category="${skill.category}">
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-name">${skill.name}</div>
                <div class="skill-duration">${skill.duration}</div>
                <div class="skill-info">
                    <span class="skill-difficulty">${skill.difficulty}</span>
                    <span class="micro-indicator">${skill.availableTutors} tutors</span>
                </div>
            </div>
        `).join('');
        
        this.filterSkills();
        section.style.display = 'block';
    }

    displayLiveTutoring(sessions) {
        const container = document.getElementById('liveTutoringList');
        const section = document.getElementById('liveTutoringSection');
        
        if (sessions.length === 0) {
            container.innerHTML = `
                <div class="micro-no-data">
                    <div class="micro-no-data-icon">🎓</div>
                    <p>No live tutoring sessions right now</p>
                </div>
            `;
        } else {
            container.innerHTML = sessions.map(session => `
                <div class="live-session-card">
                    <div class="live-badge">LIVE</div>
                    <div class="tutor-info">
                        <div class="tutor-avatar">${this.getFirstInitial(session.tutor.first_name)}</div>
                        <div>
                            <div class="tutor-name">${session.tutor.first_name || 'Unknown'} ${session.tutor.last_name || 'Tutor'}</div>
                            <div class="session-topic">${session.topic}</div>
                        </div>
                    </div>
                    <div class="session-details">
                        <div class="session-time">🕐 Starts at ${session.startTime}</div>
                        <div class="session-duration">⏱️ ${session.duration}</div>
                        <div class="session-participants">👥 ${session.currentParticipants}/${session.maxParticipants} joined</div>
                    </div>
                    <button class="join-btn" onclick="joinLiveSession('${session.tutor.id}')">
                        Join Live Session
                    </button>
                </div>
            `).join('');
        }
        
        section.style.display = 'block';
    }

    displayQuickTips(tips) {
        const container = document.getElementById('quickTipsList');
        const section = document.getElementById('quickTipsSection');
        
        container.innerHTML = tips.map(tip => `
            <div class="tip-card">
                <div class="tip-category">${tip.category}</div>
                <div class="tip-content">${tip.icon} ${tip.content}</div>
            </div>
        `).join('');
        
        section.style.display = 'block';
    }

    displayChallenges(challenges) {
        const container = document.getElementById('challengesList');
        const section = document.getElementById('challengesSection');
        
        container.innerHTML = challenges.map(challenge => `
            <div class="challenge-card">
                <div class="challenge-timer">
                    <div class="challenge-title">${challenge.title}</div>
                    <div class="timer-display">${challenge.timeLimit}</div>
                </div>
                <div class="challenge-description">${challenge.description}</div>
                <div class="challenge-meta">
                    <span class="challenge-difficulty">${challenge.difficulty}</span>
                    <span class="challenge-category">${challenge.category}</span>
                </div>
                <button class="start-challenge-btn" onclick="startChallenge('${challenge.title}')">
                    Start Challenge
                </button>
            </div>
        `).join('');
        
        section.style.display = 'block';
    }

    setActiveFilter(category) {
        this.activeFilter = category;
        
        // Update filter button styles
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Filter skills
        this.filterSkills();
    }

    filterSkills() {
        const skillCards = document.querySelectorAll('.micro-skill-card');
        
        skillCards.forEach(card => {
            const category = card.dataset.category;
            if (this.activeFilter === 'all' || category === this.activeFilter) {
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
        document.getElementById('quickMatchesSection').style.display = 'none';
        document.getElementById('microSkillsSection').style.display = 'none';
        document.getElementById('liveTutoringSection').style.display = 'none';
        document.getElementById('quickTipsSection').style.display = 'none';
        document.getElementById('challengesSection').style.display = 'none';
    }
}

// Global functions for UI interactions
function startQuickSession(userId1, userId2) {
    alert(`Starting quick learning session between users ${userId1} and ${userId2}...`);
}

function joinLiveSession(tutorId) {
    alert(`Joining live tutoring session with ${tutorId}...`);
}

function startChallenge(challengeTitle) {
    alert(`Starting 5-minute challenge: ${challengeTitle}...`);
}

// Global function for retry button
function loadMicroDashboard() {
    if (window.microDashboard) {
        window.microDashboard.loadMicroDashboard();
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Micro dashboard page loaded, initializing...');
    window.microDashboard = new MicroDashboardManager();
});