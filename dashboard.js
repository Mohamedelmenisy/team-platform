```javascript
document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const sidebar = document.getElementById('sidebar');
    const menuButtons = document.querySelectorAll('.sidebar-menu button[data-section]'); // Changed selector
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationBadge = document.querySelector('.notification-badge');
    const notificationsModal = document.getElementById('notificationsModal');
    const notificationsBody = document.getElementById('notificationsBody');
    const closeNotifications = document.getElementById('closeNotifications');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    const deleteAllNotificationsBtn = document.getElementById('deleteAllNotificationsBtn');
    const userAvatar = document.getElementById('userAvatar');
    const userProfileDetails = document.querySelector('.user-profile-details');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail'); // Corrected ID
    const welcomeName = document.getElementById('welcomeName');
    const userDropdown = document.getElementById('userDropdown');
    const dropdownButtons = document.querySelectorAll('.user-dropdown button[data-section]'); // Changed selector
    const logoutLink = document.getElementById('logoutLink');
    const contentSections = document.querySelectorAll('.content-area > .content-section'); // Direct children
    const dashboardContent = document.getElementById('dashboardContent');
    const profileContent = document.getElementById('profileContent');
    const settingsContent = document.getElementById('settingsContent');
    const featureSectionsContainer = document.getElementById('featureSectionsContainer');
    const featureSections = document.getElementById('featureSections');
    const featurePlaceholder = document.getElementById('featurePlaceholder');
    const featureTitle = document.getElementById('featureTitle');
    const featureDescription = document.getElementById('featureDescription');
    const featureLoadingIndicator = featurePlaceholder.querySelector('.loading-indicator');
    const featureErrorMessage = featurePlaceholder.querySelector('.error-message');
    const profileForm = document.getElementById('profileForm');
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    const profileAvatarInput = document.getElementById('profileAvatarInput');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    const uploadPhotoButton = document.getElementById('uploadPhotoButton');
    const activityList = document.getElementById('activityList');
    const viewAllActivity = document.getElementById('viewAllActivity');
    const deleteAllActivity = document.getElementById('deleteAllActivity');
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const settingsPanels = document.querySelectorAll('.settings-panel');
    const preferencesForm = document.getElementById('preferencesForm');
    const accountForm = document.getElementById('accountForm');
    const securityForm = document.getElementById('securityForm');
    const notificationsForm = document.getElementById('notificationsForm');
    const teamList = document.getElementById('teamList');
    const inviteMemberForm = document.getElementById('inviteMemberForm');
    const themeOptions = document.querySelectorAll('.theme-option');
    const layoutDensitySelect = document.getElementById('layoutDensity');
    const weekStartSelect = document.getElementById('weekStart'); // Ensure this exists
    const confirmModal = document.getElementById('confirmModal');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    const teamMembersCount = document.getElementById('teamMembersCount');
    const tasksCompleted = document.getElementById('tasksCompleted');
    const activeProjects = document.getElementById('activeProjects');
    const upcomingDeadlines = document.getElementById('upcomingDeadlines');
    const userInfoRoleTitle = document.getElementById('userInfoRoleTitle');
    const backButton = document.getElementById('backButton');
    const notificationSound = document.getElementById('notificationSound');
    const successMessage = document.getElementById('successMessage');
    const successMessageText = document.getElementById('successMessageText');
    const cancelPreferencesBtn = document.getElementById('cancelPreferencesBtn');
    const cancelAccountBtn = document.getElementById('cancelAccountBtn');
    const cancelSecurityBtn = document.getElementById('cancelSecurityBtn');
    const cancelNotificationsBtn = document.getElementById('cancelNotificationsBtn');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const currentPasswordError = document.getElementById('currentPasswordError');
    const passwordMatchError = document.getElementById('passwordMatchError');
    const teamMembersTrend = document.getElementById('teamMembersTrend');
    const tasksCompletedTrend = document.getElementById('tasksCompletedTrend');
    const activeProjectsTrend = document.getElementById('activeProjectsTrend');
    const upcomingDeadlinesTrend = document.getElementById('upcomingDeadlinesTrend');
    const soundNotificationsSwitch = document.getElementById('soundNotifications');
    const fullNameDisplay = document.getElementById('fullNameDisplay');
    const teamSettingsTab = document.getElementById('teamSettingsTab');
    const dangerZoneTab = document.getElementById('dangerZoneTab');

    // --- State Variables ---
    let currentUser = {};
    let teamMembers = [];
    let activities = [];
    let notifications = [];
    let currentSectionName = 'dashboard'; // Renamed from currentFeature
    let currentSettingsTab = 'preferences';
    let activityIntervalId = null;
    let confirmCallback = null;
    let cancelCallback = null;
    let currentSectionScript = null; // To track dynamically loaded script

    // --- Constants ---
    const MAX_ACTIVITIES_DISPLAYED = 5;
    const UPDATE_INTERVAL = 60000;
    const SIMULATED_DELAY = 500; // Reduced delay slightly
    const NEW_ACTIVITY_HIGHLIGHT_DURATION = 2500;
    const DEFAULT_USER = {
        id: 1, name: 'Mohamed Elmenisy', email: 'm.elsayed@thechefz.co',
        title: 'Administrator', department: 'Management', phone: '+201234567890',
        avatar: '', initials: 'ME', role: 'admin', password: 'password123', // Note: Storing plain text password is VERY insecure
        preferences: { language: 'en', timezone: 'cairo', dateFormat: 'dd/mm/yyyy', theme: 'blue', layoutDensity: 'normal', soundNotifications: true, weekStart: 'sun' },
        notificationPreferences: { email: { tasks: true, deadlines: true, updates: false }, push: { messages: true, teamUpdates: false } },
        security: { twoFactorEnabled: true },
        stats: { teamMembers: 0, tasksCompleted: 0, activeProjects: 0, upcomingDeadlines: 0, teamMembersTrend: 'neutral', tasksCompletedTrend: 'neutral', activeProjectsTrend: 'neutral', upcomingDeadlinesTrend: 'neutral' }
    };
    // Define known sections that have dedicated JS files and initialization functions
    const sectionsWithJS = {
        'employee-scheduling': 'initializeEmployeeSchedule',
        // Add other sections here: 'task-management': 'initializeTasks', etc.
    };

    // --- Initialization ---
    function initializeDashboard() {
        console.log("Initializing dashboard...");
        loadData();
        updateUserUI();
        // Load initial data required immediately
        loadTeamMembers(); // Load team members early if needed by search or other UI
        loadActivities();
        loadNotifications();
        updateStats();
        applyUserPreferences();
        applyRBAC();
        setupEventListeners(); // Setup listeners before handling navigation
        handleInitialNavigation(); // Load content based on hash/localStorage/default
        startActivityTimeUpdater();
        console.log("Dashboard initialized.");
    }

    // --- Data Handling (Simulated with localStorage) ---
    function loadData() {
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        // Deep merge defaults and stored data to avoid missing properties
        currentUser = mergeDeep(JSON.parse(JSON.stringify(DEFAULT_USER)), storedUser || {});
        teamMembers = JSON.parse(localStorage.getItem('teamMembers')) || generateFakeTeam(); // Add fake data generation
        activities = JSON.parse(localStorage.getItem('activities')) || generateFakeActivities(); // Add fake data
        notifications = JSON.parse(localStorage.getItem('notifications')) || generateFakeNotifications(); // Add fake data
        // Ensure stats reflect current team size if loaded from storage
        if (currentUser.stats) currentUser.stats.teamMembers = teamMembers.length;
    }

    function saveData() {
        // Only save parts that might change, avoid saving default password repeatedly etc.
        const userToSave = {
             ...currentUser,
             password: currentUser.password === DEFAULT_USER.password ? undefined : currentUser.password // Don't save default pass
        };
        localStorage.setItem('currentUser', JSON.stringify(userToSave));
        localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
        localStorage.setItem('activities', JSON.stringify(activities));
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }

    function clearUserData() { /* ... keep as is ... */ }

    // Utility for deep merging objects (useful for preferences/settings)
    function isObject(item) { return (item && typeof item === 'object' && !Array.isArray(item)); }
    function mergeDeep(target, ...sources) {
        sources.forEach(source => {
            Object.keys(source).forEach(key => {
                const targetValue = target[key];
                const sourceValue = source[key];
                if (isObject(targetValue) && isObject(sourceValue)) {
                    mergeDeep(targetValue, sourceValue);
                } else {
                    target[key] = sourceValue;
                }
            });
        });
        return target;
    }

    // --- Fake Data Generation (for initial setup/demo) ---
    function generateFakeTeam() {
        return [
            { id: 1, name: 'Mohamed Elmenisy', email: 'm.elsayed@thechefz.co', role: 'admin', initials: 'ME', avatar: '' },
            { id: 2, name: 'Yousef Ahmed', email: 'y.ahmed@example.com', role: 'supervisor', initials: 'YA', avatar: '' },
            { id: 3, name: 'Esraa Lashin', email: 'e.lashin@example.com', role: 'senior', initials: 'EL', avatar: '' },
            { id: 4, name: 'Bassant Badr', email: 'b.badr@example.com', role: 'member', initials: 'BB', avatar: '' },
            { id: 5, name: 'Ali Hassan', email: 'a.hassan@example.com', role: 'member', initials: 'AH', avatar: '' }
        ];
    }
    function generateFakeActivities() {
        return [
            { id: Date.now() - 10000, icon: 'fa-user-plus', message: 'Yousef Ahmed was added to the team.', timestamp: new Date(Date.now() - 10000).toISOString()},
            { id: Date.now() - 60000 * 5, icon: 'fa-tasks', message: 'Mohamed Elmenisy completed task "Setup Project Alpha".', timestamp: new Date(Date.now() - 60000 * 5).toISOString()},
            { id: Date.now() - 3600000 * 2, icon: 'fa-project-diagram', message: 'New project "Client Beta" created.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString()},
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
     function generateFakeNotifications() {
        return [
            { id: Date.now() - 5000, icon: 'fa-calendar-check', message: 'Your shift tomorrow starts at 9 AM.', timestamp: new Date(Date.now() - 5000).toISOString(), read: false },
            { id: Date.now() - 60000 * 10, icon: 'fa-comment', message: 'Esraa mentioned you in project "Client Beta".', timestamp: new Date(Date.now() - 60000 * 10).toISOString(), read: true },
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // --- UI Update Functions ---
    function updateUserUI() { /* ... keep your existing updateUserUI logic ... */
        const nameParts = currentUser.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        userName.textContent = currentUser.name;
        userEmail.textContent = currentUser.email; // Use the correct element ID
        welcomeName.textContent = firstName;
        document.querySelector('.user-info-name').textContent = currentUser.name;

        const roleTitles = { 'admin': 'Administrator', 'senior': 'Senior', 'supervisor': 'Supervisor', 'member': 'Member' };
        const roleTitle = roleTitles[currentUser.role] || 'Member';
        userInfoRoleTitle.textContent = roleTitle;
        userInfoRoleTitle.className = 'user-info-title'; // Reset classes
        if (currentUser.role === 'admin') {
            userInfoRoleTitle.classList.add('role-admin');
        } else {
             // Add other role classes if needed for styling
        }

        document.getElementById('firstName').value = firstName;
        document.getElementById('lastName').value = lastName;
        document.getElementById('jobTitle').value = currentUser.title || '';
        document.getElementById('phone').value = currentUser.phone || '';
        document.getElementById('department').value = currentUser.department || '';
        document.getElementById('email').value = currentUser.email;
        fullNameDisplay.value = currentUser.name;
        document.getElementById('acc_firstName').value = firstName;
        document.getElementById('acc_lastName').value = lastName;
        document.getElementById('acc_email').value = currentUser.email;

        const initials = currentUser.initials || (firstName ? firstName[0] : '') + (lastName ? lastName[0] : '');
        [userAvatar, profileAvatar, profileAvatarLarge].forEach(el => {
            if (currentUser.avatar) {
                el.style.backgroundImage = `url(${currentUser.avatar})`;
                el.textContent = '';
                el.style.backgroundColor = ''; // Clear background color if image is set
            } else {
                el.style.backgroundImage = 'none';
                el.textContent = initials.toUpperCase();
                 // Apply theme-aware background colors if needed, or use default
                el.style.backgroundColor = el === profileAvatarLarge ? 'var(--primary-light)' : 'var(--primary)';
                if (el === profileAvatarLarge) el.style.color = 'var(--primary-dark)';
                else el.style.color = 'white';
            }
        });
    }

    function applyUserPreferences() { /* ... keep your existing applyUserPreferences logic ... */
         document.body.className = ''; // Clear all classes first
         document.body.classList.add(`${currentUser.preferences?.theme || 'blue'}-theme`);
         document.body.classList.add(currentUser.preferences?.layoutDensity || 'normal');

         themeOptions.forEach(opt => {
             opt.classList.toggle('selected', opt.dataset.theme === currentUser.preferences?.theme);
         });
         layoutDensitySelect.value = currentUser.preferences?.layoutDensity || 'normal';
         // Load form data only if settings are currently visible or being navigated to
         if (currentSectionName === 'settings') {
             loadSettingsFormData();
         }
    }

    function applyRBAC() { /* ... keep your existing applyRBAC logic ... */
        const isAdmin = currentUser.role === 'admin';
        const isSupervisor = currentUser.role === 'supervisor';

        // Settings Tabs Visibility
        if (teamSettingsTab) teamSettingsTab.style.display = (isAdmin || isSupervisor) ? 'flex' : 'none'; // Use flex for tabs
        if (dangerZoneTab) dangerZoneTab.style.display = isAdmin ? 'flex' : 'none';

        // Specific Controls (ensure elements exist before disabling)
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) deleteAccountBtn.disabled = !isAdmin;

        // Disable inviting admin/supervisor if current user is not admin
        if(inviteMemberForm) {
            const roleSelect = inviteMemberForm.querySelector('#inviteMemberRole');
            if (roleSelect) {
                 const adminOption = roleSelect.querySelector('option[value="admin"]');
                 const supervisorOption = roleSelect.querySelector('option[value="supervisor"]');
                 if(adminOption) adminOption.disabled = !isAdmin;
                 if(supervisorOption) supervisorOption.disabled = !isAdmin && !isSupervisor;
            }
        }

        // Show/Hide edit/delete buttons in team list (handled within loadTeamMembers)
        if (currentSectionName === 'settings' && currentSettingsTab === 'team') {
            loadTeamMembers(); // Reload to apply permissions if team tab is active
        }
         // Show/Hide edit controls in employee schedule (handled by employee-scheduling.js based on passed user role)
    }

    function loadSettingsFormData() { /* ... keep your existing loadSettingsFormData logic ... */
        // Ensure defaults are applied if values are missing
        currentUser.preferences = currentUser.preferences || DEFAULT_USER.preferences;
        currentUser.security = currentUser.security || DEFAULT_USER.security;
        currentUser.notificationPreferences = currentUser.notificationPreferences || DEFAULT_USER.notificationPreferences;
        currentUser.notificationPreferences.email = currentUser.notificationPreferences.email || DEFAULT_USER.notificationPreferences.email;
        currentUser.notificationPreferences.push = currentUser.notificationPreferences.push || DEFAULT_USER.notificationPreferences.push;

        // Preferences Tab
        document.getElementById('selectedTheme').value = currentUser.preferences.theme || 'blue';
        layoutDensitySelect.value = currentUser.preferences.layoutDensity || 'normal';
        document.getElementById('language').value = currentUser.preferences.language || 'en';
        document.getElementById('dateFormat').value = currentUser.preferences.dateFormat || 'dd/mm/yyyy';
        if (weekStartSelect) weekStartSelect.value = currentUser.preferences.weekStart || 'sun'; // Check existence

        // Account Tab
        document.getElementById('timezone').value = currentUser.preferences.timezone || 'cairo';
        // Update read-only fields here too, in case they weren't updated via updateUserUI
        const nameParts = currentUser.name.split(' ');
        document.getElementById('acc_firstName').value = nameParts[0] || '';
        document.getElementById('acc_lastName').value = nameParts.slice(1).join(' ') || '';
        document.getElementById('acc_email').value = currentUser.email;


        // Security Tab
        document.getElementById('twoFactorAuth').checked = currentUser.security.twoFactorEnabled ?? true;
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        if(currentPasswordError) currentPasswordError.style.display = 'none';
        if(passwordMatchError) passwordMatchError.style.display = 'none';

        // Notifications Tab
        document.getElementById('emailTasks').checked = currentUser.notificationPreferences.email.tasks ?? true;
        document.getElementById('emailDeadlines').checked = currentUser.notificationPreferences.email.deadlines ?? true;
        document.getElementById('emailUpdates').checked = currentUser.notificationPreferences.email.updates ?? false;
        document.getElementById('pushMessages').checked = currentUser.notificationPreferences.push.messages ?? true;
        document.getElementById('pushTeamUpdates').checked = currentUser.notificationPreferences.push.teamUpdates ?? false;
        if(soundNotificationsSwitch) soundNotificationsSwitch.checked = currentUser.preferences.soundNotifications ?? true; // Check existence

    }

    function updateStats() { /* ... keep most of your existing updateStats logic ... */
        const stats = currentUser.stats || {};
        teamMembersCount.textContent = teamMembers.length; // Get current length
        tasksCompleted.textContent = stats.tasksCompleted ?? 0;
        activeProjects.textContent = stats.activeProjects ?? 0;
        upcomingDeadlines.textContent = stats.upcomingDeadlines ?? 0;

        // Update trend indicators (keep the random logic for demo or replace with real logic)
        updateTrendIndicator(teamMembersTrend, stats.teamMembersTrend || ['up', 'down', 'neutral'][Math.floor(Math.random() * 3)]);
        updateTrendIndicator(tasksCompletedTrend, stats.tasksCompletedTrend || ['up', 'down', 'neutral'][Math.floor(Math.random() * 3)]);
        updateTrendIndicator(activeProjectsTrend, stats.activeProjectsTrend || ['up', 'down', 'neutral'][Math.floor(Math.random() * 3)]);
        updateTrendIndicator(upcomingDeadlinesTrend, stats.upcomingDeadlinesTrend || ['up', 'down', 'neutral'][Math.floor(Math.random() * 3)]);

        // Save the updated team member count back to the user object if desired
        if (currentUser.stats) currentUser.stats.teamMembers = teamMembers.length;
        // Note: Consider saving stats changes via saveData() if they should persist
    }

    function updateTrendIndicator(element, trend) { /* ... keep as is ... */ }
    function updateNotificationBadge() { /* ... keep as is ... */ }

    // --- Navigation and Content Loading ---

    function setActive(sectionName, settingsTab = null) {
        console.log(`Setting active section: ${sectionName}` + (settingsTab ? ` / Tab: ${settingsTab}` : ''));
        currentSectionName = sectionName;
        currentSettingsTab = (sectionName === 'settings') ? (settingsTab || currentSettingsTab || 'preferences') : null;

        // --- Permission Check for Settings Tabs ---
        if (sectionName === 'settings') {
            const targetTab = currentSettingsTab;
            // Deny access to restricted tabs based on role
            if (targetTab === 'danger' && currentUser.role !== 'admin') {
                console.warn("Access denied: Only admins can access the Danger Zone.");
                // Fallback to a safe tab or dashboard
                setActive('settings', 'preferences'); // Go to preferences instead
                return;
            }
            if (targetTab === 'team' && currentUser.role !== 'admin' && currentUser.role !== 'supervisor') {
                 console.warn("Access denied: Only admins/supervisors can access Team Management.");
                 setActive('settings', 'preferences'); // Go to preferences instead
                 return;
            }
        }

        // --- Update History State and URL Hash ---
        let hash = `#${sectionName}`;
        if (sectionName === 'settings' && currentSettingsTab) {
            hash += `-${currentSettingsTab}`;
        }
        // Update history only if the hash actually changes to avoid redundant entries
        if (window.location.hash !== hash) {
             // Use replaceState for tab changes within settings to avoid excessive back button history
             if (sectionName === 'settings' && window.location.hash.startsWith('#settings-')) {
                 history.replaceState({ section: sectionName, tab: currentSettingsTab }, '', hash);
             } else {
                 history.pushState({ section: sectionName, tab: currentSettingsTab }, '', hash);
             }
        }


        // --- Update Sidebar/Dropdown Active States ---
        menuButtons.forEach(btn => btn.classList.remove('active'));
        dropdownButtons.forEach(btn => btn.classList.remove('active')); // Assuming dropdown buttons also get an 'active' class

        const activeMenuBtn = document.querySelector(`.sidebar-menu button[data-section="${sectionName}"]`);
        if (activeMenuBtn) activeMenuBtn.classList.add('active');

        const activeDropdownBtn = document.querySelector(`.user-dropdown button[data-section="${sectionName}"]`);
        if (activeDropdownBtn) activeDropdownBtn.classList.add('active');


        // --- Show/Hide Content Sections ---
        contentSections.forEach(section => section.classList.remove('active')); // Hide static sections
        featureSectionsContainer.style.display = 'none'; // Hide dynamic container initially

        if (sectionName === 'dashboard') {
            dashboardContent.classList.add('active');
            updateStats(); // Refresh stats when coming back to dashboard
            loadActivities(); // Refresh activities
        } else if (sectionName === 'profile') {
            profileContent.classList.add('active');
            updateUserUI(); // Ensure profile form has latest data
        } else if (sectionName === 'settings') {
            settingsContent.classList.add('active');
            applyRBAC(); // Apply permissions for settings tabs
            activateSettingsTab(currentSettingsTab); // Show the correct panel
        } else {
            // Handle dynamically loaded sections
            featureSectionsContainer.style.display = 'block'; // Show the container
            loadSection(sectionName); // Load the HTML and JS
        }

        // --- Update Back Button Visibility ---
        backButton.style.display = sectionName !== 'dashboard' ? 'inline-flex' : 'none';

        // --- Scroll to Top ---
        window.scrollTo(0, 0);

        // --- Save Last Active Section ---
        // Avoid saving settings tabs in localStorage if it causes issues on reload
        localStorage.setItem('lastActiveSection', sectionName === 'settings' ? 'settings' : sectionName);
         // Optionally save the tab: localStorage.setItem('lastActiveSettingsTab', currentSettingsTab);
    }

    function loadSection(sectionName) {
        console.log(`Loading section: ${sectionName}`);
        const htmlPath = `sections/${sectionName}.html`;
        const jsPath = `sections/${sectionName}.js`;
        const initFunctionName = sectionsWithJS[sectionName]; // Get the init function name

        // --- Display Loading State ---
        featureSections.innerHTML = ''; // Clear previous content
        featureSections.appendChild(featurePlaceholder);
        featureTitle.textContent = `Loading ${sectionName.replace(/-/g, ' ')}...`;
        featureDescription.textContent = '';
        featureLoadingIndicator.style.display = 'block';
        featureErrorMessage.style.display = 'none';
        featurePlaceholder.style.display = 'flex';
        featureSections.classList.remove('active'); // Ensure it's not marked active until loaded

        // --- Remove Previous Section's Script ---
        if (currentSectionScript && currentSectionScript.parentNode) {
            console.log("Removing previous section script:", currentSectionScript.src);
            currentSectionScript.remove();
            currentSectionScript = null;
        }

        // --- Fetch HTML Content ---
        fetch(htmlPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTML Error: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                console.log(`Loaded HTML for: ${sectionName}`);
                featureSections.innerHTML = html; // Inject the HTML
                featureSections.classList.add('active'); // Mark as active now
                featurePlaceholder.style.display = 'none'; // Hide placeholder on success

                // --- Load and Execute JavaScript (if applicable) ---
                if (initFunctionName) {
                    console.log(`Attempting to load script: ${jsPath}`);
                    const script = document.createElement('script');
                    script.src = jsPath;
                    script.type = 'text/javascript'; // Optional but good practice
                    // Defer execution until script is loaded AND HTML is parsed+rendered
                    // script.defer = true; // Can use defer, or handle in onload

                    script.onload = () => {
                        console.log(`Script loaded: ${jsPath}`);
                        if (typeof window[initFunctionName] === 'function') {
                            try {
                                console.log(`Executing ${initFunctionName}...`);
                                // Pass deep clones of data to prevent accidental modification
                                window[initFunctionName](
                                    JSON.parse(JSON.stringify(currentUser)),
                                    JSON.parse(JSON.stringify(teamMembers))
                                );
                                console.log(`${initFunctionName} executed successfully.`);
                            } catch (err) {
                                console.error(`Error executing ${initFunctionName}:`, err);
                                featureTitle.textContent = `Initialization Error`;
                                featureDescription.textContent = `Content loaded, but script execution failed. Check console. Error: ${err.message}`;
                                featureLoadingIndicator.style.display = 'none';
                                featureErrorMessage.style.display = 'block';
                                featurePlaceholder.style.display = 'flex'; // Show placeholder again on error
                            }
                        } else {
                            console.warn(`Initialization function '${initFunctionName}' not found in ${jsPath}. Content might not be interactive.`);
                            // Optionally show a less severe message if init function is missing
                            featureTitle.textContent = `${sectionName.replace(/-/g, ' ')} Loaded`;
                            featureDescription.textContent = `Content displayed, but its initialization script ('${initFunctionName}') was not found or is not a function.`;
                            featureLoadingIndicator.style.display = 'none';
                            featureErrorMessage.style.display = 'none'; // Don't show error, just info
                            featurePlaceholder.style.display = 'flex';
                        }
                    };

                    script.onerror = (event) => {
                        console.error(`Error loading script: ${jsPath}`, event);
                        featureTitle.textContent = `Script Load Error`;
                        featureDescription.textContent = `Failed to load the required script (${jsPath}). The feature may not work correctly. Check console and network tab.`;
                        featureLoadingIndicator.style.display = 'none';
                        featureErrorMessage.style.display = 'block';
                        featurePlaceholder.style.display = 'flex';
                        if (script.parentNode) script.remove(); // Clean up failed script
                        currentSectionScript = null;
                    };

                    document.body.appendChild(script);
                    currentSectionScript = script; // Store reference to the new script
                } else {
                    console.log(`No specific JS initialization defined for section: ${sectionName}`);
                     featurePlaceholder.style.display = 'none'; // Hide placeholder if no JS needed
                }
            })
            .catch(error => {
                console.error(`Error loading section '${sectionName}' from '${htmlPath}':`, error);
                featureTitle.textContent = `Error Loading ${sectionName.replace(/-/g, ' ')}`;
                featureDescription.textContent = `Could not load content. Please check the file path ('${htmlPath}') and server configuration. Error: ${error.message}`;
                featureLoadingIndicator.style.display = 'none';
                featureErrorMessage.style.display = 'block';
                featurePlaceholder.style.display = 'flex';
                featureSections.classList.add('active'); // Still show the container
            });
    }


    function activateSettingsTab(tabId) { /* ... keep most of your existing activateSettingsTab logic ... */
         // --- Permission Check ---
         if (tabId === 'danger' && currentUser.role !== 'admin') {
             console.warn("Attempted to switch to Danger Zone without admin rights.");
             activateSettingsTab('preferences'); // Fallback
             return;
         }
          if (tabId === 'team' && currentUser.role !== 'admin' && currentUser.role !== 'supervisor') {
             console.warn("Attempted to switch to Team Management without admin/supervisor rights.");
             activateSettingsTab('preferences'); // Fallback
             return;
         }

        currentSettingsTab = tabId;

        // Update Tab UI
        settingsTabs.forEach(t => {
            const isDisabled = t.classList.contains('disabled') || (t.dataset.tab === 'danger' && currentUser.role !== 'admin') || (t.dataset.tab === 'team' && currentUser.role !== 'admin' && currentUser.role !== 'supervisor');
            t.classList.toggle('active', t.dataset.tab === tabId && !isDisabled);
        });

        // Update Panel UI
        settingsPanels.forEach(p => p.classList.toggle('active', p.id === `${tabId}Panel`));

        // Update Hash (using replaceState)
        const hash = `#settings-${tabId}`;
        if (window.location.hash !== hash) {
             history.replaceState({ section: 'settings', tab: tabId }, '', hash);
        }

         // Load data specific to the tab
         if (tabId === 'team') {
             loadTeamMembers();
         } else if (tabId === 'account') {
             // Account data should be fresh from updateUserUI / loadSettingsFormData
             loadSettingsFormData(); // Reload form data for account tab
         } else if (['preferences', 'security', 'notifications'].includes(tabId)) {
             loadSettingsFormData(); // Reload form data for these tabs
         }
    }

    function handleInitialNavigation() {
        const hash = window.location.hash.substring(1);
        let initialSection = 'dashboard';
        let initialTab = null;

        if (hash) {
            if (hash.startsWith('settings-')) {
                initialSection = 'settings';
                initialTab = hash.split('-')[1] || 'preferences';
            } else {
                 // Check if hash corresponds to a known section (sidebar button or profile)
                 const isValidSection = [...menuButtons, ...dropdownButtons].some(btn => btn.dataset.section === hash);
                 if (isValidSection) {
                     initialSection = hash;
                 } else {
                     console.warn(`Invalid section in hash: #${hash}. Loading default.`);
                      // Clear invalid hash
                      history.replaceState(null, '', window.location.pathname + window.location.search);
                 }
            }
        } else {
            // No hash, try localStorage
            const lastSection = localStorage.getItem('lastActiveSection');
            if (lastSection && [...menuButtons, ...dropdownButtons].some(btn => btn.dataset.section === lastSection)) {
                initialSection = lastSection;
                 // Optionally restore last settings tab:
                 // if (initialSection === 'settings') {
                 //     initialTab = localStorage.getItem('lastActiveSettingsTab') || 'preferences';
                 // }
            }
             // else default to 'dashboard'
        }

        console.log(`Initial navigation: Section=${initialSection}, Tab=${initialTab}`);
        setActive(initialSection, initialTab);
    }

    // --- Activity & Notification Functions ---
    function loadActivities(showAll = false) { /* ... keep as is ... */ }
    function loadNotifications() { /* ... keep as is ... */ }
    function getTimeAgo(timestamp) { /* ... keep as is ... */ }
    function updateActivityTimes() { /* ... keep as is ... */ }
    function startActivityTimeUpdater() { /* ... keep as is ... */ }
    function addActivity(icon, message) { /* ... keep as is ... */ }
    function addNotification(icon, message) { /* ... keep as is ... */ }
    function playNotificationSound() { /* ... keep as is ... */ }
    function showSuccessMessage(message) { /* ... keep as is ... */ }
    function markNotificationAsRead(notificationId, itemElement) { /* ... keep as is ... */ }
    function handleMarkAllNotificationsRead() { /* ... keep as is ... */ }
    function handleDeleteNotificationClick(notificationId) { /* ... keep as is ... */ }
    function handleDeleteAllNotifications() { /* ... keep as is ... */ }
    function handleDeleteActivityClick(e) { /* ... keep as is ... */ }
    function handleDeleteAllActivities() { /* ... keep as is ... */ }

    // --- Team Management Functions ---
    function loadTeamMembers() { /* ... keep most of your existing loadTeamMembers logic ... */
         teamList.innerHTML = ''; // Clear existing list
         const canManage = currentUser.role === 'admin' || currentUser.role === 'supervisor';
         const canDelete = currentUser.role === 'admin';

         if (teamMembers.length === 0) {
             teamList.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--gray);">No team members yet. Invite one below.</div>`;
         } else {
             teamMembers.forEach(member => {
                 const memberCard = document.createElement('div');
                 memberCard.className = 'team-member-card';
                 memberCard.dataset.id = member.id;

                 // Determine permissions for *this specific member*
                 const isSelf = member.id === currentUser.id;
                 const memberIsAdmin = member.role === 'admin';
                 const memberIsSupervisor = member.role === 'supervisor';

                 let canEditThisMember = false;
                 if (isAdmin) { // Admins can edit anyone except themselves (role/email maybe restricted)
                      canEditThisMember = !isSelf;
                 } else if (isSupervisor) { // Supervisors can edit members and seniors, but not admins or other supervisors or self
                     canEditThisMember = !isSelf && !memberIsAdmin && !memberIsSupervisor;
                 }

                 const canDeleteThisMember = isAdmin && !isSelf; // Only admins can delete, and not themselves

                 let avatarContent = member.initials || (member.name ? member.name.split(' ').map(n=>n[0]).join('') : member.email.substring(0, 2)).toUpperCase();
                 let avatarStyle = '';
                 if (member.avatar) {
                     avatarStyle = `background-image: url(${member.avatar});`;
                     avatarContent = '';
                 }

                 const roleDisplayName = (member.role || 'member').charAt(0).toUpperCase() + (member.role || 'member').slice(1);

                 memberCard.innerHTML = `
                     <div class="member-avatar" style="${avatarStyle}">${avatarContent}</div>
                     <div class="member-details">
                         <div class="member-name">${member.name || 'Unnamed Member'}</div>
                         <div class="member-email">${member.email}</div>
                     </div>
                     <div class="member-role role-${member.role || 'member'}">
                         ${roleDisplayName}
                     </div>
                     <div class="member-actions">
                         ${canEditThisMember ? `<button class="btn btn-outline btn-sm edit-member" title="Edit Member"><i class="fas fa-edit"></i></button>` : ''}
                         ${canDeleteThisMember ? `<button class="btn btn-danger btn-sm delete-member" title="Delete Member"><i class="fas fa-trash"></i></button>` : ''}
                     </div>
                 `;
                 teamList.appendChild(memberCard);
             });

             // Add event listeners after elements are in the DOM
             teamList.querySelectorAll('.edit-member').forEach(btn => btn.addEventListener('click', handleEditMemberClick));
             teamList.querySelectorAll('.delete-member').forEach(btn => btn.addEventListener('click', handleDeleteMemberClick));
         }
         updateStats(); // Update dashboard stats after team members are loaded/updated
    }
    function handleInviteMember(e) { /* ... keep as is, ensuring role checks are correct ... */ }
    function handleEditMemberClick(e) { /* ... keep as is, ensuring role change logic respects applyRBAC rules ... */ }
    function handleDeleteMemberClick(e) { /* ... keep as is ... */ }


    // --- Form Handling & Modals ---
    function showConfirmModal(config) { /* ... keep as is ... */ }
    function hideConfirmModal() { /* ... keep as is ... */ }
    function handleProfileSave(e) { /* ... keep as is ... */ }
    function handleProfileCancel() { /* ... keep as is ... */ }
    function handleSettingsSave(formId, panelId, successMsg) { /* ... keep as is, ensure password validation logic is sound ... */ }
    function handleSettingsCancel(panelId) { /* ... keep as is ... */ }
    function handleAvatarUpload(e) { /* ... keep as is ... */ }
    function handleLogout() { /* ... keep as is ... */ }

    // --- Search Functionality ---
    function handleSearch() { /* ... keep as is ... */ }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
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
                 userDropdown.classList.remove('active'); // Close dropdown
                 setActive(button.dataset.section);
             });
         });


        // Back Button
        backButton.addEventListener('click', () => {
             // Go back to the previous logical section, or dashboard if history is unavailable/complex
             // A simple implementation: always go to dashboard
             setActive('dashboard');
             // Or use history.back() if you pushed states correctly
             // window.history.back();
         });

        // Browser Back/Forward (Popstate)
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.section) {
                console.log("Popstate triggered:", event.state);
                // Prevent recursive setActive calls if popstate was triggered by setActive itself
                if (currentSectionName !== event.state.section || currentSettingsTab !== event.state.tab) {
                     setActive(event.state.section, event.state.tab);
                 }
            } else {
                // If no state, might be initial load or manual hash change - handle appropriately
                handleInitialNavigation();
            }
        });

        // Search
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('focus', handleSearch);
        document.addEventListener('click', (e) => { // Close search results on outside click
            if (!e.target.closest('.search-bar')) {
                searchResults.classList.remove('active');
                // searchResults.innerHTML = ''; // Optional: clear results on close
            }
        });

        // User Dropdown
        userAvatar.addEventListener('click', (e) => {e.stopPropagation(); userDropdown.classList.toggle('active'); });
        userProfileDetails.addEventListener('click', (e) => {e.stopPropagation(); userDropdown.classList.toggle('active'); });
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            userDropdown.classList.remove('active');
            handleLogout();
        });
        document.addEventListener('click', (e) => { // Close dropdown on outside click
            if (!e.target.closest('.user-profile')) {
                userDropdown.classList.remove('active');
            }
        });

        // Notifications Modal
        notificationIcon.addEventListener('click', () => {
            notificationsModal.style.display = 'flex';
            loadNotifications(); // Refresh notifications when opening
        });
        closeNotifications.addEventListener('click', () => notificationsModal.style.display = 'none');
        notificationsModal.addEventListener('click', (e) => { // Close on overlay click
            if (e.target === notificationsModal) {
                notificationsModal.style.display = 'none';
            }
        });
        markAllReadBtn.addEventListener('click', handleMarkAllNotificationsRead);
        deleteAllNotificationsBtn.addEventListener('click', handleDeleteAllNotifications);

        // Dashboard Activity Actions
        viewAllActivity.addEventListener('click', () => loadActivities(true));
        deleteAllActivity.addEventListener('click', handleDeleteAllActivities);

        // Profile Form
        profileForm.addEventListener('submit', handleProfileSave);
        cancelProfileBtn.addEventListener('click', handleProfileCancel);
        uploadPhotoButton.addEventListener('click', () => profileAvatarInput.click());
        profileAvatarInput.addEventListener('change', handleAvatarUpload);

        // Settings Tabs
        settingsTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                if (!tab.classList.contains('disabled')) { // Respect disabled state
                    activateSettingsTab(tab.dataset.tab);
                }
            });
        });

        // Settings Forms
        preferencesForm.addEventListener('submit', (e) => { e.preventDefault(); handleSettingsSave('preferencesForm', 'preferencesPanel', 'Preferences saved.'); });
        cancelPreferencesBtn.addEventListener('click', () => handleSettingsCancel('preferencesPanel'));

        accountForm.addEventListener('submit', (e) => { e.preventDefault(); handleSettingsSave('accountForm', 'accountPanel', 'Account settings saved.'); });
        cancelAccountBtn.addEventListener('click', () => handleSettingsCancel('accountPanel'));

        securityForm.addEventListener('submit', (e) => { e.preventDefault(); handleSettingsSave('securityForm', 'securityPanel', 'Security settings updated.'); });
        cancelSecurityBtn.addEventListener('click', () => handleSettingsCancel('securityPanel'));

        notificationsForm.addEventListener('submit', (e) => { e.preventDefault(); handleSettingsSave('notificationsForm', 'notificationsPanel', 'Notification settings saved.'); });
        cancelNotificationsBtn.addEventListener('click', () => handleSettingsCancel('notificationsPanel'));

        // Theme and Density Changers
        themeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const theme = this.dataset.theme;
                document.getElementById('selectedTheme').value = theme; // Update hidden input if needed
                themeOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                // Update body class
                document.body.className = ''; // Clear existing theme/density
                document.body.classList.add(`${theme}-theme`);
                document.body.classList.add(layoutDensitySelect.value || 'normal');
                currentUser.preferences.theme = theme; // Update state
                // applyRBAC(); // Reapply RBAC if theme affects visibility (unlikely but possible)
                 // Note: No need to call saveData here unless you want instant save on theme change
            });
        });

        layoutDensitySelect.addEventListener('change', function() {
            const density = this.value;
            const currentTheme = currentUser.preferences.theme || 'blue';
             // Update body class
            document.body.className = ''; // Clear existing theme/density
            document.body.classList.add(`${currentTheme}-theme`);
            document.body.classList.add(density);
            currentUser.preferences.layoutDensity = density; // Update state
            // applyRBAC(); // Reapply RBAC if density affects visibility (unlikely but possible)
             // Note: No need to call saveData here unless you want instant save on density change
        });

        // Team Invitation Form
        inviteMemberForm.addEventListener('submit', handleInviteMember);

        // Confirm Modal Actions
        confirmBtn.addEventListener('click', () => { if (confirmCallback) confirmCallback(); });
        cancelConfirmBtn.addEventListener('click', () => { if (cancelCallback) cancelCallback(); hideConfirmModal(); });
        confirmModal.addEventListener('click', (e) => { // Close on overlay click
            if (e.target === confirmModal) {
                hideConfirmModal();
                if(cancelCallback) cancelCallback(); // Trigger cancel callback on overlay click too
            }
        });
        document.addEventListener('keydown', (e) => { // Close on Escape key
            if (e.key === 'Escape' && confirmModal.style.display === 'flex') {
                hideConfirmModal();
                if(cancelCallback) cancelCallback(); // Trigger cancel callback on escape
            }
        });

        console.log("Event listeners set up.");
    }


    // --- Start the Application ---
    initializeDashboard();

}); // End DOMContentLoaded
```
