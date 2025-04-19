// dashboard.js
// FINAL DEBUGGING - Forcing fake data, strict checks on data passing

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    // --- DOM Elements ---
    const sidebar = document.getElementById('sidebar');
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
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const settingsPanels = document.querySelectorAll('.settings-panel');
    const logoutLink = document.getElementById('logoutLink');
    // Add other needed elements based on your full UI functions

    // --- State Variables ---
    let currentUser = {};
    let teamMembers = []; // Will be FORCED to fake data
    let activities = [];
    let notifications = [];
    let currentSectionName = 'dashboard';
    let currentSettingsTab = null;
    let currentSectionScript = null;
    let activityIntervalId = null;
    let confirmCallback = null;
    let cancelCallback = null;

    const sectionsWithJS = {
        'employee-scheduling': 'initializeEmployeeSchedule',
    };

    const DEFAULT_USER = { /* ... Your default user object ... */
         id: 1, name: 'Mohamed Elmenisy', email: 'm.elsayed@thechefz.co', role: 'admin', /* ... other properties */
         preferences: {}, notificationPreferences: {}, security: {}, stats: {} // Ensure these exist
     };

    // --- FAKE DATA GENERATION ---
    function generateFakeTeam() {
        console.log("%cgenerateFakeTeam: GENERATING FAKE DATA NOW!", "color: red; font-weight:bold;");
        return [
            { id: 1, name: 'Mohamed Elmenisy', email: 'm.elsayed@thechefz.co', role: 'admin', title: 'Administrator', initials: 'ME' },
            { id: 2, name: 'Yousef Ahmed', email: 'y.ahmed@example.com', role: 'supervisor', title: 'Supervisor', initials: 'YA' },
            { id: 3, name: 'Esraa Lashin', email: 'e.lashin@example.com', role: 'senior', title: 'Senior Dev', initials: 'EL' },
            { id: 4, name: 'Bassant Badr', email: 'b.badr@example.com', role: 'member', title: 'Designer', initials: 'BB' },
        ];
    }
     function generateFakeActivities() { return []; }
     function generateFakeNotifications() { return []; }

     // --- Utility for Deep Merging ---
    function isObject(item) { return (item && typeof item === 'object' && !Array.isArray(item)); }
    function mergeDeep(target, ...sources) { /* ... implementation ... */ return target; } // Assume implementation exists


    // --- Data Handling ---
    function loadData() {
        console.log("--- loadData ---");
        let storedUser = null;
        try { storedUser = JSON.parse(localStorage.getItem('currentUser')); }
        catch (e) { console.error("Error parsing currentUser:", e); }
        currentUser = mergeDeep(JSON.parse(JSON.stringify(DEFAULT_USER)), storedUser);
        console.log("loadData: currentUser loaded/merged.");

        // --->>> FORCE FAKE TEAM DATA FOR THIS TEST <<<---
        console.log("loadData: Forcing fake team data generation...");
        teamMembers = generateFakeTeam();
        if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
             console.error("CRITICAL: generateFakeTeam() did not return a valid array!");
             teamMembers = [{id: 999, name:"Error Loading", email:"error@loading", role:"member"}]; // Provide minimal fallback
        }
        console.log(`loadData: FORCED teamMembers count: ${teamMembers.length}`);
        // console.log("loadData: Forced teamMembers data:", JSON.stringify(teamMembers));


        activities = JSON.parse(localStorage.getItem('activities') || '[]') || generateFakeActivities();
        notifications = JSON.parse(localStorage.getItem('notifications') || '[]') || generateFakeNotifications();
        if (currentUser.stats) currentUser.stats.teamMembers = teamMembers.length;
        console.log("--- loadData finished ---");
    }

    function saveData() { /* ... (implementation if needed) ... */ }


    // --- UI Update Functions (Stubs or Full Implementations) ---
    function updateUserUI() { console.log("Stub: updateUserUI"); /* ... */ }
    function applyUserPreferences() { console.log("Stub: applyUserPreferences"); /* ... */ }
    function applyRBAC() { console.log("Stub: applyRBAC"); /* ... */ }
    function loadSettingsFormData() { console.log("Stub: loadSettingsFormData"); /* ... */ }
    function updateStats() { console.log("Stub: updateStats"); /* ... */ }
    function updateTrendIndicator(element, trend) { /* ... */ }
    function updateNotificationBadge() { /* ... */ }
    function loadActivities(showAll = false) { console.log("Stub: loadActivities"); /* ... */ }
    function loadNotifications() { console.log("Stub: loadNotifications"); /* ... */ }
    function loadTeamMembers() { console.log("Stub: loadTeamMembers"); /* ... */ }
    function getTimeAgo(timestamp) { return "some time ago"; }
    function updateActivityTimes() { /* ... */ }
    function startActivityTimeUpdater() { /* ... */ }
    function addActivity(icon, message) { /* ... */ }
    function addNotification(icon, message) { /* ... */ }
    function playNotificationSound() { /* ... */ }
    function showSuccessMessage(message) { console.log("Success:", message); }
    function handleLogout() { console.log("Logout - Placeholder"); }


    // --- Navigation and Content Loading ---
    function setActive(sectionName, settingsTab = null) {
        // (Keep the implementation from the previous response - ensure it calls loadSection correctly)
         console.log(`--- setActive called: section=${sectionName}, tab=${settingsTab} ---`);
         if (!menuButtons || !contentSections || !featureSectionsContainer || !backButton) { console.error("setActive: Core navigation elements missing!"); return; }
         currentSectionName = sectionName;
         currentSettingsTab = (sectionName === 'settings') ? (settingsTab || currentSettingsTab || 'preferences') : null;
         let hash = `#${sectionName}`;
         if (sectionName === 'settings' && currentSettingsTab) { hash += `-${currentSettingsTab}`; }
         if (window.location.hash !== hash) {
             try { /* Update history */ if (sectionName === 'settings' && window.location.hash.startsWith('#settings-')) { history.replaceState({ section: sectionName, tab: currentSettingsTab }, '', hash); } else { history.pushState({ section: sectionName, tab: currentSettingsTab }, '', hash); } } catch (e) { console.error("History update error:", e); }
         }
         menuButtons.forEach(btn => btn.classList.remove('active'));
         dropdownButtons.forEach(btn => btn.classList.remove('active'));
         const activeMenuBtn = document.querySelector(`.sidebar-menu button[data-section="${sectionName}"]`); if (activeMenuBtn) activeMenuBtn.classList.add('active');
         const activeDropdownBtn = document.querySelector(`.user-dropdown button[data-section="${sectionName}"]`); if (activeDropdownBtn) activeDropdownBtn.classList.add('active');
         contentSections.forEach(section => section.classList.remove('active'));
         featureSectionsContainer.style.display = 'none';
         if (sectionName === 'dashboard') { if(dashboardContent) dashboardContent.classList.add('active'); updateStats(); loadActivities(); }
         else if (sectionName === 'profile') { if(profileContent) profileContent.classList.add('active'); updateUserUI(); }
         else if (sectionName === 'settings') { if(settingsContent) settingsContent.classList.add('active'); applyRBAC(); activateSettingsTab(currentSettingsTab); }
         else {
             console.log(`Loading dynamic section: ${sectionName}`);
             if (featureSectionsContainer) { featureSectionsContainer.style.display = 'block'; loadSection(sectionName); } else { console.error("#featureSectionsContainer not found!"); }
         }
         if (backButton) backButton.style.display = sectionName !== 'dashboard' ? 'inline-flex' : 'none';
         window.scrollTo(0, 0);
         localStorage.setItem('lastActiveSection', sectionName === 'settings' ? 'settings' : sectionName);
    }

    function loadSection(sectionName) {
        console.log(`--- loadSection called for: ${sectionName} ---`);
        const htmlPath = `sections/${sectionName}.html`;
        const jsPath = `sections/${sectionName}.js`;
        const initFunctionName = sectionsWithJS[sectionName];

        // Show Loading Placeholder (Keep implementation)
        if (!featureSections || !featurePlaceholder) { console.error("loadSection: Placeholder elements missing!");}
        else { /* Show placeholder */ featureSections.innerHTML = ''; featureSections.appendChild(featurePlaceholder); /*...*/ featurePlaceholder.style.display = 'flex'; }

        // Remove Previous Script (Keep implementation)
        if (currentSectionScript && currentSectionScript.parentNode) { currentSectionScript.remove(); currentSectionScript = null; }

        // Fetch HTML (Keep implementation)
        fetch(htmlPath)
            .then(response => { if (!response.ok) throw new Error(`HTML ${response.status}`); return response.text(); })
            .then(html => {
                console.log(`HTML loaded for ${sectionName}`);
                featureSections.innerHTML = html;
                featureSections.classList.add('active');
                if(featurePlaceholder) featurePlaceholder.style.display = 'none';

                // Load JS
                if (initFunctionName) {
                    console.log(`Attempting to load JS: ${jsPath}`);
                    const script = document.createElement('script');
                    script.src = jsPath;
                    script.type = 'text/javascript';
                    script.onload = () => {
                        console.log(`Script loaded: ${jsPath}`);
                        if (typeof window[initFunctionName] === 'function') {
                            try {
                                console.log(`Executing ${initFunctionName}...`);
                                // --->>> CRITICAL CHECK before passing <<<---
                                const currentUserCopy = JSON.parse(JSON.stringify(currentUser || {}));
                                const teamMembersCopy = JSON.parse(JSON.stringify(teamMembers || [])); // Use the CURRENT teamMembers

                                if (!Array.isArray(teamMembersCopy) || teamMembersCopy.length === 0) {
                                     console.error(`CRITICAL ERROR: Attempting to call ${initFunctionName} but teamMembers array is EMPTY or INVALID!`, teamMembersCopy);
                                     showSuccessMessage("Error: Could not load schedule data (no team members found).", "danger"); // Show error to user
                                     // Optionally display error in the placeholder
                                     if(featureErrorMessage) { featureErrorMessage.textContent = "Failed to load team data."; featureErrorMessage.style.display = 'block'; }
                                     if(featurePlaceholder) featurePlaceholder.style.display = 'flex';
                                } else {
                                     console.log(`---> Passing ${teamMembersCopy.length} team members to ${initFunctionName}`);
                                     window[initFunctionName](currentUserCopy, teamMembersCopy); // Pass actual data
                                     console.log(`${initFunctionName} execution initiated.`);
                                }
                            } catch (err) { console.error(`Error executing ${initFunctionName}:`, err); /* Show error UI */ }
                        } else { console.warn(`Init function '${initFunctionName}' NOT FOUND.`); /* Show warning UI */ }
                    };
                    script.onerror = (event) => { console.error(`Error loading script: ${jsPath}`, event); /* Show error UI */ };
                    document.body.appendChild(script);
                    currentSectionScript = script;
                } else { if(featurePlaceholder) featurePlaceholder.style.display = 'none'; }
            })
            .catch(error => { console.error(`Failed to load section '${sectionName}':`, error); /* Show error UI */ });
    }

    function activateSettingsTab(tabId) { /* ... implementation ... */ }
    function handleInitialNavigation() {
         console.log("--- handleInitialNavigation ---");
         const hash = window.location.hash.substring(1);
         let initialSection = 'dashboard'; let initialTab = null;
         if (hash) { /* Parse hash */ if (hash.startsWith('settings-')) { initialSection = 'settings'; initialTab = hash.split('-')[1] || 'preferences'; } else { const isValid = [...menuButtons, ...dropdownButtons].some(b => b.dataset.section === hash); if (isValid) initialSection = hash; else history.replaceState(null, '', window.location.pathname); } }
         else { /* Use localStorage */ const lastSection = localStorage.getItem('lastActiveSection'); if (lastSection && [...menuButtons, ...dropdownButtons].some(b => b.dataset.section === lastSection)) initialSection = lastSection; }
         console.log(`Initial navigation target: Section=${initialSection}, Tab=${initialTab}`);
         setActive(initialSection, initialTab);
     }

    // --- Event Listener Setup ---
    function setupEventListeners() {
        console.log("--- setupEventListeners ---");
        // Navigation
        menuButtons.forEach(button => button.addEventListener('click', (e) => { e.preventDefault(); setActive(button.dataset.section); }));
        dropdownButtons.forEach(button => button.addEventListener('click', (e) => { e.preventDefault(); if(userDropdown) userDropdown.classList.remove('active'); setActive(button.dataset.section); }));
        if (backButton) backButton.addEventListener('click', () => setActive('dashboard'));
        window.addEventListener('popstate', (event) => { if (event.state?.section) setActive(event.state.section, event.state.tab); else handleInitialNavigation(); });
        if(logoutLink) logoutLink.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
        // Add other listeners for search, profile, settings, modals etc.
        console.log("Event listeners setup complete.");
    }

    // --- Initialization ---
    function initializeApp() {
        console.log("--- Initializing App ---");
        loadData();         // <<<< FORCES FAKE DATA if localStorage empty
        updateUserUI();
        loadActivities();
        loadNotifications();
        updateStats();      // <<<< Uses the now guaranteed non-empty teamMembers count
        applyUserPreferences();
        applyRBAC();
        setupEventListeners();
        handleInitialNavigation();
        startActivityTimeUpdater();
        console.log("--- Dashboard Initialized ---");
    }

    // --- Start App ---
    initializeApp();

}); // End DOMContentLoaded
