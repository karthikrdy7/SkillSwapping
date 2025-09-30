// SkillSwapping Dashboard JavaScript

class DashboardManager {
    constructor() {
        this.apiUrl = 'http://127.0.0.1:8001/api';
        this.refreshInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboard();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadDashboard());
        }
    }

    startAutoRefresh() {
        // Auto-refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadDashboard(false); // Silent refresh
        }, 30000);
    }

    async loadDashboard(showLoading = true) {
        try {
            if (showLoading) {
                this.showLoading();
            }

            // Fetch dashboard data from API
            const dashboardResponse = await fetch(`${this.apiUrl}/dashboard`);
            if (!dashboardResponse.ok) {
                throw new Error(`HTTP error! status: ${dashboardResponse.status}`);
            }
            
            const dashboardData = await dashboardResponse.json();
            console.log('Dashboard data loaded:', dashboardData);

            // Display the data
            this.displayDashboardData(dashboardData);
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showError(error.message);
        }
    }

    displayDashboardData(data) {
        try {
            // Update stats
            this.updateStats(
                data.stats.active_users, 
                data.stats.live_matches, 
                data.stats.total_opportunities
            );

            // Display sections
            this.displayActiveUsers(data.active_users);
            this.displayLiveMatches(data.matches.mutual.filter(m => m.both_online));
            this.displayOneWayOpportunities(data.matches.one_way.filter(m => m.both_online));
            this.displaySummary(
                data.stats.active_users, 
                data.stats.live_matches, 
                data.stats.total_opportunities - data.stats.live_matches
            );

            // Show content
            this.showContent();

        } catch (error) {
            console.error('Error displaying dashboard data:', error);
            this.showError('Error displaying dashboard data');
        }
    }

    isRecentlyActive(user) {
        // For demo purposes, consider users with recent created_at as active
        // In real implementation, this would check session data
        if (!user.created_at) return false;
        
        const createdDate = new Date(user.created_at);
        const now = new Date();
        const hoursDiff = (now - createdDate) / (1000 * 60 * 60);
        
        // Consider users created in last 24 hours as potentially active
        return hoursDiff < 24;
    }

    isUserActive(user, activeUsers) {
        return activeUsers.some(activeUser => activeUser.id === user.id);
    }

    calculateMatches(users) {
        const mutual = [];
        const oneWay = [];
        const processed = new Set();

        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                const userA = users[i];
                const userB = users[j];
                
                const pairKey = `${Math.min(userA.id, userB.id)}-${Math.max(userA.id, userB.id)}`;
                if (processed.has(pairKey)) continue;
                processed.add(pairKey);

                const aCanTeachB = this.getMatchingSkills(userA.skills_have, userB.skills_want);
                const bCanTeachA = this.getMatchingSkills(userB.skills_have, userA.skills_want);
                
                if (aCanTeachB.length > 0 && bCanTeachA.length > 0) {
                    // Mutual match
                    mutual.push({
                        user_a: userA,
                        user_b: userB,
                        a_teaches: aCanTeachB,
                        b_teaches: bCanTeachA,
                        languages: this.getCommonLanguages(userA.preferred_language, userB.preferred_language)
                    });
                } else if (aCanTeachB.length > 0) {
                    // One-way match A -> B
                    oneWay.push({
                        teacher: userA,
                        student: userB,
                        skills: aCanTeachB,
                        languages: this.getCommonLanguages(userA.preferred_language, userB.preferred_language)
                    });
                } else if (bCanTeachA.length > 0) {
                    // One-way match B -> A
                    oneWay.push({
                        teacher: userB,
                        student: userA,
                        skills: bCanTeachA,
                        languages: this.getCommonLanguages(userA.preferred_language, userB.preferred_language)
                    });
                }
            }
        }

        return { mutual, oneWay };
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

    getCommonLanguages(lang1, lang2) {
        if (!lang1 || !lang2) return [];
        
        const langs1 = lang1.toLowerCase().split(',').map(l => l.trim());
        const langs2 = lang2.toLowerCase().split(',').map(l => l.trim());
        
        return langs1.filter(lang => langs2.includes(lang));
    }

    updateStats(activeUsers, liveMatches, opportunities) {
        document.getElementById('activeUsers').textContent = activeUsers;
        document.getElementById('liveMatches').textContent = liveMatches;
        document.getElementById('totalOpportunities').textContent = liveMatches + opportunities;
    }

    displayActiveUsers(users) {
        const container = document.getElementById('activeUsersList');
        const section = document.getElementById('activeUsersSection');
        
        if (users.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <div class="no-data-icon">😴</div>
                    <p>No users are currently active</p>
                </div>
            `;
        } else {
            container.innerHTML = users.map(user => `
                <div class="user-card online">
                    <div class="user-status">🟢</div>
                    <div class="user-name">👤 ${user.first_name} ${user.last_name}</div>
                    <div class="user-skills">
                        <span class="skill-label">✅ Can teach:</span>
                        ${this.formatSkills(user.skills_have)}
                    </div>
                    <div class="user-skills">
                        <span class="skill-label">🎯 Wants to learn:</span>
                        ${this.formatSkills(user.skills_want)}
                    </div>
                    <div class="languages">🌍 Languages: ${user.preferred_language}</div>
                </div>
            `).join('');
        }
        
        section.style.display = 'block';
    }

    displayLiveMatches(matches) {
        const container = document.getElementById('liveMatchesList');
        const section = document.getElementById('liveMatchesSection');
        
        if (matches.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <div class="no-data-icon">💤</div>
                    <p>No live mutual exchanges available</p>
                </div>
            `;
        } else {
            container.innerHTML = matches.map((match, index) => `
                <div class="match-card">
                    <div class="live-indicator">🔴 LIVE</div>
                    <div class="match-header">${index + 1}. 🔄 MUTUAL EXCHANGE</div>
                    <div class="match-details">
                        <div class="user-match">
                            <div class="user-name">👨‍🏫 ${match.user_a.first_name} ${match.user_a.last_name}</div>
                            <div class="teaching-info">teaches ${this.formatSkillsList(match.a_teaches)}</div>
                        </div>
                        <div class="exchange-arrow">⟷</div>
                        <div class="user-match">
                            <div class="user-name">👨‍🏫 ${match.user_b.first_name} ${match.user_b.last_name}</div>
                            <div class="teaching-info">teaches ${this.formatSkillsList(match.b_teaches)}</div>
                        </div>
                    </div>
                    <div class="match-languages">
                        🌍 Common languages: ${match.languages.join(', ')}
                        <br>💡 Both users are online and can start learning immediately!
                    </div>
                </div>
            `).join('');
        }
        
        section.style.display = 'block';
    }

    displayOneWayOpportunities(opportunities) {
        const container = document.getElementById('oneWayList');
        const section = document.getElementById('oneWaySection');
        
        if (opportunities.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <div class="no-data-icon">✨</div>
                    <p>All teaching opportunities are part of mutual exchanges!</p>
                </div>
            `;
        } else {
            container.innerHTML = opportunities.map(opp => `
                <div class="opportunity-card">
                    <div class="opportunity-info">
                        <div class="opportunity-teacher">
                            👨‍🏫 ${opp.teacher.first_name} can teach ${this.formatSkillsList(opp.skills)} to ${opp.student.first_name} ${opp.student.last_name}
                        </div>
                        <div class="opportunity-skills">🌍 Languages: ${opp.languages.join(', ')}</div>
                    </div>
                </div>
            `).join('');
        }
        
        section.style.display = 'block';
    }

    displaySummary(activeUsers, liveMatches, opportunities) {
        const container = document.getElementById('summaryContent');
        const section = document.getElementById('summarySection');
        
        container.innerHTML = `
            <div class="summary-item">• ${activeUsers} users online and ready to learn</div>
            <div class="summary-item">• ${liveMatches} perfect mutual skill exchanges available</div>
            <div class="summary-item">• ${opportunities} additional one-way teaching opportunities</div>
            <div class="summary-item">• Start learning immediately with real-time skill matching!</div>
        `;
        
        section.style.display = 'block';
    }

    formatSkills(skills) {
        if (!skills) return '<span class="skill-value">None</span>';
        
        return skills.split(',')
            .map(skill => `<span class="skill-value">${skill.trim().toUpperCase()}</span>`)
            .join(' ');
    }

    formatSkillsList(skills) {
        if (!skills || skills.length === 0) return 'no skills';
        return skills.map(skill => skill.toUpperCase()).join(', ');
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
        document.getElementById('activeUsersSection').style.display = 'none';
        document.getElementById('liveMatchesSection').style.display = 'none';
        document.getElementById('oneWaySection').style.display = 'none';
        document.getElementById('summarySection').style.display = 'none';
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard page loaded, initializing...');
    window.dashboardManager = new DashboardManager();
});

// Global function for retry button
function loadDashboard() {
    if (window.dashboardManager) {
        window.dashboardManager.loadDashboard();
    }
}