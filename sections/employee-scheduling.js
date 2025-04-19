// dashboard.js
// FINAL CORRECTED VERSION - Focused on ensuring teamMembers data exists and is passed

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    // --- DOM Elements (Assume they exist based on previous steps) ---
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
    const activityList = document.getElementById('activityList');
    const notificationsBody = document.getElementById('notificationsBody');
    const notificationBadge = document.querySelector('.notification-badge');
    const teamMembersCount = document.getElementById('teamMembersCount');
    const tasksCompleted = document.getElementById('tasksCompleted');
    const activeProjects = document.getElementById('activeProjects');
    const upcomingDeadlines = document.getElementById('upcomingDeadlines');
    const teamMembersTrend = document.getElementById('teamMembersTrend');
    const tasksCompletedTrend = document.getElementById('tasksCompletedTrend');
    const activeProjectsTrend = document.getElementById('activeProjectsTrend');
    const upcomingDeadlinesTrend = document.getElementById('upcomingDeadlinesTrend');
    const teamList = document.getElementById('teamList'); // Needed for Settings -> Team
    const logoutLink = document.getElementById('logoutLink');
    const userName = document.getElementById('userName'); // For updateUserUI
    const userEmail = document.getElementById('userEmail'); // For updateUserUI
    const welcomeName = document.getElementById('welcomeName'); // For updateUserUI
    const userAvatar = document.getElementById('userAvatar'); // For updateUserUI
    const profileAvatar = document.getElementById('profileAvatar'); // For updateUserUI
    const userInfoRoleTitle = document.getElementById('userInfoRoleTitle'); // For updateUserUI
    // Add any other elements needed by your full implementation

    // --- State Variables ---
    let currentUser = {};
    let teamMembers = []; // <<<< ENSURE THIS GETS POPULATED
    let activities = [];
    let notifications = [];
    let currentSectionName = 'dashboard';
    let currentSettingsTab = null;
    let currentSectionScript = null;
    let activityIntervalId = null;
    let confirmCallback = null;
    let cancelCallback = null;

    // Define known sections that have dedicated JS files and initialization functions
    const sectionsWithJS = {
        'employee-scheduling': 'initializeEmployeeSchedule',
        // 'task-management': 'initializeTasks', // Example
    };

    // --- Constants ---
    const MAX_ACTIVITIES_DISPLAYED = 5;
    const UPDATE_INTERVAL = 60000;
    const DEFAULT_USER = {
        id: 1, name: 'Mohamed Elmenisy', email: 'm.elsayed@thechefz.co',
        title: 'Administrator', department: 'Management', phone: '+201234567890',
        avatar: '', initials: 'ME', role: 'admin', password: 'password123',
        preferences: { language: 'en', timezone: 'cairo', dateFormat: 'dd/mm/yyyy', theme: 'blue', layoutDensity: 'normal', soundNotifications: true, weekStart: 'sun' },
        notificationPreferences: { email: { tasks: true, deadlines: true, updates: false }, push: { messages: true, teamUpdates: false } },
        security: { twoFactorEnabled: true },
        stats: { teamMembers: 0, tasksCompleted: 0, activeProjects: 0, upcomingDeadlines: 0, teamMembersTrend: 'neutral', tasksCompletedTrend: 'neutral', activeProjectsTrend: 'neutral', upcomingDeadlinesTrend: 'neutral' }
    };

    // --- FAKE DATA GENERATION (Use this if localStorage is empty) ---
    function generateFakeTeam() {
        console.warn("generateFakeTeam: Generating fake team data because localStorage was empty or invalid.");
        return [
            // Ensure these objects have the properties needed by employee-scheduling.js (id, name, email, role maybe?)
            { id: 1, name: 'Mohamed Elmenisy', email: 'm.elsayed@thechefz.co', role: 'admin', title: 'Administrator', initials: 'ME' },
            { id: 2, name: 'Yousef Ahmed', email: 'y.ahmed@example.com', role: 'supervisor', title: 'Supervisor', initials: 'YA' },
            { id: 3, name: 'Esraa Lashin', email: 'e.lashin@example.com', role: 'senior', title: 'Senior Developer', initials: 'EL' },
            { id: 4, name: 'Bassant Badr', email: 'b.badr@example.com', role: 'member', title: 'Designer', initials: 'BB' },
            { id: 5, name: 'Ali Hassan', email: 'a.hassan@example.com', role: 'member', title: 'Developer', initials: 'AH' }
        ];
    }
    function generateFakeActivities() { return []; }
    function generateFakeNotifications() { return []; }

    // --- Utility for Deep Merging ---
    function isObject(item) { return (item && typeof item === 'object' && !Array.isArray(item)); }
    function mergeDeep(target, ...sources) {
        sources.forEach(source => {
             if (!source) return; // Skip null/undefined sources
            Object.keys(source).forEach(key => {
                const targetValue = target[key];
                const sourceValue = source[key];
                if (isObject(targetValue) && isObject(sourceValue)) {
                    mergeDeep(targetValue, sourceValue);
                } else if (sourceValue !== undefined) { // Only overwrite if source value is defined
                    target[key] = sourceValue;
                }
            });
        });
        return target;
    }


    // --- Data Handling ---
    function loadData() {
        console.log("--- loadData ---");
        let storedUser = null;
        try {
            storedUser = JSON.parse(localStorage.getItem('currentUser'));
        } catch (e) { console.error("Error parsing currentUser from localStorage:", e); }
        // Perform a deep merge to ensure all default properties exist
        currentUser = mergeDeep(JSON.parse(JSON.stringify(DEFAULT_USER)), storedUser);
        console.log("loadData: currentUser loaded/merged:", currentUser);


        // --->>> Load Team Members with Logging and GUARANTEED Fallback <<<---
        let storedTeam = null;
        try {
            const teamData = localStorage.getItem('teamMembers');
             if(teamData) { // Only parse if data exists
                storedTeam = JSON.parse(teamData);
                console.log("loadData: Parsed teamMembers from localStorage.");
             } else {
                 console.log("loadData: No teamMembers found in localStorage.");
             }
        } catch (e) {
            console.error("Error parsing teamMembers from localStorage:", e);
            storedTeam = null; // Treat parse error as no data
        }

        // **Check if storedTeam is a valid, non-empty array**
        if (storedTeam && Array.isArray(storedTeam) && storedTeam.length > 0) {
            teamMembers = storedTeam;
            console.log(`loadData: Using ${teamMembers.length} team members from localStorage.`);
        } else {
             // **If not valid or empty, ALWAYS generate fake data for testing**
            console.log("loadData: Using generateFakeTeam() as fallback.");
            teamMembers = generateFakeTeam();
        }
        console.log(`loadData: Final teamMembers count: ${teamMembers.length}`);
        // console.log("loadData: Final teamMembers data:", JSON.stringify(teamMembers)); // For detailed check

        // Load other data
        activities = JSON.parse(localStorage.getItem('activities') || '[]') || generateFakeActivities(); // Safer parsing
        notifications = JSON.parse(localStorage.getItem('notifications') || '[]') || generateFakeNotifications(); // Safer parsing

        // Ensure stats reflect the potentially generated team members
        if (currentUser.stats) currentUser.stats.teamMembers = teamMembers.length;
        console.log("--- loadData finished ---");
    }

    function saveData() {
         try {
             localStorage.setItem('currentUser', JSON.stringify(currentUser));
             localStorage.setItem('teamMembers', JSON.stringify(teamMembers)); // Save current team (including fake if generated)
             localStorage.setItem('activities', JSON.stringify(activities));
             localStorage.setItem('notifications', JSON.stringify(notifications));
             console.log("saveData: Data saved to localStorage.");
         } catch (e) {
             console.error("Error saving data to localStorage:", e);
         }
     }

    // --- UI Update Functions ---
    function updateUserUI() {
         console.log("updateUserUI executing...");
         if (!userName || !userEmail || !welcomeName || !userAvatar || !profileAvatar || !userInfoRoleTitle) {
              console.warn("updateUserUI: Missing one or more UI elements to update.");
              return;
         }
         const nameParts = currentUser.name ? currentUser.name.split(' ') : ['User'];
         const firstName = nameParts[0];
         const lastName = nameParts.slice(1).join(' ');
         userName.textContent = currentUser.name || 'User';
         userEmail.textContent = currentUser.email || 'No Email';
         welcomeName.textContent = firstName;
         document.querySelector('.user-info-name').textContent = currentUser.name || 'User';

         const roleTitles = { 'admin': 'Administrator', 'senior': 'Senior', 'supervisor': 'Supervisor', 'member': 'Member' };
         const roleTitle = roleTitles[currentUser.role] || 'Member';
         userInfoRoleTitle.textContent = roleTitle;
         userInfoRoleTitle.className = 'user-info-title'; // Reset
         if (currentUser.role === 'admin') userInfoRoleTitle.classList.add('role-admin');

         const initials = currentUser.initials || (firstName ? firstName[0] : '') + (lastName ? lastName[0] : '');
         [userAvatar, profileAvatar].forEach(el => { // Removed profileAvatarLarge assumption
             if(!el) return;
             if (currentUser.avatar) {
                 el.style.backgroundImage = `url(${currentUser.avatar})`;
                 el.textContent = '';
                 el.style.backgroundColor = '';
             } else {
                 el.style.backgroundImage = 'none';
                 el.textContent = initials.toUpperCase() || 'U';
                 el.style.backgroundColor = 'var(--primary)'; // Revert to default style
                 el.style.color = 'white';
             }
         });
         // Update profile page avatar separately if needed
         const profileLarge = document.getElementById('profileAvatarLarge');
          if(profileLarge) {
             if (currentUser.avatar) {
                  profileLarge.style.backgroundImage = `url(${currentUser.avatar})`;
                  profileLarge.textContent = '';
                  profileLarge.style.backgroundColor = '';
              } else {
                  profileLarge.style.backgroundImage = 'none';
                  profileLarge.textContent = initials.toUpperCase() || 'U';
                  profileLarge.style.backgroundColor = 'var(--primary-light)';
                  profileLarge.style.color = 'var(--primary-dark)';
              }
          }
         // ... (Update profile form, settings forms if necessary) ...
     }
    function applyUserPreferences() { /* ... implementation ... */ }
    function applyRBAC() { /* ... implementation ... */ }
    function loadSettingsFormData() { /* ... implementation ... */ }
    function updateStats() {
        console.log("updateStats executing...");
        if (!teamMembersCount) { console.warn("updateStats: teamMembersCount element missing."); return; }
        const stats = currentUser.stats || {};
        teamMembersCount.textContent = teamMembers.length; // Use the *actual current* length
        if(tasksCompleted) tasksCompleted.textContent = stats.tasksCompleted ?? 0;
        if(activeProjects) activeProjects.textContent = stats.activeProjects ?? 0;
        if(upcomingDeadlines) upcomingDeadlines.textContent = stats.upcomingDeadlines ?? 0;
        updateTrendIndicator(teamMembersTrend, stats.teamMembersTrend);
        updateTrendIndicator(tasksCompletedTrend, stats.tasksCompletedTrend);
        updateTrendIndicator(activeProjectsTrend, stats.activeProjectsTrend);
        updateTrendIndicator(upcomingDeadlinesTrend, stats.upcomingDeadlinesTrend);
    }
    function updateTrendIndicator(element, trend) { /* ... implementation ... */ }
    function updateNotificationBadge() { /* ... implementation ... */ }
    function loadActivities(showAll = false) { /* ... implementation ... */ }
    function loadNotifications() { /* ... implementation ... */ }
    function loadTeamMembers() { /* ... implementation ... */ } // Ensure this uses `teamMembers` array
    function getTimeAgo(timestamp) { /* ... implementation ... */ }
    function updateActivityTimes() { /* ... implementation ... */ }
    function startActivityTimeUpdater() { if(activityIntervalId) clearInterval(activityIntervalId); activityIntervalId = setInterval(updateActivityTimes, UPDATE_INTERVAL); }
    function addActivity(icon, message) { /* ... implementation ... */ }
    function addNotification(icon, message) { /* ... implementation ... */ }
    function playNotificationSound() { /* ... implementation ... */ }
    function showSuccessMessage(message) { /* ... implementation ... */ }


    // --- Navigation and Content Loading ---
    function setActive(sectionName, settingsTab = null) {
        console.log(`--- setActive called: section=${sectionName}, tab=${settingsTab} ---`);
        if (!menuButtons || !contentSections || !featureSectionsContainer || !backButton) { console.error("setActive: Core navigation elements missing!"); return; }

        currentSectionName = sectionName;
        currentSettingsTab = (sectionName === 'settings') ? (settingsTab || currentSettingsTab || 'preferences') : null;

        // Update URL Hash/History (Keep implementation)
        let hash = `#${sectionName}`;
        if (sectionName === 'settings' && currentSettingsTab) { hash += `-${currentSettingsTab}`; }
        if (window.location.hash !== hash) {
             try {
                  if (sectionName === 'settings' && window.location.hash.startsWith('#settings-')) { history.replaceState({ section: sectionName, tab: currentSettingsTab }, '', hash); }
                  else { history.pushState({ section: sectionName, tab: currentSettingsTab }, '', hash); }
                  console.log(`History state updated. New hash: ${window.location.hash}`);
             } catch (error) { console.error("Error updating history state:", error); }
        }

        // Update Nav Button Active States (Keep implementation)
        menuButtons.forEach(btn => btn.classList.remove('active'));
        dropdownButtons.forEach(btn => btn.classList.remove('active'));
        const activeMenuBtn = document.querySelector(`.sidebar-menu button[data-section="${sectionName}"]`);
        if (activeMenuBtn) activeMenuBtn.classList.add('active');
        const activeDropdownBtn = document.querySelector(`.user-dropdown button[data-section="${sectionName}"]`);
        if (activeDropdownBtn) activeDropdownBtn.classList.add('active');

        // Switch Content Visibility (Keep implementation)
        contentSections.forEach(section => section.classList.remove('active'));
        featureSectionsContainer.style.display = 'none';

        if (sectionName === 'dashboard') { if(dashboardContent) dashboardContent.classList.add('active'); updateStats(); loadActivities(); }
        else if (sectionName === 'profile') { if(profileContent) profileContent.classList.add('active'); updateUserUI(); }
        else if (sectionName === 'settings') { if(settingsContent) settingsContent.classList.add('active'); applyRBAC(); activateSettingsTab(currentSettingsTab); }
        else {
             console.log(`Loading dynamic section: ${sectionName}`);
             if (featureSectionsContainer) { featureSectionsContainer.style.display = 'block'; loadSection(sectionName); }
             else { console.error("#featureSectionsContainer not found!"); }
        }

        // Update Back Button (Keep implementation)
        if (backButton) backButton.style.display = sectionName !== 'dashboard' ? 'inline-flex' : 'none';
        window.scrollTo(0, 0);
        localStorage.setItem('lastActiveSection', sectionName === 'settings' ? 'settings' : sectionName);
    }

    function loadSection(sectionName) {
        console.log(`--- loadSection called for: ${sectionName} ---`);
        const htmlPath = `sections/${sectionName}.html`;
        const jsPath = `sections/${sectionName}.js`;
        const initFunctionName = sectionsWithJS[sectionName];

        // Display Loading State (Keep implementation)
         if (!featureSections || !featurePlaceholder || !featureTitle || !featureDescription || !featureLoadingIndicator || !featureErrorMessage) { console.error("loadSection: Placeholder elements missing!"); }
         else { /* Show placeholder */
             featureSections.innerHTML = ''; featureSections.appendChild(featurePlaceholder); featureTitle.textContent = `Loading...`; featureDescription.textContent = ''; featureLoadingIndicator.style.display = 'block'; featureErrorMessage.style.display = 'none'; featurePlaceholder.style.display = 'flex'; featureSections.classList.remove('active');
         }

        // Remove Previous Script (Keep implementation)
        if (currentSectionScript && currentSectionScript.parentNode) { currentSectionScript.remove(); currentSectionScript = null; }

        // Fetch HTML (Keep implementation)
        fetch(htmlPath)
            .then(response => { if (!response.ok) throw new Error(`HTML Load Error: ${response.status}`); return response.text(); })
            .then(html => {
                console.log(`HTML loaded for ${sectionName}`);
                featureSections.innerHTML = html;
                featureSections.classList.add('active');
                if(featurePlaceholder) featurePlaceholder.style.display = 'none';

                // Load JS (if applicable)
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
                                // --->>> CRITICAL: Pass the CURRENT teamMembers array <<<---
                                const currentUserCopy = JSON.parse(JSON.stringify(currentUser || {}));
                                const teamMembersCopy = JSON.parse(JSON.stringify(teamMembers || [])); // Use the current, potentially generated, teamMembers
                                console.log(`---> Passing ${teamMembersCopy.length} team members to ${initFunctionName}`, teamMembersCopy);

                                window[initFunctionName](currentUserCopy, teamMembersCopy); // Pass actual data
                                console.log(`${initFunctionName} execution seems successful.`);
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
    function handleInitialNavigation() { /* ... implementation ... */ }

    // --- Event Listener Setup ---
    function setupEventListeners() {
        console.log("--- setupEventListeners ---");
        // Sidebar & Dropdown Navigation (Keep implementation)
        menuButtons.forEach(button => button.addEventListener('click', (e) => { e.preventDefault(); setActive(button.dataset.section); }));
        dropdownButtons.forEach(button => button.addEventListener('click', (e) => { e.preventDefault(); if(userDropdown) userDropdown.classList.remove('active'); setActive(button.dataset.section); }));
        // Back Button
        if (backButton) backButton.addEventListener('click', () => setActive('dashboard'));
        // Popstate
        window.addEventListener('popstate', (event) => { if (event.state && event.state.section) { setActive(event.state.section, event.state.tab); } else { handleInitialNavigation(); } });
        // Logout
        if(logoutLink) logoutLink.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
        // --- Add ALL OTHER Listeners (Search, Modals, Forms, etc.) ---
         console.log("Event listeners setup complete.");
    }

     // --- Placeholder/Mock for other functions ---
     function handleLogout() { console.log("Logout - Placeholder"); alert("Logout Placeholder"); /* Implement real logout */ }
     // ... Add other handlers as needed ...


    // --- Initialization ---
    function initializeApp() {
        console.log("--- Initializing App ---");
        loadData();         // <<<< ENSURE THIS LOADS/GENERATES teamMembers
        updateUserUI();
        // Don't call loadTeamMembers here necessarily, let settings tab handle it
        loadActivities();
        loadNotifications();
        updateStats();      // <<<< This now uses the correct teamMembers count
        applyUserPreferences();
        applyRBAC();
        setupEventListeners();
        handleInitialNavigation(); // Load initial section
        startActivityTimeUpdater();
        console.log("--- Dashboard Initialized ---");
    }

    // --- Start the Application ---
    initializeApp();

}); // End DOMContentLoaded
