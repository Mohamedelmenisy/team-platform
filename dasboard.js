// dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed"); // Verify DOMContentLoaded fires

    // --- DOM Elements (Ensure these IDs/Selectors match your HTML) ---
    const sidebar = document.getElementById('sidebar');
    const menuButtons = document.querySelectorAll('.sidebar-menu button[data-section]');
    const userDropdown = document.getElementById('userDropdown');
    const dropdownButtons = document.querySelectorAll('.user-dropdown button[data-section]');
    const contentSections = document.querySelectorAll('.content-area > .content-section');
    const featureSectionsContainer = document.getElementById('featureSectionsContainer');
    const featureSections = document.getElementById('featureSections');
    const featurePlaceholder = document.getElementById('featurePlaceholder'); // Needed for loadSection
    const featureTitle = document.getElementById('featureTitle'); // Needed for loadSection
    const featureDescription = document.getElementById('featureDescription'); // Needed for loadSection
    const featureLoadingIndicator = featurePlaceholder?.querySelector('.loading-indicator'); // Optional chaining
    const featureErrorMessage = featurePlaceholder?.querySelector('.error-message'); // Optional chaining
    const backButton = document.getElementById('backButton');
    const dashboardContent = document.getElementById('dashboardContent');
    const profileContent = document.getElementById('profileContent');
    const settingsContent = document.getElementById('settingsContent');
    const settingsTabs = document.querySelectorAll('.settings-tab'); // For settings navigation
    const settingsPanels = document.querySelectorAll('.settings-panel'); // For settings navigation

    // --- State Variables ---
    let currentUser = {}; // Populate this in loadData
    let teamMembers = []; // Populate this in loadData
    let activities = []; // Populate this in loadData
    let notifications = []; // Populate this in loadData
    let currentSectionName = 'dashboard';
    let currentSettingsTab = null; // Track active settings tab
    let currentSectionScript = null; // Track dynamic script

    // Define known sections that have dedicated JS files and initialization functions
    const sectionsWithJS = {
        'employee-scheduling': 'initializeEmployeeSchedule',
        // Add other sections here: 'task-management': 'initializeTasks', etc.
    };

    // --- MOCK Functions (Replace with your actual data loading etc.) ---
    function loadData() { console.log("Mock loadData called"); currentUser = { role: 'admin', name: 'Test User', email: 'test@example.com', preferences: { theme: 'blue', layoutDensity: 'normal' } }; /* Load real data here */ }
    function updateUserUI() { console.log("Mock updateUserUI called"); }
    function loadTeamMembers() { console.log("Mock loadTeamMembers called"); }
    function loadActivities() { console.log("Mock loadActivities called"); }
    function loadNotifications() { console.log("Mock loadNotifications called"); }
    function updateStats() { console.log("Mock updateStats called"); }
    function applyUserPreferences() { console.log("Mock applyUserPreferences called"); }
    function applyRBAC() { console.log("Mock applyRBAC called"); }
    function loadSettingsFormData() { console.log("Mock loadSettingsFormData called"); }
    function handleLogout() { console.log("Logout clicked"); alert("Logout functionality placeholder"); }
    function startActivityTimeUpdater() { console.log("Mock startActivityTimeUpdater called");}
    function handleSearch() { console.log("Search input changed"); }
    // Add other mock functions as needed based on errors in console

    // --- Core Navigation Logic ---

    function setActive(sectionName, settingsTab = null) {
        console.log(`--- setActive called with: section=${sectionName}, tab=${settingsTab} ---`);

        // **1. Update State**
        currentSectionName = sectionName;
        currentSettingsTab = (sectionName === 'settings') ? (settingsTab || currentSettingsTab || 'preferences') : null;

        // **2. Permissions Check (Example for settings)**
        if (sectionName === 'settings') {
            const targetTab = currentSettingsTab;
            if (targetTab === 'danger' && currentUser.role !== 'admin') {
                console.warn("Access denied: Danger Zone");
                setActive('settings', 'preferences'); // Redirect
                return;
            }
            // Add other permission checks if needed
        }

        // **3. Update URL Hash and Browser History**
        let hash = `#${sectionName}`;
        if (sectionName === 'settings' && currentSettingsTab) {
            hash += `-${currentSettingsTab}`;
        }
        console.log(`Target hash: ${hash}, Current hash: ${window.location.hash}`);

        // Only push/replace if the hash is actually different
        if (window.location.hash !== hash) {
            try {
                 // Use replaceState for internal tab changes within settings to avoid messy history
                 if (sectionName === 'settings' && window.location.hash.startsWith('#settings-')) {
                    console.log(`Replacing state: section=${sectionName}, tab=${currentSettingsTab}`);
                    history.replaceState({ section: sectionName, tab: currentSettingsTab }, '', hash);
                 } else {
                    console.log(`Pushing state: section=${sectionName}, tab=${currentSettingsTab}`);
                    history.pushState({ section: sectionName, tab: currentSettingsTab }, '', hash);
                 }
                 console.log(`Hash updated to: ${window.location.hash}`);
            } catch (error) {
                 console.error("Error updating history state:", error);
            }

        } else {
            console.log("Hash is already correct, not updating history.");
        }

        // **4. Update Active Class on Navigation Buttons**
        console.log("Updating active classes...");
        // Remove active from all sidebar buttons
        menuButtons.forEach(btn => btn.classList.remove('active'));
        // Remove active from all dropdown buttons
        dropdownButtons.forEach(btn => btn.classList.remove('active'));

        // Add active to the correct sidebar button
        const activeMenuBtn = document.querySelector(`.sidebar-menu button[data-section="${sectionName}"]`);
        if (activeMenuBtn) {
            activeMenuBtn.classList.add('active');
            console.log(`Activated sidebar button: ${sectionName}`);
        } else {
            console.warn(`Sidebar button not found for section: ${sectionName}`);
        }

        // Add active to the correct dropdown button (Profile/Settings)
        const activeDropdownBtn = document.querySelector(`.user-dropdown button[data-section="${sectionName}"]`);
        if (activeDropdownBtn) {
            activeDropdownBtn.classList.add('active');
            console.log(`Activated dropdown button: ${sectionName}`);
        }
         // No warning needed if not found in dropdown, as most sections are only in sidebar

        // **5. Switch Visible Content**
        console.log("Switching content visibility...");
        // Hide all static sections first
        contentSections.forEach(section => section.classList.remove('active'));
        // Hide the dynamic section container
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
            activateSettingsTab(currentSettingsTab); // Activate the correct sub-tab/panel
        } else {
            // Handle dynamically loaded sections
            console.log(`Loading dynamic section: ${sectionName}`);
            if (featureSectionsContainer) {
                 featureSectionsContainer.style.display = 'block'; // Show the container
                 loadSection(sectionName); // Call the function to fetch HTML/JS
            } else {
                console.error("#featureSectionsContainer not found!");
            }
        }

        // **6. Update Back Button**
        if (backButton) {
             backButton.style.display = sectionName !== 'dashboard' ? 'inline-flex' : 'none';
        } else {
             console.warn("#backButton not found");
        }


        // **7. Scroll to Top**
        window.scrollTo(0, 0);

        // **8. Save Last Active Section (Optional but useful)**
        // Avoid saving settings tabs here if it complicates initial load
        localStorage.setItem('lastActiveSection', sectionName === 'settings' ? 'settings' : sectionName);
        console.log(`Saved lastActiveSection: ${localStorage.getItem('lastActiveSection')}`);
    }

    function loadSection(sectionName) {
        console.log(`--- loadSection called for: ${sectionName} ---`);
        const htmlPath = `sections/${sectionName}.html`;
        const jsPath = `sections/${sectionName}.js`;
        const initFunctionName = sectionsWithJS[sectionName];

        // --- Display Loading State ---
        if (!featureSections || !featurePlaceholder || !featureTitle || !featureDescription || !featureLoadingIndicator || !featureErrorMessage) {
            console.error("One or more elements required for loadSection are missing!");
            return;
        }
        featureSections.innerHTML = ''; // Clear previous content
        featureSections.appendChild(featurePlaceholder);
        featureTitle.textContent = `Loading ${sectionName.replace(/-/g, ' ')}...`;
        featureDescription.textContent = '';
        featureLoadingIndicator.style.display = 'block';
        featureErrorMessage.style.display = 'none';
        featurePlaceholder.style.display = 'flex';
        featureSections.classList.remove('active');

        // --- Remove Previous Section's Script ---
        if (currentSectionScript && currentSectionScript.parentNode) {
            console.log("Removing previous script:", currentSectionScript.src);
            currentSectionScript.remove();
            currentSectionScript = null;
        } else {
            console.log("No previous script to remove.");
        }

        // --- Fetch HTML ---
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
                featureSections.innerHTML = html;
                featureSections.classList.add('active');
                featurePlaceholder.style.display = 'none'; // Hide placeholder

                // --- Load JS (if applicable) ---
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
                                // Pass deep clones of data
                                window[initFunctionName](
                                    JSON.parse(JSON.stringify(currentUser || {})), // Provide default empty object
                                    JSON.parse(JSON.stringify(teamMembers || [])) // Provide default empty array
                                );
                                console.log(`${initFunctionName} execution successful.`);
                            } catch (err) {
                                console.error(`Error executing ${initFunctionName}:`, err);
                                featureErrorMessage.textContent = `Script execution failed: ${err.message}. Check console.`;
                                featureErrorMessage.style.display = 'block';
                                featurePlaceholder.style.display = 'flex';
                            }
                        } else {
                            console.warn(`Initialization function '${initFunctionName}' NOT FOUND in window after loading ${jsPath}.`);
                            featureDescription.textContent = `Content loaded, but interaction script ('${initFunctionName}') missing.`;
                             featurePlaceholder.style.display = 'flex'; // Show info placeholder
                        }
                    };
                    script.onerror = (event) => {
                        console.error(`Error loading script: ${jsPath}`, event);
                        featureTitle.textContent = `Script Load Error`;
                        featureDescription.textContent = `Failed to load ${jsPath}. Check console and network tab.`;
                        featureLoadingIndicator.style.display = 'none';
                        featureErrorMessage.style.display = 'block';
                        featurePlaceholder.style.display = 'flex';
                        if (script.parentNode) script.remove();
                        currentSectionScript = null;
                    };
                    document.body.appendChild(script);
                    currentSectionScript = script;
                } else {
                    console.log(`No specific JS needed for section: ${sectionName}`);
                }
            })
            .catch(error => {
                console.error(`Failed to load section '${sectionName}':`, error);
                featureTitle.textContent = `Error Loading ${sectionName.replace(/-/g, ' ')}`;
                featureDescription.textContent = `Could not load content from ${htmlPath}. ${error.message}`;
                featureLoadingIndicator.style.display = 'none';
                featureErrorMessage.style.display = 'block';
                featurePlaceholder.style.display = 'flex';
                featureSections.classList.add('active');
            });
    }

    function activateSettingsTab(tabId) {
        console.log(`Activating settings tab: ${tabId}`);
         if (!tabId) {
             console.warn("activateSettingsTab called with null/undefined tabId, defaulting to 'preferences'");
             tabId = 'preferences';
         }
        currentSettingsTab = tabId;

        settingsTabs.forEach(t => {
            t.classList.remove('active');
            if (t.dataset.tab === tabId) {
                t.classList.add('active');
            }
        });
        settingsPanels.forEach(p => p.classList.toggle('active', p.id === `${tabId}Panel`));

        // Update Hash (using replaceState)
        const hash = `#settings-${tabId}`;
         if (window.location.hash !== hash) {
             console.log(`Replacing state for settings tab: section=settings, tab=${tabId}`);
             history.replaceState({ section: 'settings', tab: tabId }, '', hash);
         }

         if (tabId === 'team') loadTeamMembers();
         else if (tabId === 'account') updateUserUI(); // Ensure latest data shown
         else if (['preferences', 'security', 'notifications'].includes(tabId)) loadSettingsFormData();
    }

    function handleInitialNavigation() {
        console.log("--- handleInitialNavigation ---");
        const hash = window.location.hash.substring(1);
        console.log(`Initial hash found: "${hash}"`);
        let initialSection = 'dashboard';
        let initialTab = null;

        if (hash) {
            if (hash.startsWith('settings-')) {
                initialSection = 'settings';
                initialTab = hash.split('-')[1] || 'preferences';
                console.log(`Parsed hash as settings section, tab: ${initialTab}`);
            } else {
                const isValidSection = [...menuButtons, ...dropdownButtons].some(btn => btn.dataset.section === hash);
                if (isValidSection) {
                    initialSection = hash;
                    console.log(`Parsed hash as standard section: ${initialSection}`);
                } else {
                    console.warn(`Invalid section in hash: #${hash}. Loading default.`);
                    // Optionally clear the invalid hash
                    history.replaceState(null, '', window.location.pathname + window.location.search);
                }
            }
        } else {
            // No hash, try localStorage
            const lastSection = localStorage.getItem('lastActiveSection');
            console.log(`No hash, checking localStorage. Found: ${lastSection}`);
            if (lastSection && [...menuButtons, ...dropdownButtons].some(btn => btn.dataset.section === lastSection)) {
                initialSection = lastSection;
                // Optionally restore last settings tab if needed
                // if (initialSection === 'settings') initialTab = localStorage.getItem('lastActiveSettingsTab') || 'preferences';
            } else {
                 console.log("No valid section in localStorage, defaulting to dashboard.");
            }
        }
        console.log(`Final initial navigation target: Section=${initialSection}, Tab=${initialTab}`);
        setActive(initialSection, initialTab);
    }

    // --- Event Listener Setup ---
    function setupEventListeners() {
        console.log("--- setupEventListeners ---");

        // Sidebar Navigation
        console.log(`Found ${menuButtons.length} sidebar menu buttons.`);
        menuButtons.forEach(button => {
            const section = button.dataset.section;
            console.log(`Attaching listener to sidebar button for section: ${section}`);
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Good practice for buttons
                console.log(`Sidebar button clicked: ${section}`);
                setActive(section);
            });
        });

        // Dropdown Navigation
        console.log(`Found ${dropdownButtons.length} dropdown menu buttons.`);
         dropdownButtons.forEach(button => {
             const section = button.dataset.section;
             console.log(`Attaching listener to dropdown button for section: ${section}`);
             button.addEventListener('click', (e) => {
                 e.preventDefault();
                 if(userDropdown) userDropdown.classList.remove('active'); // Close dropdown
                 console.log(`Dropdown button clicked: ${section}`);
                 setActive(section);
             });
         });


        // Back Button
        if (backButton) {
             console.log("Attaching listener to back button.");
             backButton.addEventListener('click', () => {
                 console.log("Back button clicked.");
                 // Option 1: Simple go to dashboard
                 setActive('dashboard');
                 // Option 2: Use browser history (might be complex if states weren't pushed perfectly)
                 // window.history.back();
             });
        } else {
            console.warn("Back button not found, listener not attached.");
        }


        // Browser Back/Forward (Popstate)
        console.log("Attaching popstate listener.");
        window.addEventListener('popstate', (event) => {
            console.log("--- popstate event triggered ---", event.state);
            // event.state should contain { section: '...', tab: '...' } if pushed correctly
            if (event.state && event.state.section) {
                 // Check if the state actually changed to avoid infinite loops if state management is tricky
                 // A simple check is often sufficient here if setActive handles idempotent calls well
                 // if (currentSectionName !== event.state.section || currentSettingsTab !== event.state.tab) {
                    console.log(`Popstate: Navigating to section=${event.state.section}, tab=${event.state.tab}`);
                    setActive(event.state.section, event.state.tab);
                 // } else {
                 //    console.log("Popstate: State matches current view, ignoring.");
                 //}
            } else {
                // Handle cases where state is null (e.g., initial load, manual hash change without state)
                console.log("Popstate: event.state is null or missing 'section'. Re-evaluating navigation.");
                handleInitialNavigation(); // Re-run initial nav logic based on current hash
            }
        });

        // --- Other listeners (Search, User Dropdown, Modals, Forms, etc.) ---
        // Keep your other event listeners here (search, user profile, notifications, settings forms...)
         if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                if(userDropdown) userDropdown.classList.remove('active');
                handleLogout();
            });
         }
         // ... (add stubs or full implementations for other listeners)
         console.log("Other event listeners attached (placeholders/full implementation).");

    } // End setupEventListeners

    // --- Initialization ---
    function initializeApp() {
        console.log("--- Initializing App ---");
        loadData();
        updateUserUI();
        loadTeamMembers(); // Load team members early if needed for search etc.
        loadActivities();
        loadNotifications();
        updateStats();
        applyUserPreferences();
        applyRBAC();
        setupEventListeners(); // Setup listeners BEFORE initial navigation
        handleInitialNavigation(); // Determine and load the first view
        startActivityTimeUpdater();
        console.log("--- Dashboard Initialized ---");
    }

    // --- Start the Application ---
    initializeApp();

}); // End DOMContentLoaded
