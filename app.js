// App State & Data
const state = {
    currentView: 'dashboard',
    user: {
        name: "Alex Doe", 
        points: 450,
        badge: "Community Hero"
    },
    settings: {
        voiceReporting: false,
        highContrast: false,
        largeText: false
    },
    issues: [
        {
            id: 'ISS-001',
            category: 'Road',
            categoryIcon: 'fa-road',
            title: 'Pothole on Main St',
            location: '123 Main St, Downtown',
            priority: 'High',
            status: 'Pending',
            date: '2 hours ago',
            description: 'Large pothole causing traffic slowdown.',
            progress: 10
        },
        {
            id: 'ISS-002',
            category: 'Garbage',
            categoryIcon: 'fa-trash',
            title: 'Overflowing Bin',
            location: 'Central Park West Entrance',
            priority: 'Medium',
            status: 'In Progress',
            date: '1 day ago',
            description: 'Trash bin has not been collected.',
            progress: 50
        },
        {
            id: 'ISS-003',
            category: 'Water',
            categoryIcon: 'fa-faucet',
            title: 'Leaking Pipe',
            location: '5th Avenue Corner',
            priority: 'Low',
            status: 'Resolved',
            date: '3 days ago',
            description: 'Minor leak from public tap.',
            progress: 100
        }
    ],
    volunteerEvents: [
        {
            id: 'EVT-001',
            title: 'Park Cleanup Drive',
            date: 'Sat, Feb 10 • 9:00 AM',
            location: 'Central Park',
            participants: 24
        },
        {
            id: 'EVT-002',
            title: 'Tree Planting',
            date: 'Sun, Feb 18 • 10:00 AM',
            location: 'Riverside Walk',
            participants: 15
        }
    ]
};

// DOM Elements
const app = document.getElementById('app');
const navBtns = document.querySelectorAll('.nav-btn, .nav-fab');

// Navigation Logic
navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Handle direct clicks on the button or its children
        const targetBtn = e.target.closest('button');
        const targetView = targetBtn.dataset.target;
        
        navigateTo(targetView);
        
        // Update Active Nav State
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        if (targetBtn.classList.contains('nav-btn')) {
            targetBtn.classList.add('active');
        } else {
            // If FAB (Report) is clicked, maybe no bottom nav should be explicitly "active" or keep previous
            // For now, let's just leave it blank or highlight the home if we want.
        }
    });
});

function navigateTo(view) {
    state.currentView = view;
    render();
    window.scrollTo(0, 0);
}

// Render Logic
function render() {
    let html = '';
    
    switch(state.currentView) {
        case 'dashboard':
            html = renderDashboard();
            break;
        case 'report':
            html = renderReport();
            break;
        case 'track':
            html = renderTrack();
            break;
        case 'issue-details': // This handles dynamic issue viewing
            html = renderIssueDetails(state.selectedIssueId);
            break;
        case 'volunteer':
            html = renderVolunteer();
            break;
        case 'profile':
            html = renderProfile();
            break;
        default:
            html = renderDashboard();
    }
    
    app.innerHTML = html;
    attachDynamicListeners();
}

// --- Views ---

function renderDashboard() {
    return `
        <header class="header">
            <div class="brand"><i class="fa-solid fa-city"></i> CivicFix</div>
            <div class="profile-icon" onclick="navigateTo('profile')" style="cursor:pointer">
                <i class="fa-solid fa-circle-user fa-2x" style="color:var(--text-muted)"></i>
            </div>
        </header>
        
        <div class="view-content">
            <section style="text-align:center; padding: 40px 0;">
                <h1 style="margin-bottom:10px;">Make Your City Better</h1>
                <p style="margin-bottom:30px;">Report issues and help maintain our community.</p>
                <button class="btn btn-primary" style="padding: 16px 32px; font-size: 1.1rem; border-radius: 50px;" onclick="navigateTo('report')">
                    <i class="fa-solid fa-camera"></i> Report an Issue
                </button>
            </section>

            <section>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h3>Nearby Issues</h3>
                    <a href="#" style="color:var(--primary); text-decoration:none; font-weight:600" onclick="navigateTo('track')">View All</a>
                </div>
                
                ${state.issues.map(issue => `
                    <div class="card issue-card" onclick="viewIssue('${issue.id}')" style="cursor:pointer">
                        <div class="issue-icon">
                            <i class="fa-solid ${issue.categoryIcon}"></i>
                        </div>
                        <div class="issue-info">
                            <div class="issue-header">
                                <span class="issue-title">${issue.title}</span>
                                <span class="status-badge status-${issue.status.toLowerCase().replace(' ', '-')}">${issue.status}</span>
                            </div>
                            <div class="meta-row">
                                <span><i class="fa-solid fa-location-dot"></i> ${issue.location}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </section>
        </div>
    `;
}

function renderReport() {
    return `
        <header class="header">
            <button class="btn" style="padding:0;" onclick="navigateTo('dashboard')"><i class="fa-solid fa-arrow-left fa-lg"></i></button>
            <div style="font-weight:700; font-size:1.2rem;">Report Issue</div>
            <div style="width:24px;"></div> <!-- Spacer -->
        </header>

        <div class="view-content">
            <form onsubmit="handleReportSubmit(event)">
                <div class="form-group">
                    <div style="width:100%; height:180px; background: #e5e7eb; border-radius: var(--radius-md); display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text-muted); border: 2px dashed #d1d5db; cursor:pointer; transition: all 0.2s;" hover="this.style.borderColor='var(--primary)'">
                        <i class="fa-solid fa-camera fa-2x" style="margin-bottom:8px;"></i>
                        <span>Tap to upload photo</span>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Category</label>
                    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;">
                        ${['Road', 'Garbage', 'Water', 'Electric', 'Public', 'Other'].map(cat => `
                            <div class="category-chip" onclick="selectCategory(this, '${cat}')" 
                                style="border:1px solid var(--border); padding:10px; border-radius:8px; text-align:center; font-size:0.9rem; cursor:pointer;">
                                ${cat}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" rows="3" placeholder="Describe the issue..."></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select class="form-select">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Location</label>
                    <div style="position:relative">
                        <input type="text" class="form-input" value="123 Hackathon Ave, Innovation City" readonly>
                        <i class="fa-solid fa-map-pin" style="position:absolute; right:12px; top:12px; color:var(--primary)"></i>
                    </div>
                </div>

                <div style="height:20px;"></div>
                <button type="submit" class="btn btn-primary" style="width:100%">Submit Report</button>
            </form>
        </div>
    `;
}

function renderTrack() {
    return `
        <header class="header">
             <div style="font-weight:700; font-size:1.2rem;">My Reports</div>
        </header>
        <div class="view-content">
            ${state.issues.map(issue => `
                <div class="card" onclick="viewIssue('${issue.id}')" style="cursor:pointer">
                     <div class="issue-header">
                        <span style="font-weight:600">ID: ${issue.id}</span>
                        <span class="status-badge status-${issue.status.toLowerCase().replace(' ', '-')}">${issue.status}</span>
                    </div>
                    <h3 style="margin-top:8px;">${issue.title}</h3>
                    <div style="margin: 8px 0; font-size:0.9rem; color:var(--text-muted)">
                        ${issue.category} • ${issue.priority} Priority
                    </div>
                    
                    <div style="margin-top:12px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
                            <span>Progress</span>
                            <span>${issue.progress}%</span>
                        </div>
                        <div style="width:100%; height:6px; background:#E5E7EB; border-radius:10px; overflow:hidden;">
                            <div style="width:${issue.progress}%; height:100%; background:var(--primary);"></div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderIssueDetails(id) {
    const issue = state.issues.find(i => i.id === id) || state.issues[0];
    
    return `
        <header class="header">
            <button class="btn" style="padding:0;" onclick="navigateTo('track')"><i class="fa-solid fa-arrow-left fa-lg"></i></button>
            <div style="font-weight:700; font-size:1.2rem;">Issue Details</div>
            <div style="width:24px;"></div>
        </header>

        <div class="view-content">
             <div style="width:100%; height:200px; background: #e5e7eb; border-radius: var(--radius-lg); display:flex; align-items:center; justify-content:center; color:var(--text-muted); margin-bottom:20px; background-image: url('https://placehold.co/600x400/e2e8f0/64748b?text=Issue+Image'); background-size: cover;">
            </div>

            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
                <h1>${issue.title}</h1>
                 <span class="status-badge status-${issue.status.toLowerCase().replace(' ', '-')}">${issue.status}</span>
            </div>
            
            <p style="margin-bottom:20px;">${issue.description}</p>

            <div class="card">
                <h3>Current Status</h3>
                <div class="timeline">
                    <div class="timeline-item ${issue.progress >= 10 ? 'active' : ''}">
                        <div class="timeline-dot"></div>
                        <div style="font-weight:600;">Reported</div>
                        <div class="timeline-date">${issue.date}</div>
                    </div>
                    <div class="timeline-item ${issue.progress >= 25 ? 'active' : ''}">
                        <div class="timeline-dot"></div>
                        <div style="font-weight:600;">Assigned to Team</div>
                        <div class="timeline-date">Pending</div>
                    </div>
                    <div class="timeline-item ${issue.progress >= 50 ? 'active' : ''}">
                        <div class="timeline-dot"></div>
                        <div style="font-weight:600;">In Progress</div>
                        <div class="timeline-date">Pending</div>
                    </div>
                    <div class="timeline-item ${issue.progress >= 100 ? 'active' : ''}">
                        <div class="timeline-dot"></div>
                        <div style="font-weight:600;">Resolved</div>
                        <div class="timeline-date">Pending</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3>Updates & Comments</h3>
                <div style="margin-top:10px; display:flex; gap:10px; margin-bottom:15px;">
                    <div style="width:30px; height:30px; background:#E5E7EB; border-radius:50%;"></div>
                    <div style="background:#F3F4F6; padding:10px; border-radius:12px; flex:1; font-size:0.9rem;">
                        <strong>Admin</strong> <br> We have received your report and validated it.
                    </div>
                </div>
                 <div style="display:flex; gap:10px;">
                    <input type="text" class="form-input" placeholder="Add a comment..." style="flex:1">
                     <button class="btn btn-primary" style="padding:0 16px;"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;
}

function renderVolunteer() {
    return `
        <header class="header">
             <div style="font-weight:700; font-size:1.2rem;">Volunteer</div>
        </header>
        <div class="view-content">
            
            <div class="overlay-card" style="background: linear-gradient(135deg, var(--secondary), var(--primary)); color:white; padding:20px; border-radius:var(--radius-lg); margin-bottom:24px; box-shadow:var(--shadow-lg);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-size:0.9rem; opacity:0.9;">Your Impact</div>
                        <div style="font-size:2rem; font-weight:800;">12 Hrs</div>
                    </div>
                    <i class="fa-solid fa-award fa-3x" style="opacity:0.8;"></i>
                </div>
                <div style="margin-top:10px; font-size:0.9rem; opacity:0.9;">
                    Badge: ${state.user.badge}
                </div>
            </div>

            <h3>Upcoming Events</h3>
            ${state.volunteerEvents.map(evt => `
                <div class="card">
                    <div style="display:flex; gap:16px;">
                        <div style="width:60px; height:60px; background:#FCE7F3; color:#DB2777; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:700; flex-shrink:0;">
                            <span style="font-size:0.8rem; text-transform:uppercase;">${evt.date.split(' ')[1]}</span>
                            <span style="font-size:1.4rem; line-height:1;">${evt.date.split(' ')[2]}</span>
                        </div>
                        <div style="flex:1;">
                            <h4 style="margin-bottom:4px;">${evt.title}</h4>
                            <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:8px;">
                                <i class="fa-solid fa-location-dot"></i> ${evt.location}
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:0.8rem; color:var(--text-muted);"><i class="fa-solid fa-users"></i> ${evt.participants} joining</span>
                                <button class="btn btn-primary" style="padding:6px 16px; font-size:0.85rem;">Join</button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderProfile() {
    return `
        <header class="header">
             <div style="font-weight:700; font-size:1.2rem;">Profile</div>
        </header>

        <div class="view-content">
            <div style="text-align:center; margin-bottom:30px;">
                <div style="width:100px; height:100px; background:#ddd; border-radius:50%; margin:0 auto 16px; display:flex; align-items:center; justify-content:center; font-size:3rem; color:#fff; background:linear-gradient(135deg, #6366f1, #a855f7);">
                    ${state.user.name.charAt(0)}
                </div>
                <h2>${state.user.name}</h2>
                <div style="display:inline-block; background:#FEF3C7; color:#D97706; padding:4px 12px; border-radius:100px; font-weight:600; font-size:0.9rem; margin-top:8px;">
                    <i class="fa-solid fa-star"></i> ${state.user.points} Points
                </div>
            </div>

            <div class="card">
                <h3 style="margin-bottom:16px;">Settings & Accessibility</h3>
                
                <div class="setting-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border);">
                    <div>
                        <div style="font-weight:600;">Voice Reporting</div>
                        <div style="font-size:0.85rem; color:var(--text-muted);">Speak to report issues</div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" onchange="toggleSetting('voiceReporting')" ${state.settings.voiceReporting ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="setting-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border);">
                    <div>
                        <div style="font-weight:600;">High Contrast Mode</div>
                        <div style="font-size:0.85rem; color:var(--text-muted);">Increase visibility</div>
                    </div>
                     <label class="switch">
                        <input type="checkbox" onchange="toggleSetting('highContrast')" ${state.settings.highContrast ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="setting-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px 0;">
                    <div>
                        <div style="font-weight:600;">Large Text</div>
                        <div style="font-size:0.85rem; color:var(--text-muted);">Scale up typography</div>
                    </div>
                     <label class="switch">
                        <input type="checkbox" onchange="toggleSetting('largeText')" ${state.settings.largeText ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            
             <button class="btn btn-outline" style="width:100%; border-color:#EF4444; color:#EF4444; margin-top:20px;">
                Log Out
            </button>
        </div>
    `;
}

// Actions & Helpers

window.viewIssue = function(id) {
    state.selectedIssueId = id;
    navigateTo('issue-details');
}

window.selectCategory = function(el, cat) {
    document.querySelectorAll('.category-chip').forEach(c => {
        c.style.background = 'transparent';
        c.style.borderColor = 'var(--border)';
        c.style.color = 'var(--text-main)';
    });
    el.style.background = 'var(--primary-light)';
    el.style.borderColor = 'var(--primary)';
    el.style.color = 'white';
}

window.handleReportSubmit = function(e) {
    e.preventDefault();
    // Simulate API call
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = 'Submitting...';
    btn.disabled = true;
    
    setTimeout(() => {
        state.issues.unshift({
            id: 'ISS-' + Math.floor(Math.random() * 1000),
            title: 'New Reported Issue',
            category: 'General',
            categoryIcon: 'fa-exclamation',
            status: 'Pending',
            location: 'Current Location',
            progress: 0,
            date: 'Just now',
            priority: 'Medium',
            description: 'This is a newly reported issue for demonstration.'
        });
        
        btn.innerText = originalText;
        btn.disabled = false;
        alert('Issue reported successfully!');
        navigateTo('track');
    }, 1500);
}

window.toggleSetting = function(setting) {
    state.settings[setting] = !state.settings[setting];
    
    if (setting === 'highContrast') {
        document.body.classList.toggle('high-contrast', state.settings[setting]);
    }
    if (setting === 'largeText') {
        document.body.classList.toggle('large-text', state.settings[setting]);
    }
}

function attachDynamicListeners() {
    // Re-attach any specialized listeners if needed
}

// Initial Render
render();

// Inject CSS for Switch (Toggle)
const style = document.createElement('style');
style.innerHTML = `
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--primary);
}

input:checked + .slider:before {
  -webkit-transform: translateX(22px);
  -ms-transform: translateX(22px);
  transform: translateX(22px);
}
`;
document.head.appendChild(style);
