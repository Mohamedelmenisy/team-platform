--- START OF FILE dashboardjs.txt ---

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
    // --- logoutLink definition (ensure it exists in your HTML or handle null) ---
    const logoutLink = document.getElementById('logoutLink');


    // --- State Variables ---
    let currentUser = {}; // Populate this in loadData
    let teamMembers = []; // Populate this in loadData
    let activities = []; // Populate this in loadData
    let notifications = []; // Populate this in loadData
    let currentSectionName = 'dashboard';
    let currentSettingsTab = null; // Track active settings tab
    let currentSectionScript = null; // Track dynamic script

    // --- ★★★ خريطة لربط اسم القسم باسم دالة التهيئة الخاصة به ★★★ ---
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
        // ...(Permission checks as before)...

        // **3. Update URL Hash and Browser History**
        // ...(URL Hash update logic as before)...

        // **4. Update Active Class on Navigation Buttons**
        // ...(Active class update logic as before)...

        // **5. Switch Visible Content**
        console.log("Switching content visibility...");
        // Hide all static sections first
        contentSections.forEach(section => section.classList.remove('active'));
        // Hide the dynamic section container
        if(featureSectionsContainer) featureSectionsContainer.style.display = 'none';

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
            // --- ★★★ Handle dynamically loaded sections ★★★ ---
            console.log(`Loading dynamic section: ${sectionName}`);
            if (featureSectionsContainer) {
                 featureSectionsContainer.style.display = 'block'; // Show the container
                 // --- ★★★ استدعاء دالة تحميل القسم ★★★ ---
                 loadSection(sectionName);
            } else {
                console.error("#featureSectionsContainer not found!");
            }
        }

        // **6. Update Back Button**
        // ...(Back button logic as before)...

        // **7. Scroll to Top**
        window.scrollTo(0, 0);

        // **8. Save Last Active Section (Optional but useful)**
        // ...(Save state logic as before)...
    }

    // --- ★★★ دالة تحميل القسم الديناميكي (التركيز هنا) ★★★ ---
    function loadSection(sectionName) {
        console.log(`--- loadSection called for: ${sectionName} ---`);
        const htmlPath = `sections/${sectionName}.html`;
        const jsPath = `sections/${sectionName}.js`;
        const initFunctionName = sectionsWithJS[sectionName]; // اسم دالة التهيئة من الخريطة

        // --- Display Loading State ---
        if (!featureSections || !featurePlaceholder || !featureTitle || !featureDescription || !featureLoadingIndicator || !featureErrorMessage) {
            console.error("One or more elements required for loadSection are missing!");
             if(featureSections) featureSections.innerHTML = '<p style="color:red; padding:1rem;">Error: UI elements for loading missing.</p>';
            return;
        }
        featureSections.innerHTML = ''; // Clear previous content
        featureSections.appendChild(featurePlaceholder);
        featureTitle.textContent = `Loading ${sectionName.replace(/-/g, ' ')}...`;
        featureDescription.textContent = '';
        featureLoadingIndicator.style.display = 'block';
        featureErrorMessage.style.display = 'none';
        featurePlaceholder.style.display = 'flex';
        featureSections.classList.remove('active'); // Ensure it's not active until content loads

        // --- Remove Previous Section's Script ---
        if (currentSectionScript && currentSectionScript.parentNode) {
            console.log("Removing previous script:", currentSectionScript.src);
            currentSectionScript.remove();
            currentSectionScript = null;
        } else {
            console.log("No previous script to remove.");
        }

        // --- ★★★ الخطوة 1️⃣: تحميل HTML ★★★ ---
        console.log(`1️⃣ Fetching HTML: ${htmlPath}`);
        fetch(htmlPath)
            .then(response => {
                console.log(`   Fetch status for ${htmlPath}: ${response.status}`);
                if (!response.ok) {
                    throw new Error(`HTML Load Error: ${response.status} ${response.statusText} for ${htmlPath}`);
                }
                return response.text();
            })
            .then(html => {
                console.log(`   HTML loaded successfully for ${sectionName}`);
                 // --- ★★★ الخطوة 1️⃣ (تكملة): إدخال HTML في الصفحة ★★★ ---
                featureSections.innerHTML = html; // <--- حقن الـ HTML
                featureSections.classList.add('active'); // إظهار المحتوى بعد الحقن
                featurePlaceholder.style.display = 'none'; // Hide placeholder
                console.log(`   HTML injected and section container set to active.`);

                // --- ★★★ الخطوة 2️⃣: تحميل JavaScript (إذا كان معرفاً له دالة تهيئة) ★★★ ---
                if (initFunctionName) {
                    console.log(`2️⃣ Loading JS: ${jsPath}`);
                    const script = document.createElement('script');
                    script.src = jsPath;
                    script.type = 'text/javascript';

                    // --- ★★★ الخطوة 3️⃣: تنفيذ دالة التهيئة (Initialize) بعد تحميل السكربت ★★★ ---
                    script.onload = () => {
                        console.log(`   ✅ Script loaded: ${jsPath}`);
                        console.log(`   3️⃣ Executing init function: window['${initFunctionName}']`);
                        if (typeof window[initFunctionName] === 'function') {
                            try {
                                // ----- ✨✨ الاستدعاء الفعلي لدالة التهيئة ✨✨ -----
                                window[initFunctionName](
                                    JSON.parse(JSON.stringify(currentUser || {})),
                                    JSON.parse(JSON.stringify(teamMembers || []))
                                );
                                console.log(`      🚀 SUCCESS: ${initFunctionName} executed.`);
                            } catch (err) {
                                console.error(`      ❌ ERROR executing ${initFunctionName}:`, err);
                                featureErrorMessage.textContent = `Script execution failed: ${err.message}. Check console.`;
                                featureErrorMessage.style.display = 'block';
                                featurePlaceholder.style.display = 'flex'; // Show placeholder with error
                                featureSections.innerHTML = ''; // Clear potentially broken HTML
                                featureSections.appendChild(featurePlaceholder);
                            }
                        } else {
                            console.warn(`      ❌ Initialization function '${initFunctionName}' NOT FOUND in window after loading ${jsPath}.`);
                            featureDescription.textContent = `Content loaded, but interaction script ('${initFunctionName}') missing.`;
                            featurePlaceholder.style.display = 'flex'; // Show info placeholder
                        }
                    }; // --- نهاية script.onload ---

                    // معالجة خطأ تحميل السكربت نفسه
                    script.onerror = (event) => {
                        console.error(`   ❌ Error loading script: ${jsPath}`, event);
                        featureTitle.textContent = `Script Load Error`;
                        featureDescription.textContent = `Failed to load ${jsPath}. Check console and network tab.`;
                        featureLoadingIndicator.style.display = 'none';
                        featureErrorMessage.style.display = 'block';
                        featurePlaceholder.style.display = 'flex'; // Show placeholder with error
                         featureSections.innerHTML = ''; // Clear potentially broken HTML
                         featureSections.appendChild(featurePlaceholder);
                        if (script.parentNode) script.remove(); // Clean up failed script tag
                        currentSectionScript = null;
                    };

                    // --- ★★★ الخطوة 2️⃣ (تكملة): إضافة عنصر السكربت للصفحة لبدء التحميل ★★★ ---
                    document.body.appendChild(script);
                    currentSectionScript = script; // تخزين مرجع للسكربت الحالي
                    console.log(`   Script element for ${jsPath} appended to body.`);

                } else {
                    console.log(`   No specific JS needed for section: ${sectionName}`);
                     // If HTML loaded fine but no JS needed, ensure placeholder is hidden
                     featurePlaceholder.style.display = 'none';
                }
            })
            .catch(error => { // معالجة خطأ تحميل HTML أو الأخطاء اللاحقة في then()
                console.error(`--- ❌ Failed to load section '${sectionName}':`, error);
                featureTitle.textContent = `Error Loading ${sectionName.replace(/-/g, ' ')}`;
                featureDescription.textContent = `Could not load content. ${error.message}`;
                featureLoadingIndicator.style.display = 'none';
                featureErrorMessage.style.display = 'block';
                featurePlaceholder.style.display = 'flex'; // Show placeholder with error
                featureSections.innerHTML = ''; // Ensure container is clean
                featureSections.appendChild(featurePlaceholder); // Add placeholder back
                featureSections.classList.add('active'); // Make the error visible
            });
    } // --- نهاية loadSection ---


    function activateSettingsTab(tabId) {
        // ...(Settings tab activation logic as before)...
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

          // Load data relevant to the specific settings tab
          if (tabId === 'team') loadTeamMembers();
          else if (tabId === 'account') updateUserUI(); // Ensure latest data shown
          else if (['preferences', 'security', 'notifications'].includes(tabId)) loadSettingsFormData();
    }

    function handleInitialNavigation() {
        // ...(Initial navigation logic based on hash/localStorage as before)...
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
                 // Check if hash corresponds to a known section (sidebar or dropdown)
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
             // Check if the stored section is valid
              if (lastSection && [...menuButtons, ...dropdownButtons].some(btn => btn.dataset.section === lastSection)) {
                 initialSection = lastSection;
                 // Restore last settings tab only if the section is 'settings'
                 if (initialSection === 'settings') {
                     // You might want to store the last settings tab separately in localStorage too
                     // initialTab = localStorage.getItem('lastActiveSettingsTab') || 'preferences';
                     initialTab = 'preferences'; // Default to preferences tab for simplicity now
                 }
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
            // console.log(`Attaching listener to sidebar button for section: ${section}`);
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Good practice for buttons
                console.log(`Sidebar button clicked: ${section}`);
                setActive(section); // Call navigation function
            });
        });

        // Dropdown Navigation
        console.log(`Found ${dropdownButtons.length} dropdown menu buttons.`);
         dropdownButtons.forEach(button => {
             const section = button.dataset.section;
             // console.log(`Attaching listener to dropdown button for section: ${section}`);
             button.addEventListener('click', (e) => {
                 e.preventDefault();
                 if(userDropdown) userDropdown.classList.remove('active'); // Close dropdown
                 console.log(`Dropdown button clicked: ${section}`);
                 setActive(section); // Call navigation function
             });
         });


        // Back Button
        if (backButton) {
             console.log("Attaching listener to back button.");
             backButton.addEventListener('click', () => {
                 console.log("Back button clicked.");
                 setActive('dashboard'); // Navigate back to dashboard
             });
        } else {
            console.warn("Back button not found, listener not attached.");
        }

        // Browser Back/Forward (Popstate)
        console.log("Attaching popstate listener.");
        window.addEventListener('popstate', (event) => {
            console.log("--- popstate event triggered ---", event.state);
            if (event.state && event.state.section) {
                console.log(`Popstate: Navigating via history state to section=${event.state.section}, tab=${event.state.tab}`);
                // Re-call setActive with the state from history.
                // setActive handles making the correct section/tab visible.
                setActive(event.state.section, event.state.tab);
            } else {
                // If state is null or invalid, fallback to initial navigation logic
                console.log("Popstate: event.state is missing or invalid. Re-evaluating navigation based on current hash.");
                handleInitialNavigation();
            }
        });

        // --- Other listeners (Search, User Dropdown toggle, Modals, Forms, etc.) ---
         if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                if(userDropdown) userDropdown.classList.remove('active');
                handleLogout();
            });
         } else {
             console.warn("Logout link not found.");
         }
         // Add other listeners for search, user profile toggle, etc. here
         console.log("Other event listeners attached (placeholders/full implementation).");

          // Example: User profile toggle
         const userProfileDetails = document.querySelector('.user-profile-details');
         if (userProfileDetails && userDropdown) {
             userProfileDetails.addEventListener('click', () => {
                 userDropdown.classList.toggle('active');
             });
             // Close dropdown if clicking outside
             document.addEventListener('click', (event) => {
                 if (!userProfileDetails.contains(event.target) && !userDropdown.contains(event.target)) {
                     userDropdown.classList.remove('active');
                 }
             });
         } else {
              console.warn("User profile details or dropdown missing for toggle listener.");
         }

         // Example: Settings Tabs
         if (settingsTabs.length > 0) {
            settingsTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    if (!tab.classList.contains('active') && !tab.classList.contains('disabled')) {
                        const tabId = tab.dataset.tab;
                        console.log(`Settings tab clicked: ${tabId}`);
                        activateSettingsTab(tabId); // Activate the specific tab panel
                    }
                });
            });
         } else {
             console.warn("Settings tabs not found for listeners.");
         }


    } // End setupEventListeners

    // --- Initialization ---
    function initializeApp() {
        console.log("--- Initializing App ---");
        loadData();
        updateUserUI();
        loadTeamMembers(); // Load initial data needed globally
        // loadActivities(); // Load initial dashboard data if needed
        // loadNotifications();
        // updateStats();
        applyUserPreferences(); // Apply theme, density etc.
        applyRBAC(); // Apply role-based access control to static elements
        setupEventListeners(); // Setup listeners BEFORE initial navigation
        handleInitialNavigation(); // Determine and load the first view based on URL/storage
        startActivityTimeUpdater(); // Start timers etc.
        console.log("--- Dashboard Initialized ---");
    }

    // --- Start the Application ---
    initializeApp();

}); // End DOMContentLoaded
