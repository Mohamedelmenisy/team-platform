// dashboard.js (FINAL INTEGRATED VERSION - Navigation, Data Handling, Script Loading Fix)
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Ready - Dashboard Final Init v2");

    // --- DOM Elements ---
    const sidebar = document.getElementById('sidebar'); // Keep if used for toggling
    const menuButtons = document.querySelectorAll('.sidebar-menu button[data-section]');
    const userDropdown = document.getElementById('userDropdown');
    const dropdownButtons = document.querySelectorAll('.user-dropdown button[data-section]');
    const contentSections = document.querySelectorAll('.content-area > .content-section');
    const featureSectionsContainer = document.getElementById('featureSectionsContainer');
    const featureSections = document.getElementById('featureSections');
    const featurePlaceholder = document.getElementById('featurePlaceholder');
    const featureTitle = document.getElementById('featureTitle');
    const featureDescription = document.getElementById('featureDescription');
    const featureLoadingIndicator = featurePlaceholder?.querySelector('.loading-indicator');
    const featureErrorMessage = featurePlaceholder?.querySelector('.error-message');
    const backButton = document.getElementById('backButton');
    const dashboardContent = document.getElementById('dashboardContent');
    const profileContent = document.getElementById('profileContent');
    const settingsContent = document.getElementById('settingsContent');
    const settingsTabs = document.querySelectorAll('.settings-tab'); // Needed if settings logic is complete
    const settingsPanels = document.querySelectorAll('.settings-panel'); // Needed if settings logic is complete
    const logoutLink = document.getElementById('logoutLink');
    // Add ALL other elements your full UI functions need (userName, avatar, stats elements, etc.)
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const welcomeName = document.getElementById('welcomeName');
    const userAvatar = document.getElementById('userAvatar');
    const profileAvatar = document.getElementById('profileAvatar');
    const userInfoRoleTitle = document.getElementById('userInfoRoleTitle');
    const teamMembersCount = document.getElementById('teamMembersCount');
    const tasksCompleted = document.getElementById('tasksCompleted');
    const activeProjects = document.getElementById('activeProjects');
    const upcomingDeadlines = document.getElementById('upcomingDeadlines');
    const teamMembersTrend = document.getElementById('teamMembersTrend');
    const tasksCompletedTrend = document.getElementById('tasksCompletedTrend');
    const activeProjectsTrend = document.getElementById('activeProjectsTrend');
    const upcomingDeadlinesTrend = document.getElementById('upcomingDeadlinesTrend');
    const activityList = document.getElementById('activityList');
    const notificationsBody = document.getElementById('notificationsBody');
    const notificationBadge = document.querySelector('.notification-badge');


    // --- State Variables ---
    let currentUser = {};
    let teamMembers = [];
    let activities = [];
    let notifications = [];
    let currentSectionName = 'dashboard';
    let currentSettingsTab = null;
    let currentSectionScript = null;
    let activityIntervalId = null;
    let confirmCallback = null; // For confirm modal if used
    let cancelCallback = null; // For confirm modal if used

    const sectionsWithJS = { 'employee-scheduling': 'initializeEmployeeSchedule' };
    const DEFAULT_USER = { id: 1, name: 'Mohamed Elmenisy', email: 'm@e.co', role: 'admin', preferences:{theme:'blue', layoutDensity:'normal'}, notificationPreferences:{email:{}, push:{}}, security:{}, stats:{} };

    // --- FAKE DATA GENERATION ---
    function generateFakeTeam() {
        console.warn("%cgenerateFakeTeam: Using fake data!", "color: orange;");
        return [ { id: 1, name: 'Mohamed Elmenisy', email: 'm@e.co', role: 'admin'}, { id: 2, name: 'Yousef Ahmed', email: 'y@a.co', role: 'supervisor'}, { id: 3, name: 'Esraa Lashin', email: 'e@l.co', role: 'senior'}, { id: 4, name: 'Bassant Badr', email: 'b@b.co', role: 'member'} ];
    }
    function generateFakeActivities() { return [{id:1, message:"Fake activity 1", timestamp: new Date().toISOString()}, {id:2, message:"Fake activity 2", timestamp: new Date(Date.now()-60000).toISOString()}]; }
    function generateFakeNotifications() { return [{id:1, message:"Fake notification 1", timestamp: new Date().toISOString(), read:false}]; }

    // --- Utility ---
    function isObject(item) { return (item && typeof item === 'object' && !Array.isArray(item)); }
    function mergeDeep(target, ...sources) { sources.forEach(source=>{ if(!source)return; Object.keys(source).forEach(key=>{const t=target[key]; const s=source[key]; if(isObject(t)&&isObject(s)){mergeDeep(t,s);} else if(s!==undefined){target[key]=s;}});}); return target; }

    // --- Data Handling ---
    function loadData() {
        console.log("--- loadData ---");
        let storedUser=null; try{storedUser=JSON.parse(localStorage.getItem('currentUser'));}catch(e){}
        currentUser=mergeDeep(JSON.parse(JSON.stringify(DEFAULT_USER)),storedUser);
        let storedTeam=null; try{const d=localStorage.getItem('teamMembers');if(d)storedTeam=JSON.parse(d);}catch(e){}
        if(storedTeam&&Array.isArray(storedTeam)&&storedTeam.length>0){teamMembers=storedTeam;} else{teamMembers=generateFakeTeam();}
        console.log(`loadData: Final teamMembers count: ${teamMembers.length}`);
        activities = JSON.parse(localStorage.getItem('activities') || '[]') || generateFakeActivities();
        notifications = JSON.parse(localStorage.getItem('notifications') || '[]') || generateFakeNotifications();
        if(currentUser.stats) currentUser.stats.teamMembers = teamMembers.length;
        console.log("--- loadData finished ---");
    }
    function saveData() { try { localStorage.setItem('currentUser', JSON.stringify(currentUser)); localStorage.setItem('teamMembers', JSON.stringify(teamMembers)); localStorage.setItem('activities', JSON.stringify(activities)); localStorage.setItem('notifications', JSON.stringify(notifications)); } catch (e) { console.error("Save error:", e); } }

    // --- UI Update Functions (Implement these based on your original code) ---
    function updateUserUI() { console.log("Updating User UI..."); if(userName) userName.textContent = currentUser.name || 'User'; /* ... update avatar, email etc. ... */ }
    function applyUserPreferences() { console.log("Applying Preferences..."); /* ... update theme, density ... */ }
    function applyRBAC() { console.log("Applying RBAC..."); /* ... show/hide elements based on currentUser.role ... */ }
    function loadSettingsFormData() { console.log("Loading Settings Form Data..."); /* ... populate settings forms ... */ }
    function updateStats() { console.log("Updating Stats..."); if(teamMembersCount) teamMembersCount.textContent = teamMembers.length; /* ... update other stats ... */ }
    function updateTrendIndicator(element, trend) { /* ... implementation ... */ }
    function updateNotificationBadge() { const count = notifications.filter(n => !n.read).length; if(notificationBadge) { notificationBadge.textContent = count > 0 ? count : ''; notificationBadge.style.display = count > 0 ? 'flex' : 'none'; } }
    function loadActivities(showAll = false) { console.log("Loading Activities..."); if(!activityList) return; activityList.innerHTML = activities.length ? activities.map(a => `<li>${a.message} (${getTimeAgo(a.timestamp)})</li>`).join('') : '<li>No activities.</li>'; }
    function loadNotifications() { console.log("Loading Notifications..."); if(!notificationsBody) return; notificationsBody.innerHTML = notifications.length ? notifications.map(n => `<div class="${n.read ? '' : 'unread'}">${n.message} (${getTimeAgo(n.timestamp)})</div>`).join('') : '<div>No notifications.</div>'; updateNotificationBadge(); }
    function loadTeamMembers() { console.log("Loading Team Members (in settings)..."); if(!teamList) return; teamList.innerHTML = teamMembers.map(m => `<div>${m.name} (${m.role})</div>`).join(''); }
    function getTimeAgo(timestamp) { try{const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000); if(seconds<60)return`Just now`; if(seconds<3600)return`${Math.floor(seconds/60)}m ago`; if(seconds<86400)return`${Math.floor(seconds/3600)}h ago`; return`${Math.floor(seconds/86400)}d ago`;}catch(e){return'-';} }
    function updateActivityTimes() { document.querySelectorAll('[data-timestamp]').forEach(el => { el.textContent = getTimeAgo(el.dataset.timestamp); }); }
    function startActivityTimeUpdater() { if(activityIntervalId) clearInterval(activityIntervalId); updateActivityTimes(); activityIntervalId = setInterval(updateActivityTimes, UPDATE_INTERVAL); }
    function addActivity(icon, message) { activities.unshift({id:Date.now(), icon, message, timestamp: new Date().toISOString()}); if(activities.length > 50) activities.pop(); loadActivities(); saveData(); }
    function addNotification(icon, message) { notifications.unshift({id:Date.now(), icon, message, timestamp: new Date().toISOString(), read:false}); loadNotifications(); saveData(); /* playNotificationSound(); */ }
    function showSuccessMessage(message, type='success') { console.log("Message:", message, type); /* Implement toast/message display */ }
    function handleLogout() { console.log("Logout Clicked"); localStorage.clear(); window.location.reload(); } // Simple logout
    function activateSettingsTab(tabId){ console.log(`Activating settings tab: ${tabId}`); /* Implement tab switching logic */ if(tabId === 'team') loadTeamMembers(); }


    // --- Navigation & Loading ---
    function setActive(sectionName, settingsTab = null) {
        console.log(`--- setActive: section=${sectionName}, tab=${settingsTab} ---`);
        currentSectionName = sectionName; currentSettingsTab = (sectionName === 'settings') ? (settingsTab || 'preferences') : null;
        let hash = `#${sectionName}`; if (currentSettingsTab) hash += `-${currentSettingsTab}`;
        if (window.location.hash !== hash) { try { /* Update history */ if (sectionName === 'settings' && window.location.hash.startsWith('#settings-')) { history.replaceState({ section: sectionName, tab: currentSettingsTab }, '', hash); } else { history.pushState({ section: sectionName, tab: currentSettingsTab }, '', hash); } console.log(`History updated: ${hash}`); } catch (e) {} }
        menuButtons.forEach(b => b.classList.remove('active')); dropdownButtons.forEach(b => b.classList.remove('active'));
        document.querySelector(`.sidebar-menu button[data-section="${sectionName}"]`)?.classList.add('active'); document.querySelector(`.user-dropdown button[data-section="${sectionName}"]`)?.classList.add('active');
        contentSections.forEach(s => s.classList.remove('active')); if(featureSectionsContainer) featureSectionsContainer.style.display = 'none';
        if (sectionName === 'dashboard') { if(dashboardContent) dashboardContent.classList.add('active'); updateStats(); loadActivities(); }
        else if (sectionName === 'profile') { if(profileContent) profileContent.classList.add('active'); updateUserUI(); }
        else if (sectionName === 'settings') { if(settingsContent) settingsContent.classList.add('active'); applyRBAC(); activateSettingsTab(currentSettingsTab); }
        else { if (featureSectionsContainer) { featureSectionsContainer.style.display = 'block'; loadSection(sectionName); } else console.error("featureSectionsContainer missing!"); }
        if (backButton) backButton.style.display = sectionName !== 'dashboard' ? 'inline-flex' : 'none'; window.scrollTo(0, 0);
        localStorage.setItem('lastActiveSection', sectionName === 'settings' ? 'settings' : sectionName);
    }

    function loadSection(sectionName) {
        console.log(`--- loadSection for: ${sectionName} ---`);
        const htmlPath = `sections/${sectionName}.html`; const jsPath = `sections/${sectionName}.js`; const initFunctionName = sectionsWithJS[sectionName];
        if(featureSections && featurePlaceholder) { featureSections.innerHTML = ''; featureSections.appendChild(featurePlaceholder); featurePlaceholder.style.display='flex'; if(featureTitle) featureTitle.textContent = `Loading ${sectionName}...`; }
        if (currentSectionScript?.parentNode) { currentSectionScript.remove(); currentSectionScript = null; }
        fetch(htmlPath)
            .then(response => { if (!response.ok) throw new Error(`HTML ${response.status}`); return response.text(); })
            .then(html => {
                console.log(`HTML loaded for ${sectionName}`); if(!featureSections) return;
                featureSections.innerHTML = html; featureSections.classList.add('active'); if(featurePlaceholder) featurePlaceholder.style.display = 'none';
                if (initFunctionName) {
                    console.log(`Loading JS: ${jsPath}`); const script = document.createElement('script'); script.src = jsPath; script.type = 'text/javascript';
                    script.onload = () => {
                        console.log(`%cScript loaded: ${jsPath}`, "color: green;"); currentSectionScript = script;
                        if (typeof window[initFunctionName] === 'function') {
                            try {
                                const currentUserCopy = JSON.parse(JSON.stringify(currentUser || {}));
                                const teamMembersCopy = JSON.parse(JSON.stringify(teamMembers || []));
                                console.log(`---> Passing ${teamMembersCopy.length} team members to ${initFunctionName}`);
                                if (teamMembersCopy.length === 0) console.error(`!!! Calling ${initFunctionName} with ZERO team members!`);
                                window[initFunctionName](currentUserCopy, teamMembersCopy);
                            } catch (err) { console.error(`Error executing ${initFunctionName}:`, err); /* Show error UI */ }
                        } else { console.warn(`Init function '${initFunctionName}' NOT FOUND.`); /* Show warning UI */ }
                    };
                    script.onerror = (e) => { console.error(`Failed script load: ${jsPath}`, e); /* Show error UI */ };
                    document.body.appendChild(script);
                } else { if(featurePlaceholder) featurePlaceholder.style.display = 'none'; }
            })
            .catch(error => { console.error(`Failed section load '${sectionName}':`, error); /* Show error UI */ });
    }

    function handleInitialNavigation() {
        console.log("--- handleInitialNavigation ---"); const hash = window.location.hash.substring(1); let initialSection = 'dashboard'; let initialTab = null;
        if (hash) { if (hash.startsWith('settings-')) { initialSection = 'settings'; initialTab = hash.split('-')[1]||'preferences'; } else { const isValid = [...menuButtons,...dropdownButtons].some(b => b.dataset.section === hash); if(isValid) initialSection = hash; else history.replaceState(null,'',window.location.pathname); } }
        else { const last = localStorage.getItem('lastActiveSection'); if (last && [...menuButtons,...dropdownButtons].some(b => b.dataset.section === last)) initialSection = last; }
        console.log(`Initial navigation target: Section=${initialSection}`); setActive(initialSection, initialTab);
    }

    // --- Event Listener Setup ---
    function setupEventListeners() {
        console.log("--- setupEventListeners ---");
        menuButtons.forEach(button => { const section = button.dataset.section; if (section) button.addEventListener('click', (e) => { e.preventDefault(); console.log(`Sidebar click: ${section}`); setActive(section); }); });
        dropdownButtons.forEach(button => { const section = button.dataset.section; if (section) button.addEventListener('click', (e) => { e.preventDefault(); userDropdown?.classList.remove('active'); console.log(`Dropdown click: ${section}`); setActive(section); }); });
        if (backButton) backButton.addEventListener('click', () => setActive('dashboard'));
        window.addEventListener('popstate', (event) => { if (event.state?.section) setActive(event.state.section, event.state.tab); else handleInitialNavigation(); });
        if(logoutLink) logoutLink.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
        // Add other listeners for search, profile, settings, modals etc. based on your full code
        console.log("--- setupEventListeners finished ---");
    }

    // --- Initialization ---
    function initializeApp() {
        console.log("--- Initializing App (FINAL) ---");
        loadData();         // Load/Generate data
        updateUserUI();     // Update common UI
        updateStats();      // Update initial stats
        loadActivities();   // Load initial activities
        loadNotifications();// Load initial notifications
        applyUserPreferences(); // Apply theme etc.
        applyRBAC();        // Apply role restrictions
        setupEventListeners(); // Setup core listeners
        handleInitialNavigation(); // Load initial view
        //startActivityTimeUpdater(); // Start time updates
        console.log("--- Dashboard Initialized (FINAL) ---");
    }
    initializeApp(); // Start
});
