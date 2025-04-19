// dashboard.js (FINAL INTEGRATED VERSION)
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Ready - Dashboard Final Init");
    // --- DOM Elements ---
    const menuButtons = document.querySelectorAll('.sidebar-menu button[data-section]');
    const dropdownButtons = document.querySelectorAll('.user-dropdown button[data-section]');
    const featureSectionsContainer = document.getElementById('featureSectionsContainer');
    const featureSections = document.getElementById('featureSections');
    const featurePlaceholder = document.getElementById('featurePlaceholder');
    const featureTitle = document.getElementById('featureTitle');
    const featureDescription = document.getElementById('featureDescription');
    const featureLoadingIndicator = featurePlaceholder?.querySelector('.loading-indicator');
    const featureErrorMessage = featurePlaceholder?.querySelector('.error-message');
    const backButton = document.getElementById('backButton');
    const contentSections = document.querySelectorAll('.content-area > .content-section');
    const dashboardContent = document.getElementById('dashboardContent');
    const profileContent = document.getElementById('profileContent'); // Assuming exists
    const settingsContent = document.getElementById('settingsContent'); // Assuming exists
    const userDropdown = document.getElementById('userDropdown');
    const logoutLink = document.getElementById('logoutLink');
    // Add other elements referenced by your full UI functions

    // --- State ---
    let currentUser = {};
    let teamMembers = []; // Will be populated/generated
    let activities = [];
    let notifications = [];
    let currentSectionName = 'dashboard';
    let currentSettingsTab = null;
    let currentSectionScript = null;
    let activityIntervalId = null;

    const sectionsWithJS = { 'employee-scheduling': 'initializeEmployeeSchedule' };
    const DEFAULT_USER = { id: 1, name: 'Mohamed Elmenisy', email: 'm@e.co', role: 'admin', preferences:{}, notificationPreferences:{}, security:{}, stats:{} };

    // --- FAKE TEAM DATA ---
    function generateFakeTeam() {
        console.warn("%cgenerateFakeTeam: Using fake data!", "color: orange;");
        return [ { id: 1, name: 'Mohamed Elmenisy', email: 'm@e.co', role: 'admin'}, { id: 2, name: 'Yousef Ahmed', email: 'y@a.co', role: 'supervisor'}, { id: 3, name: 'Esraa Lashin', email: 'e@l.co', role: 'senior'}, { id: 4, name: 'Bassant Badr', email: 'b@b.co', role: 'member'} ];
    }

    // --- Utility ---
    function isObject(item) { return (item && typeof item === 'object' && !Array.isArray(item)); }
    function mergeDeep(target, ...sources) { sources.forEach(source=>{ if(!source)return; Object.keys(source).forEach(key=>{const t=target[key]; const s=source[key]; if(isObject(t)&&isObject(s)){mergeDeep(t,s);} else if(s!==undefined){target[key]=s;}});}); return target; }

    // --- Data Handling ---
    function loadData() {
        console.log("--- loadData ---");
        let storedUser=null; try{storedUser=JSON.parse(localStorage.getItem('currentUser'));}catch(e){}
        currentUser=mergeDeep(JSON.parse(JSON.stringify(DEFAULT_USER)),storedUser);
        let storedTeam=null; try{const d=localStorage.getItem('teamMembers');if(d)storedTeam=JSON.parse(d);}catch(e){}
        if(storedTeam&&Array.isArray(storedTeam)&&storedTeam.length>0){teamMembers=storedTeam; console.log(`loadData: Used ${teamMembers.length} from localStorage.`);}
        else{teamMembers=generateFakeTeam(); console.log(`loadData: Used ${teamMembers.length} fake members.`);} // USE FAKE DATA IF NEEDED
        activities = JSON.parse(localStorage.getItem('activities') || '[]');
        notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        if(currentUser.stats) currentUser.stats.teamMembers = teamMembers.length;
        console.log("--- loadData finished ---");
    }
    function saveData() { console.log("Stub: saveData"); /* Implement if needed */ }

    // --- UI Stubs (Replace with your full implementations) ---
    function updateUserUI() { console.log("Stub: updateUserUI"); }
    function applyUserPreferences() { console.log("Stub: applyUserPreferences"); }
    function applyRBAC() { console.log("Stub: applyRBAC"); }
    function loadSettingsFormData() { console.log("Stub: loadSettingsFormData"); }
    function updateStats() { console.log("Stub: updateStats"); }
    function updateTrendIndicator(el, tr) { /*...*/ }
    function updateNotificationBadge() { /*...*/ }
    function loadActivities(showAll = false) { console.log("Stub: loadActivities"); }
    function loadNotifications() { console.log("Stub: loadNotifications"); }
    function loadTeamMembers() { console.log("Stub: loadTeamMembers"); }
    function getTimeAgo(ts) { return "time ago"; }
    function updateActivityTimes() { /*...*/ }
    function startActivityTimeUpdater() { if(activityIntervalId) clearInterval(activityIntervalId); /*...*/ }
    function addActivity(icon, msg) { /*...*/ }
    function addNotification(icon, msg) { /*...*/ }
    function playNotificationSound() { /*...*/ }
    function showSuccessMessage(msg, type) { console.log(type === 'danger' ? "Error:" : "Success:", msg); }
    function handleLogout() { console.log("Logout Clicked"); alert("Logout"); }
    function activateSettingsTab(tabId){ console.log(`Stub: activateSettingsTab(${tabId})`); /* Implement */ }


    // --- Navigation & Loading ---
    function setActive(sectionName, settingsTab = null) {
        console.log(`--- setActive: section=${sectionName}, tab=${settingsTab} ---`);
        currentSectionName = sectionName; currentSettingsTab = (sectionName === 'settings') ? (settingsTab || 'preferences') : null;
        let hash = `#${sectionName}`; if (currentSettingsTab) hash += `-${currentSettingsTab}`;
        if (window.location.hash !== hash) { try { /* Update history */ if (sectionName === 'settings' && window.location.hash.startsWith('#settings-')) { history.replaceState({ section: sectionName, tab: currentSettingsTab }, '', hash); } else { history.pushState({ section: sectionName, tab: currentSettingsTab }, '', hash); } console.log(`History updated to: ${hash}`); } catch (e) {} }
        menuButtons.forEach(b => b.classList.remove('active')); dropdownButtons.forEach(b => b.classList.remove('active'));
        document.querySelector(`.sidebar-menu button[data-section="${sectionName}"]`)?.classList.add('active');
        document.querySelector(`.user-dropdown button[data-section="${sectionName}"]`)?.classList.add('active');
        contentSections.forEach(s => s.classList.remove('active')); if(featureSectionsContainer) featureSectionsContainer.style.display = 'none';
        if (sectionName === 'dashboard') { if(dashboardContent) dashboardContent.classList.add('active'); /* updateStats(); loadActivities(); */ }
        else if (sectionName === 'profile') { document.getElementById('profileContent')?.classList.add('active'); /* updateUserUI(); */ }
        else if (sectionName === 'settings') { if(settingsContent) settingsContent.classList.add('active'); /* applyRBAC(); */ activateSettingsTab(currentSettingsTab); }
        else { if (featureSectionsContainer) { featureSectionsContainer.style.display = 'block'; loadSection(sectionName); } else console.error("featureSectionsContainer missing!"); }
        if (backButton) backButton.style.display = sectionName !== 'dashboard' ? 'inline-flex' : 'none'; window.scrollTo(0, 0);
        localStorage.setItem('lastActiveSection', sectionName === 'settings' ? 'settings' : sectionName);
    }

    function loadSection(sectionName) {
        console.log(`--- loadSection for: ${sectionName} ---`);
        const htmlPath = `sections/${sectionName}.html`; const jsPath = `sections/${sectionName}.js`; const initFunctionName = sectionsWithJS[sectionName];
        if(featureSections && featurePlaceholder) { featureSections.innerHTML = ''; featureSections.appendChild(featurePlaceholder); featurePlaceholder.style.display='flex'; /* Show loading */ }
        if (currentSectionScript?.parentNode) { currentSectionScript.remove(); currentSectionScript = null; }
        fetch(htmlPath)
            .then(response => { if (!response.ok) throw new Error(`HTML ${response.status}`); return response.text(); })
            .then(html => {
                featureSections.innerHTML = html; featureSections.classList.add('active'); if(featurePlaceholder) featurePlaceholder.style.display = 'none';
                if (initFunctionName) {
                    console.log(`Loading JS: ${jsPath}`); const script = document.createElement('script'); script.src = jsPath; script.type = 'text/javascript';
                    script.onload = () => {
                        console.log(`Script loaded: ${jsPath}`); if (typeof window[initFunctionName] === 'function') {
                            try {
                                const currentUserCopy = JSON.parse(JSON.stringify(currentUser || {}));
                                const teamMembersCopy = JSON.parse(JSON.stringify(teamMembers || [])); // Use current data
                                console.log(`---> Passing ${teamMembersCopy.length} team members to ${initFunctionName}`);
                                if (teamMembersCopy.length === 0) console.error(`!!! Calling ${initFunctionName} with ZERO team members!`);
                                window[initFunctionName](currentUserCopy, teamMembersCopy); // <<< CALL INIT FUNCTION
                            } catch (err) { console.error(`Error executing ${initFunctionName}:`, err); }
                        } else { console.warn(`Init function '${initFunctionName}' NOT FOUND.`); }
                    };
                    script.onerror = (e) => { console.error(`Error loading script ${jsPath}`, e); }; document.body.appendChild(script); currentSectionScript = script;
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
        // Navigation
        menuButtons.forEach(button => { const section = button.dataset.section; if (section) button.addEventListener('click', (e) => { e.preventDefault(); console.log(`Sidebar click: ${section}`); setActive(section); }); });
        dropdownButtons.forEach(button => { const section = button.dataset.section; if (section) button.addEventListener('click', (e) => { e.preventDefault(); userDropdown?.classList.remove('active'); console.log(`Dropdown click: ${section}`); setActive(section); }); });
        if (backButton) backButton.addEventListener('click', () => setActive('dashboard'));
        window.addEventListener('popstate', (event) => { if (event.state?.section) setActive(event.state.section, event.state.tab); else handleInitialNavigation(); });
        if(logoutLink) logoutLink.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
        // Add other listeners (search, modals, forms...)
        console.log("--- setupEventListeners finished ---");
    }

    // --- Initialization ---
    function initializeApp() {
        console.log("--- Initializing App (FINAL) ---");
        loadData();         // Load/Generate data
        updateUserUI();     // Update common UI
        // updateStats();      // Update initial stats
        setupEventListeners(); // Setup core listeners
        handleInitialNavigation(); // Load initial view
        // startActivityTimeUpdater(); // Start time updates
        console.log("--- Dashboard Initialized (FINAL) ---");
    }
    initializeApp(); // Start
});
