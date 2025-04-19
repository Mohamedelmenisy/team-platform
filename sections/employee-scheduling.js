// dashboard.js
// Last Updated: To ensure teamMembers data loading and passing

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    // --- DOM Elements (Checked for existence in previous steps) ---
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
    const activityList = document.getElementById('activityList'); // Added for loadActivities
    const notificationsBody = document.getElementById('notificationsBody'); // Added for loadNotifications
    const notificationBadge = document.querySelector('.notification-badge'); // Added for updateNotifBadge
    const teamMembersCount = document.getElementById('teamMembersCount'); // Added for updateStats
    const tasksCompleted = document.getElementById('tasksCompleted'); // Added for updateStats
    const activeProjects = document.getElementById('activeProjects'); // Added for updateStats
    const upcomingDeadlines = document.getElementById('upcomingDeadlines'); // Added for updateStats
    const teamMembersTrend = document.getElementById('teamMembersTrend'); // Added for updateStats
    const tasksCompletedTrend = document.getElementById('tasksCompletedTrend'); // Added for updateStats
    const activeProjectsTrend = document.getElementById('activeProjectsTrend'); // Added for updateStats
    const upcomingDeadlinesTrend = document.getElementById('upcomingDeadlinesTrend'); // Added for updateStats
    const teamList = document.getElementById('teamList'); // Added for loadTeamMembers
    const logoutLink = document.getElementById('logoutLink'); // For logout listener
    // ... include other element variables if needed by restored functions ...

    // --- State Variables ---
    let currentUser = {};
    let teamMembers = []; // <<<< WILL BE LOADED/GENERATED
    let activities = [];
    let notifications = [];
    let currentSectionName = 'dashboard';
    let currentSettingsTab = null;
    let currentSectionScript = null;
    let activityIntervalId = null; // For time updates
    let confirmCallback = null; // For confirm modal
    let cancelCallback = null; // For confirm modal


    // Define known sections that have dedicated JS files and initialization functions
    const sectionsWithJS = {
        'employee-scheduling': 'initializeEmployeeSchedule',
        // Add other sections: 'task-management': 'initializeTasks', etc.
    };

    // --- Constants (Example) ---
    const MAX_ACTIVITIES_DISPLAYED = 5;
    const UPDATE_INTERVAL = 60000;
    const DEFAULT_USER = { /* ... your default user object ... */
        id: 1, name: 'Mohamed Elmenisy', email: 'm.elsayed@thechefz.co',
        title: 'Administrator', department: 'Management', phone: '+201234567890',
        avatar: '', initials: 'ME', role: 'admin', password: 'password123', // Note: Plain text password insecure
        preferences: { language: 'en', timezone: 'cairo', dateFormat: 'dd/mm/yyyy', theme: 'blue', layoutDensity: 'normal', soundNotifications: true, weekStart: 'sun' },
        notificationPreferences: { email: { tasks: true, deadlines: true, updates: false }, push: { messages: true, teamUpdates: false } },
        security: { twoFactorEnabled: true },
        stats: { teamMembers: 0, tasksCompleted: 0, activeProjects: 0, upcomingDeadlines: 0, teamMembersTrend: 'neutral', tasksCompletedTrend: 'neutral', activeProjectsTrend: 'neutral', upcomingDeadlinesTrend: 'neutral' }
    };

    // --- FAKE DATA GENERATION (for testing if localStorage is empty) ---
    function generateFakeTeam() {
        console.warn("generateFakeTeam: Generating fake team data because localStorage was empty.");
        return [
            { id: 1, name: 'Mohamed Elmenisy', email: 'm.elsayed@thechefz.co', role: 'admin', initials: 'ME', avatar: '', title: 'Administrator' },
            { id: 2, name: 'Yousef Ahmed', email: 'y.ahmed@example.com', role: 'supervisor', initials: 'YA', avatar: '', title: 'Supervisor' },
            { id: 3, name: 'Esraa Lashin', email: 'e.lashin@example.com', role: 'senior', initials: 'EL', avatar: '', title: 'Senior Developer' },
            { id: 4, name: 'Bassant Badr', email: 'b.badr@example.com', role: 'member', initials: 'BB', avatar: '', title: 'UI/UX Designer' },
            { id: 5, name: 'Ali Hassan', email: 'a.hassan@example.com', role: 'member', initials: 'AH', avatar: '', title: 'Frontend Developer' }
        ];
    }
     function generateFakeActivities() { /* ... implementation ... */ return []; }
     function generateFakeNotifications() { /* ... implementation ... */ return []; }

    // --- Data Handling ---
    function loadData() {
        console.log("--- loadData ---");
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        currentUser = mergeDeep(JSON.parse(JSON.stringify(DEFAULT_USER)), storedUser || {});

        // --->>> Load Team Members with Logging and Fallback <<<---
        let storedTeam = null;
        try {
             storedTeam = JSON.parse(localStorage.getItem('teamMembers'));
        } catch(e) {
            console.error("Error parsing teamMembers from localStorage:", e);
            storedTeam = null; // Treat parse error as no data
        }

        if (storedTeam && Array.isArray(storedTeam) && storedTeam.length > 0) {
            teamMembers = storedTeam;
            console.log(`loadData: Loaded ${teamMembers.length} team members from localStorage.`);
        } else {
            console.log("loadData: No valid team members found in localStorage. Using generateFakeTeam().");
            teamMembers = generateFakeTeam(); // Use fake data if localStorage is empty/invalid
        }
         // console.log("loadData: Final teamMembers:", JSON.stringify(teamMembers)); // Uncomment for detail

        activities = JSON.parse(localStorage.getItem('activities')) || generateFakeActivities();
        notifications = JSON.parse(localStorage.getItem('notifications')) || generateFakeNotifications();

        // Update stats based on loaded team size
        if (currentUser.stats) currentUser.stats.teamMembers = teamMembers.length;
        console.log("--- loadData finished ---");
    }

    function saveData() { /* ... implementation (save currentUser, teamMembers, etc.) ... */ }
    function mergeDeep(target, ...sources) { /* ... implementation ... */ } // Keep this utility


    // --- UI Update Functions (Keep implementations from previous steps) ---
    function updateUserUI() { console.log("updateUserUI executing..."); /* ... full implementation ... */ }
    function applyUserPreferences() { console.log("applyUserPreferences executing..."); /* ... full implementation ... */ }
    function applyRBAC() { console.log("applyRBAC executing..."); /* ... full implementation ... */ }
    function loadSettingsFormData() { console.log("loadSettingsFormData executing..."); /* ... full implementation ... */ }
    function updateStats() {
        console.log("updateStats executing...");
         if (!teamMembersCount || !tasksCompleted || !activeProjects || !upcomingDeadlines) {
             console.warn("updateStats: Missing one or more stat display elements.");
             return;
         }
        const stats = currentUser.stats || {};
        teamMembersCount.textContent = teamMembers.length; // Get current length
        tasksCompleted.textContent = stats.tasksCompleted ?? 0;
        activeProjects.textContent = stats.activeProjects ?? 0;
        upcomingDeadlines.textContent = stats.upcomingDeadlines ?? 0;
        updateTrendIndicator(teamMembersTrend, stats.teamMembersTrend);
        updateTrendIndicator(tasksCompletedTrend, stats.tasksCompletedTrend);
        updateTrendIndicator(activeProjectsTrend, stats.activeProjectsTrend);
        updateTrendIndicator(upcomingDeadlinesTrend, stats.upcomingDeadlinesTrend);
    }
    function updateTrendIndicator(element, trend) {
         if (!element) return;
         // Simplified version - keep your original logic if it worked
         trend = trend || 'neutral';
         let iconClass = 'fa-minus'; let trendClass = 'trend-neutral'; let percentage = '0%';
         if (trend === 'up') { iconClass = 'fa-arrow-up'; trendClass = 'trend-up'; percentage = `${Math.floor(Math.random() * 10) + 1}%`; }
         else if (trend === 'down') { iconClass = 'fa-arrow-down'; trendClass = 'trend-down'; percentage = `${Math.floor(Math.random() * 10) + 1}%`;}
         element.innerHTML = `<i class="fas ${iconClass}"></i> ${percentage}`;
         element.className = `stat-trend ${trendClass}`;
     }
    function updateNotificationBadge() { /* ... full implementation ... */ }
    function loadActivities(showAll = false) { /* ... full implementation ... */ }
    function loadNotifications() { /* ... full implementation ... */ }
    function loadTeamMembers() { /* ... full implementation ... */ }
    function getTimeAgo(timestamp) { /* ... full implementation ... */ }
    function updateActivityTimes() { /* ... full implementation ... */ }
    function startActivityTimeUpdater() { /* ... full implementation ... */ }
    function addActivity(icon, message) { /* ... full implementation ... */ }
    function addNotification(icon, message) { /* ... full implementation ... */ }
    function playNotificationSound() { /* ... full implementation ... */ }
    function showSuccessMessage(message) { /* ... full implementation ... */ }


    // --- Navigation and Content Loading (Keep implementations from previous steps) ---

    function setActive(sectionName, settingsTab = null) {
        console.log(`--- setActive called with: section=${sectionName}, tab=${settingsTab} ---`);
        // **Ensure all elements needed exist before proceeding**
        if (!menuButtons || !contentSections || !featureSectionsContainer || !backButton) {
            console.error("setActive: Core navigation elements missing!");
            return;
        }

        // 1. Update State
        currentSectionName = sectionName;
        currentSettingsTab = (sectionName === 'settings') ? (settingsTab || currentSettingsTab || 'preferences') : null;

        // 2. Permissions Check (Example)
        // ... (implement checks if needed) ...

        // 3. Update URL Hash and History
        let hash = `#${sectionName}`;
        if (sectionName === 'settings' && currentSettingsTab) {
            hash += `-${currentSettingsTab}`;
        }
        console.log(`Target hash: ${hash}, Current hash: ${window.location.hash}`);
        if (window.location.hash !== hash) {
            try {
                if (sectionName === 'settings' && window.location.hash.startsWith('#settings-')) {
                    history.replaceState({ section: sectionName, tab: currentSettingsTab }, '', hash);
                } else {
                    history.pushState({ section: sectionName, tab: currentSettingsTab }, '', hash);
                }
                console.log(`History state updated. New hash: ${window.location.hash}`);
            } catch (error) {
                console.error("Error updating history state:", error);
            }
        } else {
            console.log("Hash is already correct, skipping history update.");
        }


        // 4. Update Active Class on Nav Buttons
        menuButtons.forEach(btn => btn.classList.remove('active'));
        dropdownButtons.forEach(btn => btn.classList.remove('active'));
        const activeMenuBtn = document.querySelector(`.sidebar-menu button[data-section="${sectionName}"]`);
        if (activeMenuBtn) activeMenuBtn.classList.add('active');
        const activeDropdownBtn = document.querySelector(`.user-dropdown button[data-section="${sectionName}"]`);
        if (activeDropdownBtn) activeDropdownBtn.classList.add('active');


        // 5. Switch Visible Content
        contentSections.forEach(section => section.classList.remove('active'));
        featureSectionsContainer.style.display = 'none';

        if (sectionName === 'dashboard') {
            if(dashboardContent) dashboardContent.classList.add('active'); else console.error("#dashboardContent not found");
            updateStats();
            loadActivities();
        } else if (sectionName === 'profile') {
            if(profileContent) profileContent.classList.add('active'); else console.error("#profileContent not found");
            updateUserUI();
        } else if (sectionName === 'settings') {
            if(settingsContent) settingsContent.classList.add('active'); else console.error("#settingsContent not found");
            applyRBAC();
            activateSettingsTab(currentSettingsTab);
        } else {
            // Load dynamic section
            console.log(`Loading dynamic section: ${sectionName}`);
            if (featureSectionsContainer) {
                featureSectionsContainer.style.display = 'block';
                loadSection(sectionName); // Fetch HTML/JS
            } else {
                console.error("#featureSectionsContainer not found for dynamic content!");
            }
        }

        // 6. Update Back Button
        if (backButton) backButton.style.display = sectionName !== 'dashboard' ? 'inline-flex' : 'none';

        // 7. Scroll to Top
        window.scrollTo(0, 0);

        // 8. Save Last Active Section
        localStorage.setItem('lastActiveSection', sectionName === 'settings' ? 'settings' : sectionName);
    }

    function loadSection(sectionName) {
        console.log(`--- loadSection called for: ${sectionName} ---`);
        const htmlPath = `sections/${sectionName}.html`;
        const jsPath = `sections/${sectionName}.js`;
        const initFunctionName = sectionsWithJS[sectionName];

        // Check for necessary elements for loading display
        if (!featureSections || !featurePlaceholder || !featureTitle || !featureDescription || !featureLoadingIndicator || !featureErrorMessage) {
            console.error("loadSection: Cannot display loading state, placeholder elements missing!");
            // Attempt to load anyway, but might look broken during load
        } else {
             // Display Loading State
             featureSections.innerHTML = '';
             featureSections.appendChild(featurePlaceholder);
             featureTitle.textContent = `Loading ${sectionName.replace(/-/g, ' ')}...`;
             featureDescription.textContent = '';
             featureLoadingIndicator.style.display = 'block';
             featureErrorMessage.style.display = 'none';
             featurePlaceholder.style.display = 'flex';
             featureSections.classList.remove('active');
        }

        // Remove Previous Section's Script
        if (currentSectionScript && currentSectionScript.parentNode) {
            console.log("Removing previous script:", currentSectionScript.src);
            currentSectionScript.remove();
            currentSectionScript = null;
        }

        // Fetch HTML
        fetch(htmlPath)
            .then(response => {
                console.log(`Fetch status for ${htmlPath}: ${response.status}`);
                if (!response.ok) {
                    throw new Error(`HTML Load Error: ${response.status} ${response.statusText} for ${htmlPath}`);
                }
                return response.text();
            })
            .then(html => {
                console.log(`HTML loaded successfully for ${sectionName}`);
                featureSections.innerHTML = html; // Inject HTML
                featureSections.classList.add('active');
                if(featurePlaceholder) featurePlaceholder.style.display = 'none'; // Hide placeholder

                // Load and Execute JS (if applicable)
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
                                // --->>> LOGGING DATA BEING PASSED <<<---
                                const currentUserCopy = JSON.parse(JSON.stringify(currentUser || {}));
                                const teamMembersCopy = JSON.parse(JSON.stringify(teamMembers || []));
                                console.log("Passing to initialize function - currentUser:", currentUserCopy);
                                console.log(`Passing to initialize function - teamMembers (${teamMembersCopy.length}):`, teamMembersCopy); // Log count and data

                                window[initFunctionName](currentUserCopy, teamMembersCopy); // Pass copies
                                console.log(`${initFunctionName} execution seems successful.`);
                            } catch (err) {
                                console.error(`Error executing ${initFunctionName}:`, err);
                                if(featureErrorMessage) {
                                    featureErrorMessage.textContent = `Script execution failed: ${err.message}. Check console.`;
                                    featureErrorMessage.style.display = 'block';
                                }
                                if(featurePlaceholder) featurePlaceholder.style.display = 'flex';
                            }
                        } else {
                            console.warn(`Initialization function '${initFunctionName}' NOT FOUND in window after loading ${jsPath}.`);
                             if(featureDescription) featureDescription.textContent = `Content loaded, but interaction script ('${initFunctionName}') missing.`;
                             if(featurePlaceholder) featurePlaceholder.style.display = 'flex';
                        }
                    };
                    script.onerror = (event) => {
                        console.error(`Error loading script: ${jsPath}`, event);
                         if(featureTitle) featureTitle.textContent = `Script Load Error`;
                         if(featureDescription) featureDescription.textContent = `Failed to load ${jsPath}. Check console and network tab.`;
                         if(featureLoadingIndicator) featureLoadingIndicator.style.display = 'none';
                         if(featureErrorMessage) featureErrorMessage.style.display = 'block';
                         if(featurePlaceholder) featurePlaceholder.style.display = 'flex';
                        if (script.parentNode) script.remove();
                        currentSectionScript = null;
                    };
                    document.body.appendChild(script);
                    currentSectionScript = script;
                } else {
                    console.log(`No specific JS initialization defined for section: ${sectionName}`);
                     if(featurePlaceholder) featurePlaceholder.style.display = 'none'; // Hide placeholder if no JS needed
                }
            })
            .catch(error => {
                console.error(`Failed to load section '${sectionName}' from '${htmlPath}':`, error);
                 if(featureTitle) featureTitle.textContent = `Error Loading ${sectionName.replace(/-/g, ' ')}`;
                 if(featureDescription) featureDescription.textContent = `Could not load content from ${htmlPath}. ${error.message}`;
                 if(featureLoadingIndicator) featureLoadingIndicator.style.display = 'none';
                 if(featureErrorMessage) featureErrorMessage.style.display = 'block';
                 if(featurePlaceholder) featurePlaceholder.style.display = 'flex';
                 if(featureSections) featureSections.classList.add('active');
            });
    }

    function activateSettingsTab(tabId) { /* ... full implementation ... */ }
    function handleInitialNavigation() { /* ... full implementation ... */ }

    // --- Event Listener Setup ---
    function setupEventListeners() {
        console.log("--- setupEventListeners ---");
        // Sidebar Navigation
        menuButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                setActive(button.dataset.section);
            });
        });
        // Dropdown Navigation
        dropdownButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (userDropdown) userDropdown.classList.remove('active');
                setActive(button.dataset.section);
            });
        });
        // Back Button
        if (backButton) backButton.addEventListener('click', () => setActive('dashboard'));
        // Popstate
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.section) {
                setActive(event.state.section, event.state.tab);
            } else {
                handleInitialNavigation();
            }
        });
         // Logout
         if(logoutLink) logoutLink.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
        // --- Add ALL other necessary listeners for search, modals, forms etc. ---
        // Ensure listeners for profile saving, settings saving, notifications are included
        console.log("Event listeners setup complete.");
    }

    // --- Placeholder/Mock for functions assumed from original code ---
    // Replace these with your actual implementations
    function handleLogout() { console.log("Logout clicked - Placeholder"); alert("Logout functionality placeholder"); }
    function handleSearch() { /* ... */ }
    // ... Add other handlers: handleProfileSave, handleSettingsSave, handleAvatarUpload, handleConfirm, etc.

    // --- Initialization ---
    function initializeApp() {
        console.log("--- Initializing App ---");
        loadData();         // Load user, team, activities, notifications
        updateUserUI();     // Update user name, avatar etc.
        // loadTeamMembers(); // This might be called within settings tab activation now
        loadActivities();   // Load initial activities
        loadNotifications(); // Load initial notifications
        updateStats();      // Update dashboard stats
        applyUserPreferences(); // Apply theme, density etc.
        applyRBAC();        // Apply role-based access control
        setupEventListeners(); // Setup ALL event listeners
        handleInitialNavigation(); // Load initial section based on URL/localStorage
        startActivityTimeUpdater(); // Start timeago updates
        console.log("--- Dashboard Initialized ---");
    }

    // --- Start the Application ---
    initializeApp();

}); // End DOMContentLoaded
