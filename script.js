document.addEventListener('DOMContentLoaded', () => {

    // --- Data Configuration ---
    // Mapping of Room Names to their Floor ID and Element ID
    const rooms = [
        // BASEMENT
        { name: "Canteen", id: "b_canteen", floor: "basement" },
        { name: "Workshop", id: "b_workshop", floor: "basement" },
        { name: "Lobby", id: "b_lobby", floor: "basement" },

        // GROUND FLOOR
        { name: "Classroom 104", id: "g_104", floor: "ground" },
        { name: "Workshop Ground", id: "g_workshop_sm", floor: "ground" },
        { name: "Lobby", id: "g_lobby_top", floor: "ground" },
        { name: "PT Room", id: "g_pt", floor: "ground" },
        { name: "Arts Staff Room", id: "g_105", floor: "ground" },
        { name: "Classroom 106", id: "g_106", floor: "ground" },
        { name: "Classroom 102", id: "g_102", floor: "ground" },
        { name: "Toilet", id: "g_toilet_right", floor: "ground" },
        { name: "Library", id: "g_library", floor: "ground" },

        // FIRST FLOOR
        { name: "Classroom 204", id: "f_204", floor: "first" },
        { name: "Toilet", id: "f_toilet_l", floor: "first" },
        { name: "Boys Room", id: "f_boys", floor: "first" },
        { name: "Girls Room", id: "f_girls", floor: "first" },
        { name: "Computer Center 3", id: "f_201", floor: "first" },
        { name: "Staff Room 205", id: "f_205", floor: "first" },
        { name: "Classroom 206", id: "f_206", floor: "first" },
        { name: "Computer Center 1", id: "f_207", floor: "first" },
        { name: "Computer Center 2", id: "f_210", floor: "first" },
        { name: "Lobby", id: "f_entrance", floor: "first" },
        { name: "Porch", id: "f_porch", floor: "first" },

        // SECOND FLOOR
        { name: "Staff Room", id: "s_staff", floor: "second" },
        { name: "HOD Room", id: "s_hod", floor: "second" },
        { name: "Girls Toilet", id: "s_toilet_g", floor: "second" },
        { name: "Lobby", id: "s_lobby_top", floor: "second" },
        { name: "Boys Toilet", id: "s_toilet_m", floor: "second" },
        { name: "Seminar Hall", id: "s_seminar", floor: "second" },
        { name: "Management Room", id: "s_management", floor: "second" },
        { name: "Secretary Room", id: "s_secretary", floor: "second" },
        { name: "Board Room", id: "s_board", floor: "second" },
        { name: "Waiting Area", id: "s_waiting", floor: "second" },
        { name: "Principal Room", id: "s_principal", floor: "second" },
        { name: "Placement Room", id: "s_placement", floor: "second" },
        { name: "Central Office", id: "s_central", floor: "second" },

        // THIRD FLOOR
        { name: "Drawing Hall 404", id: "t_404", floor: "third" },
        { name: "Lobby", id: "t_lobby_top", floor: "third" },
        { name: "Drawing Hall 402", id: "t_402", floor: "third" },
        { name: "Classroom 405", id: "t_405", floor: "third" },
        { name: "Classroom 406", id: "t_406", floor: "third" },
        { name: "Classroom 401", id: "t_401", floor: "third" },
        { name: "Boys Room", id: "t_boys", floor: "third" },
        { name: "Boys Toilet", id: "t_toilet_b", floor: "third" },
        { name: "Girls Room", id: "t_girls", floor: "third" },
        { name: "Classroom 409", id: "t_409", floor: "third" },
        { name: "Girls Toilet", id: "t_toilet_g", floor: "third" },
        { name: "Staff Room", id: "t_staff", floor: "third" },
        { name: "Porch", id: "t_porch", floor: "third" }
    ];

    // --- DOM Elements (old SVG navigation — guarded; new system handled by navigation.js) ---
    const floorSelect = document.getElementById('floorSelect');   // null in new nav
    const roomSearch = document.getElementById('roomSearch');    // null in new nav
    const searchBtn = document.getElementById('searchBtn');     // null in new nav
    const blueprints = document.querySelectorAll('.blueprint');  // empty in new nav

    // --- Functionality ---

    /**
     * Switches the visible floor plan
     * @param {string} floorValue - 'basement', 'ground', 'first', 'second', 'third'
     */
    function switchFloor(floorValue) {
        // Guard: old SVG elements may not exist in new nav
        if (floorSelect) floorSelect.value = floorValue;
        blueprints.forEach(bp => bp.classList.remove('active'));
        const selectedBlueprint = document.getElementById(`floor-${floorValue}`);
        if (selectedBlueprint) selectedBlueprint.classList.add('active');
    }

    /**
     * Clears highlights and dim effects from all rooms
     */
    function clearHighlights() {
        document.querySelectorAll('.room-group').forEach(el => {
            el.classList.remove('highlight');
            el.classList.remove('dim');
        });
    }

    /**
     * Helper to normalize text for search comparison
     */
    function normalizeSearchText(text) {
        if (!text) return "";
        return text
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ') // Collapse multiple spaces
            // Remove specific bracketed or non-bracketed terms: Left, Right, Top, Core, Circulation
            .replace(/\s*\(?(left|right|top|core|circulation)\)?/gi, '')
            .trim();
    }

    /**
     * Standardizes specific common terms like Toilet and Staircase
     */
    function standardizeRoomTerm(text) {
        let norm = normalizeSearchText(text);
        if (norm.includes("toilet")) return "toilet";
        if (norm.includes("stair")) return "staircase";
        if (norm === "workshop ground") return "workshop";
        return norm;
    }

    /**
     * Searches for a room and highlights it
     */
    function performSearch() {
        const inputRaw = roomSearch.value.trim();
        if (!inputRaw) {
            clearHighlights();
            return;
        }

        const searchValue = normalizeSearchText(inputRaw);
        const standardSearch = standardizeRoomTerm(inputRaw);

        // Always clear previous highlights first
        clearHighlights();

        let foundRooms = [];

        // Priority 1: Exact matches (Standardized)
        document.querySelectorAll('.room-group').forEach(group => {
            const nameAttr = group.getAttribute('data-name');
            if (!nameAttr) return;

            const roomNameNorm = normalizeSearchText(nameAttr);
            const roomNameStandard = standardizeRoomTerm(nameAttr);

            if (roomNameNorm === searchValue || roomNameStandard === standardSearch) {
                foundRooms.push(group);
            }
        });

        // Priority 2: Partial matches (if no exact matches found)
        if (foundRooms.length === 0) {
            document.querySelectorAll('.room-group').forEach(group => {
                const nameAttr = group.getAttribute('data-name');
                if (!nameAttr) return;

                const roomNameNorm = normalizeSearchText(nameAttr);

                // Allow "includes" and "room number" matching
                if (roomNameNorm.includes(searchValue) || (searchValue && /^\d+$/.test(searchValue) && roomNameNorm.includes(searchValue))) {
                    foundRooms.push(group);
                }
            });
        }

        if (foundRooms.length > 0) {
            // Apply highlights to all matches
            foundRooms.forEach(group => group.classList.add("highlight"));

            // Use the first match for floor switching and scrolling
            const firstMatch = foundRooms[0];
            const floorSvg = firstMatch.closest('.blueprint');
            if (floorSvg) {
                const floorId = floorSvg.id.replace('floor-', '');
                switchFloor(floorId);

                // Delay scroll slightly to ensure floor is visible
                setTimeout(() => {
                    firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        } else {
            alert("Room not found");
        }
    }

    // --- Interactive Room Clicking ---
    document.querySelectorAll('.room-group').forEach(group => {
        group.addEventListener('click', function () {
            const name = this.getAttribute('data-name');
            if (name) {
                clearHighlights();
                this.classList.add('highlight');
                roomSearch.value = name;
                closeSuggestions();
            }
        });
    });

    // --- Autocomplete Suggestions ---
    const suggestionsDropdown = document.getElementById('roomSuggestions');

    const FLOOR_LABELS = {
        basement: 'Basement', ground: 'Ground',
        first: 'First', second: 'Second', third: 'Third'
    };

    // Build a de-duped list of { name, floor } from the rooms array
    const uniqueRoomNames = [];
    const _seen = new Set();
    rooms.forEach(r => {
        const key = r.name.toLowerCase();
        if (!_seen.has(key)) {
            _seen.add(key);
            uniqueRoomNames.push({ name: r.name, floor: r.floor });
        }
    });

    let activeSuggIdx = -1;

    function openSuggestions(query) {
        if (!suggestionsDropdown) return;
        query = query.trim().toLowerCase();
        suggestionsDropdown.innerHTML = '';
        activeSuggIdx = -1;

        if (!query) { closeSuggestions(); return; }

        const matches = uniqueRoomNames
            .filter(r => r.name.toLowerCase().includes(query))
            .slice(0, 8);

        if (matches.length === 0) { closeSuggestions(); return; }

        matches.forEach(room => {
            const li = document.createElement('li');
            li.innerHTML =
                `<span>${hlMatch(room.name, query)}</span>` +
                `<span class="suggestion-floor">${FLOOR_LABELS[room.floor] || room.floor}</span>`;
            li.addEventListener('mousedown', e => {
                e.preventDefault();
                selectSugg(room.name);
            });
            suggestionsDropdown.appendChild(li);
        });

        suggestionsDropdown.classList.add('open');
    }

    function hlMatch(name, q) {
        const i = name.toLowerCase().indexOf(q);
        if (i === -1) return name;
        return name.slice(0, i)
            + `<strong style="color:var(--primary)">${name.slice(i, i + q.length)}</strong>`
            + name.slice(i + q.length);
    }

    function closeSuggestions() {
        if (!suggestionsDropdown) return;
        suggestionsDropdown.classList.remove('open');
        suggestionsDropdown.innerHTML = '';
        activeSuggIdx = -1;
    }

    function selectSugg(name) {
        roomSearch.value = name;
        closeSuggestions();
        performSearch();
    }

    // Old nav event listeners — only wire if old elements still exist
    if (roomSearch && suggestionsDropdown) {
        roomSearch.addEventListener('input', () => openSuggestions(roomSearch.value));
        roomSearch.addEventListener('keydown', e => {
            const items = suggestionsDropdown.querySelectorAll('li');
            if (!suggestionsDropdown.classList.contains('open') || !items.length) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeSuggIdx = Math.min(activeSuggIdx + 1, items.length - 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeSuggIdx = Math.max(activeSuggIdx - 1, 0);
            } else if (e.key === 'Escape') {
                closeSuggestions(); return;
            } else if (e.key === 'Enter' && activeSuggIdx >= 0) {
                e.preventDefault();
                selectSugg(items[activeSuggIdx].querySelector('span').textContent);
                return;
            } else { return; }
            items.forEach((li, i) => li.classList.toggle('active-suggestion', i === activeSuggIdx));
        });
        document.addEventListener('click', e => {
            if (!roomSearch.contains(e.target) && !suggestionsDropdown.contains(e.target)) {
                closeSuggestions();
            }
        });
    }

    // --- Old Nav Event Listeners (guarded) ---
    if (floorSelect) floorSelect.addEventListener('change', e => { switchFloor(e.target.value); clearHighlights(); });
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (roomSearch) {
        roomSearch.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(); });
        roomSearch.addEventListener('input', e => { if (!e.target.value) clearHighlights(); });
    }

    // Sidebar Link Handling
    const navLinks = document.querySelectorAll('.nav-links a');
    const modules = document.querySelectorAll('.module');

    // --- Module Switching Logic ---
    function showModule(moduleId) {
        // 1. Remove active class from all modules
        modules.forEach(m => m.classList.remove('active'));

        // 2. Add active class to selected module
        const targetModule = document.getElementById(moduleId);
        if (targetModule) {
            targetModule.classList.add('active');
        }

        // 3. Update active sidebar highlight
        navLinks.forEach(l => {
            l.classList.remove('active');
            if (l.getAttribute('data-page') === moduleId.replace('-module', '')) {
                l.classList.add('active');
            }
        });
    }

    // Sidebar Link Handling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = link.getAttribute('data-page');
            showModule(`${pageName}-module`);
            // Re-render bus from localStorage every time the tab is opened
            if (pageName === 'bus') renderBusRoutes();
        });
    });

    // --- Faculty Data & Rendering ---
    // --- Faculty Data & Rendering ---
    const DEFAULT_FACULTY_DATA = {
        "principal": [
            { "name": "Dr. Shaji KK", "designation": "Principal", "photo": "placeholder_user.svg", "office": "Principal Office", "roomId": "s_principal" }
        ],
        "faculty": [
            { "name": "Prof. Saheer H.", "designation": "Associate Professor & Director (SCIS)", "status": "Active", "photo": "placeholder_user.svg", "office": "SCIS-101", "roomId": "" },
            { "name": "Dr. Vineetha G.R.", "designation": "Associate Professor & HOD", "status": "Active", "photo": "placeholder_user.svg", "office": "CSE-HOD", "roomId": "s_hod" },
            { "name": "Prof. Amala K J", "designation": "Assistant Professor", "status": "On Leave", "photo": "placeholder_user.svg", "office": "CSE-203", "roomId": "f_204" },
            { "name": "Prof. Thasni Sharif", "designation": "Assistant Professor", "status": "Active", "photo": "placeholder_user.svg", "office": "CSE-204", "roomId": "f_204" },
            { "name": "Prof. Anpu Alexander", "designation": "Assistant Professor", "status": "Active", "photo": "placeholder_user.svg", "office": "CSE-205", "roomId": "f_205" },
            { "name": "Prof. Jasmin S", "designation": "Assistant Professor", "status": "Active", "photo": "placeholder_user.svg", "office": "CSE-206", "roomId": "f_206" },
            { "name": "Prof. Salim S", "designation": "Assistant Professor", "status": "Active", "photo": "placeholder_user.svg", "office": "CSE-207", "roomId": "f_207" },
            { "name": "Prof. Ajeena T", "designation": "Assistant Professor", "status": "Active", "photo": "placeholder_user.svg", "office": "CSE-208", "roomId": "f_207" },
            { "name": "Prof. Afia Abdul Rahman", "designation": "Assistant Professor", "status": "Active", "photo": "placeholder_user.svg", "office": "CSE-209", "roomId": "f_210" },
            { "name": "Prof. Muneera", "designation": "Assistant Professor", "status": "Active", "photo": "placeholder_user.svg", "office": "CSE-210", "roomId": "f_210" },
            { "name": "Prof. Naja M. I.", "designation": "Assistant Professor", "status": "Active", "photo": "placeholder_user.svg", "office": "CSE-211", "roomId": "f_210" },
            { "name": "Prof. Viji M", "designation": "Assistant Professor", "status": "Active", "photo": "placeholder_user.svg", "office": "CSE-212", "roomId": "f_210" }
        ],
        "technical_staff": [
            { "name": "Mr. Shibu P S", "designation": "Trade Instructor", "office": "Lab-101", "roomId": "g_workshop_sm" },
            { "name": "Mr. Muhammed Shameer S", "designation": "Lab Instructor", "office": "Lab-102", "roomId": "g_102" },
            { "name": "Mrs. Arya Asok", "designation": "Lab Instructor", "office": "Lab-103", "roomId": "g_104" },
            { "name": "Ajmi Thaha", "designation": "Lab Instructor", "office": "Lab-104", "roomId": "g_104" }
        ]
    };

    let facultyData = JSON.parse(localStorage.getItem('campus_faculty_data'));

    if (!facultyData) {
        facultyData = DEFAULT_FACULTY_DATA;
        localStorage.setItem('campus_faculty_data', JSON.stringify(facultyData));
    }

    const facultySearch = document.getElementById('facultySearch');

    function renderFaculty(filter = "") {
        const query = filter.toLowerCase();

        const createCard = (person) => {
            // Check if matches filter
            if (filter && !person.name.toLowerCase().includes(query) && !person.office.toLowerCase().includes(query)) {
                return '';
            }

            return `
                <div class="faculty-card">
                    ${person.photo ? `<img src="${person.photo}" alt="${person.name}" class="faculty-photo">` : ''}
                    <div class="faculty-name">${person.name}</div>
                    <div class="faculty-designation">${person.designation}</div>
                    ${person.status ? `<div class="faculty-status status-${person.status.toLowerCase().replace(' ', '-')}">${person.status}</div>` : ''}
                    <div class="faculty-office">${person.office}</div>
                    <button class="locate-btn" onclick="locateFaculty('${person.roomId}', '${person.office}')">Locate on Map</button>
                </div>
            `;
        };

        // Principal
        const principalContainer = document.getElementById('principal-container');
        if (principalContainer) {
            principalContainer.innerHTML = facultyData.principal.map(createCard).join('');
        }

        // Faculty
        const facultyGrid = document.getElementById('faculty-grid');
        if (facultyGrid) {
            facultyGrid.innerHTML = facultyData.faculty.map(createCard).join('');
        }

        // Staff
        const staffGrid = document.getElementById('staff-grid');
        if (staffGrid) {
            staffGrid.innerHTML = facultyData.technical_staff.map(createCard).join('');
        }
    }

    // Expose locate function to global scope for button onclick
    window.locateFaculty = function (roomId, officeName) {
        // 1. Switch to navigation module
        showModule('navigation-module');

        // 2. Delegate to the new navigation.js search (uses #nd-search-input)
        const navInput = document.getElementById('nd-search-input');
        const navBtn = document.getElementById('nd-go');

        if (!roomId && !officeName) return;

        // Find room name from legacy room ID mapping
        const roomObj = rooms.find(r => r.id === roomId);
        const searchTerm = roomObj ? roomObj.name : officeName;

        if (navInput && navBtn && searchTerm) {
            setTimeout(() => {
                navInput.value = searchTerm;
                navBtn.click();
            }, 80); // slight delay to let module activate
        } else if (!roomId) {
            alert(`Location for ${officeName} is not mapped on the floor plan.`);
        }
    };

    // Faculty Search Listener
    if (facultySearch) {
        facultySearch.addEventListener('input', (e) => {
            renderFaculty(e.target.value);
        });
    }

    // --- Bus Module Logic ---
    function renderBusRoutes() {
        const busGrid = document.getElementById('bus-grid');
        const alertContainer = document.getElementById('bus-alert-container');

        if (!busGrid) return;

        const routes = BusManager.getRoutes();
        let hasIssues = false;
        let issueCount = 0;

        busGrid.innerHTML = routes.map(bus => {
            const isAvailable = bus.status === 'Available';
            if (!isAvailable) {
                hasIssues = true;
                issueCount++;
            }

            return `
                <div class="bus-card ${!isAvailable ? 'unavailable' : ''}">
                    <div class="bus-number">Bus ${bus.number}</div>
                    <div class="bus-route">${bus.name}</div>
                    <div class="status-badge ${isAvailable ? 'available' : 'unavailable'}">
                        ${bus.status}
                    </div>
                    ${bus.alert ? `
                        <div class="bus-alert-box">
                            ⚠️ ${bus.alert}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Global Alert Banner
        if (hasIssues) {
            alertContainer.innerHTML = `
                <div class="urgent-banner">
                    <div>
                        <strong>⚠️ Transport Alert:</strong> ${issueCount} Bus Route(s) are currently unavailable or delayed. Please check details below.
                    </div>
                </div>
            `;
        } else {
            alertContainer.innerHTML = '';
        }
    }

    // Render initially and when tab is switched
    renderBusRoutes();

    // --- Library Module Logic ---
    function renderLibrary() {
        const libraryContent = document.getElementById('library-content');
        const myBooksContainer = document.getElementById('my-books-container');
        const myBooksList = document.getElementById('my-books-list');
        const myReservedContainer = document.getElementById('my-reserved-container');
        const myReservedList = document.getElementById('my-reserved-list');

        // Stats Elements
        const statTotal = document.getElementById('stat-total-books');
        const statAvailable = document.getElementById('stat-available-books');
        const statIssued = document.getElementById('stat-issued-books');
        const statReserved = document.getElementById('stat-reserved-books');

        if (!libraryContent) return;

        const books = LibraryManager.getBooks();

        let currentUser;
        if (typeof Auth !== 'undefined' && Auth.getCurrentUser) {
            currentUser = Auth.getCurrentUser();
        } else {
            currentUser = { email: "guest@example.com", name: "Guest" };
        }

        // Safe checks for arrays in case LibraryManager returns null/undefined
        const myBooks = LibraryManager.getUserIssuedBooks(currentUser ? currentUser.email : "") || [];
        const myReserved = LibraryManager.getUserReservedBooks(currentUser ? currentUser.email : "") || [];
        const stats = LibraryManager.getStats();

        // Update Stats
        if (statTotal) statTotal.textContent = stats.totalBooks;
        if (statAvailable) statAvailable.textContent = stats.availableBooks;
        if (statIssued) statIssued.textContent = stats.issuedCount;
        if (statReserved) statReserved.textContent = stats.reservedCount;

        // Render My Issued Books
        if (myBooks.length > 0) {
            myBooksContainer.style.display = 'block';
            myBooksList.innerHTML = myBooks.map(tx => {
                const borrowDate = new Date(tx.borrowDate);
                const dueDate = new Date(borrowDate);
                dueDate.setDate(dueDate.getDate() + LibraryManager.maxBorrowDays);

                const now = new Date();
                const isOverdue = now > dueDate;
                let fine = 0;

                if (isOverdue) {
                    const diffTime = Math.abs(now - dueDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    fine = diffDays * LibraryManager.FINE_PER_DAY;
                }

                return `
                    <div class="book-card" style="border-left: 5px solid #3498db;">
                        <div>
                            <div class="book-title">${tx.bookTitle}</div>
                            <div class="book-author">Issued: ${borrowDate.toLocaleDateString()}</div>
                            <div class="book-author" style="color:${isOverdue ? '#c0392b' : '#27ae60'}">
                                Due: ${dueDate.toLocaleDateString()}
                            </div>
                            ${fine > 0 ? `
                                <div class="fine-badge">
                                    ⚠️ Fine Due: ₹${fine}
                                </div>
                            ` : ''}
                        </div>
                        <button class="return-btn" style="margin-top:10px; width:100%;" onclick="returnBook(${tx.id})">Return Book</button>
                    </div>
                `;
            }).join('');
        } else {
            myBooksContainer.style.display = 'none';
        }

        // Render My Reserved Books
        if (myReserved.length > 0) {
            myReservedContainer.style.display = 'block';
            myReservedList.innerHTML = myReserved.map(res => {
                const resDate = new Date(res.reservationDate);
                const expiryDate = new Date(resDate);
                expiryDate.setDate(expiryDate.getDate() + LibraryManager.reservationValidityDays);

                return `
                    <div class="book-card reserved-card">
                        <div>
                            <div class="book-title">${res.bookTitle}</div>
                            <div class="book-author">Date: ${resDate.toLocaleDateString()}</div>
                            <div class="status-badge reserved">${res.status}</div>
                            ${res.status === 'Active' ? `
                                <div class="book-author" style="font-size:0.8rem; color:#e67e22; margin-top:5px;">
                                    Valid until: ${expiryDate.toLocaleDateString()}
                                </div>
                            ` : ''}
                        </div>
                        <button class="return-btn" style="margin-top:10px; width:100%; background:#7f8c8d;" onclick="cancelReservation(${res.id})">Cancel</button>
                    </div>
                `;
            }).join('');
        } else {
            myReservedContainer.style.display = 'none';
        }

        // Render Available Collection by Category
        let html = '<div class="book-grid">';

        books.forEach(book => {
            const isAvailable = book.copies > 0;
            html += `
                <div class="book-card item" data-title="${book.title.toLowerCase()} ${book.author.toLowerCase()}">
                    <h3>${book.title}</h3>
                    <div class="book-details">
                        <p><strong>Author:</strong> ${book.author}</p>
                        <p><strong>Category:</strong> ${book.category || 'General'}</p>
                        <div style="margin-top:10px;">
                            <span class="copy-badge">📚 ${book.copies} Copies Left</span>
                        </div>
                        <div style="margin-top:5px;">
                             <span class="status-badge ${isAvailable ? 'available' : 'unavailable'}">
                                ${isAvailable ? 'Available' : 'Out of Stock'}
                            </span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="${isAvailable ? 'issue-btn' : 'unavailable-btn'}" 
                                onclick="borrowBook(${book.id})" 
                                ${!isAvailable ? 'disabled' : ''}>
                                ${isAvailable ? 'Issue Book' : 'Unavailable'}
                        </button>
                        <button class="reserve-btn" onclick="reserveBook(${book.id})">Reserve</button>
                    </div>
                </div>
            `;
        });

        html += '</div>';

        if (books.length === 0) {
            html = '<p style="text-align:center; padding:20px; color:#7f8c8d;">No books available in the library.</p>';
        }

        libraryContent.innerHTML = html;
    }

    window.filterBooks = function () {
        const input = document.getElementById('library-search');
        const filter = input.value.toLowerCase();
        const nodes = document.getElementsByClassName('item');

        // Also hide category headers if no items in them match? 
        // For simplicity now, just hiding items.
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].getAttribute('data-title').includes(filter)) {
                nodes[i].parentElement.style.display = "grid"; // Ensure grid is visible
                nodes[i].style.display = "flex";
            } else {
                nodes[i].style.display = "none";
            }
        }
    }

    window.reserveBook = function (bookId) {
        let currentUser;
        if (typeof Auth !== 'undefined' && Auth.getCurrentUser) {
            currentUser = Auth.getCurrentUser();
        }

        if (!currentUser) return alert("Please login.");

        const result = LibraryManager.reserveBook(bookId, currentUser.email);
        alert(result.message);
        if (result.success) renderLibrary();
    }

    window.cancelReservation = function (id) {
        if (confirm("Cancel this reservation?")) {
            const result = LibraryManager.cancelReservation(id);
            if (result.success) {
                renderLibrary();
            } else {
                alert(result.message);
            }
        }
    }

    window.borrowBook = function (bookId) {
        let currentUser;
        if (typeof Auth !== 'undefined' && Auth.getCurrentUser) {
            currentUser = Auth.getCurrentUser();
        }

        if (!currentUser) {
            alert("Please login to borrow books.");
            return;
        }

        const result = LibraryManager.issueBook(bookId, currentUser.email);
        if (result.success) {
            alert("Book borrowed successfully!");
            renderLibrary();
        } else {
            alert(result.message);
        }
    }

    window.returnBook = function (txId) {
        const result = LibraryManager.returnBook(txId);
        if (result.success) {
            let msg = "Book returned successfully.";
            if (result.fine > 0) {
                msg += ` You paid a fine of ₹${result.fine}.`;
            }
            alert(msg);
            renderLibrary();
        } else {
            alert(result.message);
        }
    }

    // --- Role-Based Visibility Helper ---
    function applyRoleBasedVisibility() {
        let currentUser = null;
        if (typeof Auth !== 'undefined' && Auth.getCurrentUser) {
            currentUser = Auth.getCurrentUser();
        }
        const isAdmin = currentUser && currentUser.role === 'admin';
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.setProperty('display', isAdmin ? 'block' : 'none', 'important');
        });
    }

    // --- Canteen Module Logic ---
    function renderCanteen() {
        const menuGrid = document.getElementById('canteen-menu-grid');
        const cartContainer = document.getElementById('cart-items-container');
        const cartTotalEl = document.getElementById('cart-total-price');
        const cartCountEl = document.getElementById('cart-count');

        if (!menuGrid) return;

        // Render Menu
        const menu = CanteenManager.getMenu();
        menuGrid.innerHTML = menu.map(item => {
            // item.image may be: a Base64 data-URL, an https:// URL, or empty string/undefined
            const hasImage = item.image && item.image.trim() !== '';
            const imgHtml = hasImage
                ? `<img
                    src="${item.image}"
                    alt="${item.name}"
                    class="food-img"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                   <div class="food-img-fallback" style="display:none;">🍱</div>`
                : `<div class="food-img-fallback" style="display:flex;">🍱</div>`;
            return `
            <div class="food-card${!item.available ? ' unavailable-card' : ''}">
                ${imgHtml}
                <div class="food-info">
                    <h3>${item.name}</h3>
                    <div class="food-price">₹${item.price}</div>
                    <span class="status-badge ${item.available ? 'available' : 'unavailable'}" style="margin-bottom:10px;">
                        ${item.available ? 'Available' : 'Out of Stock'}
                    </span>
                    <button class="add-btn" onclick="addToCart(${item.id})" ${!item.available ? 'disabled' : ''}>
                        ${item.available ? 'Add to Cart ➕' : 'Out of Stock'}
                    </button>
                    ${(!item.available && typeof Auth !== 'undefined' && Auth.getCurrentUser && Auth.getCurrentUser() && Auth.getCurrentUser().role === 'admin') ? `<button onclick="toggleAvailability(${item.id})" style="margin-top:5px; font-size:0.8rem; background:none; border:none; text-decoration:underline; cursor:pointer; color:#7f8c8d;">(Admin: Enable)</button>` : ''}
                </div>
            </div>`;
        }).join('');

        // Render Cart
        const cart = CanteenManager.getCart();
        const total = CanteenManager.getCartTotal();

        if (cartCountEl) cartCountEl.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
        if (cartTotalEl) cartTotalEl.textContent = `₹${total}`;

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
        } else {
            cartContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <div class="item-price">₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}</div>
                    </div>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="removeFromCart(${item.id})">−</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="addToCart(${item.id})">+</button>
                    </div>
                </div>
            `).join('');
        }

        // Apply role-based visibility after each render
        applyRoleBasedVisibility();
    }

    // Expose Canteen Functions
    window.addToCart = function (id) {
        const result = CanteenManager.addToCart(id);
        if (result.success) {
            renderCanteen();
            // Optional: Shake cart icon or show toast
        } else {
            alert(result.message);
        }
    }

    window.removeFromCart = function (id) {
        CanteenManager.removeFromCart(id);
        renderCanteen();
    }

    window.toggleCart = function () {
        const sidebar = document.getElementById('canteen-cart');
        sidebar.classList.toggle('active');
    }

    window.placeOrder = function () {
        const cart = CanteenManager.getCart();
        if (cart.length === 0) return alert("Cart is empty!");

        const totalAmount = CanteenManager.getCartTotal();

        if (confirm(`Place order for ₹${totalAmount}?`)) {
            // Create Order Object
            const order = {
                id: Date.now(), // Simple unique ID
                studentName: (typeof Auth !== 'undefined' && Auth.getCurrentUser()) ? Auth.getCurrentUser().name : "Guest",
                items: cart,
                total: totalAmount,
                status: "Pending",
                timestamp: new Date().toISOString()
            };

            // Save to LocalStorage
            const orders = JSON.parse(localStorage.getItem('campus_canteen_orders')) || [];
            orders.push(order);
            localStorage.setItem('campus_canteen_orders', JSON.stringify(orders));

            // Clear Cart
            CanteenManager.clearCart();
            renderCanteen();

            alert("Order placed successfully! Please collect your token.");
            if (window.innerWidth <= 768) toggleCart(); // Close on mobile
        }
    }

    // Admin Functions
    window.toggleAdminPanel = function () {
        const panel = document.getElementById('admin-panel-content');
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    }

    window.addNewFoodItem = function () {
        const name = document.getElementById('new-food-name').value.trim();
        const price = document.getElementById('new-food-price').value;
        const category = document.getElementById('new-food-category').value;

        if (!name || !price) return alert("Please fill details");

        // Auto-generate image URL from food name using loremflickr (keyword-based)
        const query = name.toLowerCase().replace(/\s+/g, ',');
        const imageUrl = `https://loremflickr.com/400/300/${query},food`;

        CanteenManager.addItem({
            name,
            price: parseFloat(price),
            category,
            image: imageUrl
        });

        document.getElementById('new-food-name').value = '';
        document.getElementById('new-food-price').value = '';
        renderCanteen();
        alert("Item added!");
    }

    window.toggleAvailability = function (id) {
        if (confirm("Toggle availability for this item?")) {
            CanteenManager.toggleAvailability(id);
            renderCanteen(); // Re-render to show updated status
        }
    }

    // Update render on module switch
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const page = link.getAttribute('data-page');
            if (page === 'library') {
                renderLibrary();
            } else if (page === 'canteen') {
                renderCanteen();
            }
        });
    });

    // Export for external access
    window.renderLibrary = renderLibrary;
    window.renderFaculty = renderFaculty;
    window.renderCanteen = renderCanteen;
    window.applyRoleBasedVisibility = applyRoleBasedVisibility;

    // Initial load state
    if (typeof switchFloor === 'function') {
        switchFloor('ground'); // Default to ground floor
    }
});

// -----------------------------------------------
// Initialise modules after DOM ready
// -----------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    try {
        if (typeof renderLibrary === "function") renderLibrary();
        if (typeof renderFaculty === "function") renderFaculty();
        if (typeof renderCanteen === "function") renderCanteen();
        // Apply role-based visibility on load (covers any admin-only elements outside canteen render)
        if (typeof applyRoleBasedVisibility === "function") applyRoleBasedVisibility();
    } catch (error) {
        console.error("Initialization error:", error);
    }
});

// -----------------------------------------------
// Admin: Canteen Order Management
// -----------------------------------------------

/** Toggle the Admin Orders panel open/closed and refresh orders each time it opens */
function toggleOrdersPanel() {
    const panel = document.getElementById('admin-orders-panel');
    if (!panel) return;
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) renderAdminOrders();
}

/** Read orders from localStorage and render them as cards */
function renderAdminOrders() {
    const container = document.getElementById('admin-orders-list');
    if (!container) return;

    const orders = JSON.parse(localStorage.getItem('campus_canteen_orders') || '[]');

    if (orders.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px 0;">No orders placed yet.</p>';
        return;
    }

    // Sort newest first
    const sorted = [...orders].sort((a, b) => b.id - a.id);

    container.innerHTML = sorted.map(order => {
        const itemList = Array.isArray(order.items)
            ? order.items.map(i => `${i.name} ×${i.qty || 1}`).join(', ')
            : '—';

        const payStatus = order.paymentStatus || 'Pending';
        const ordStatus = order.status || 'Pending';
        const isPaid = payStatus === 'Paid';
        const isCompleted = ordStatus === 'Completed';

        return `
        <div class="order-card" id="order-card-${order.id}">
            <div class="order-card-header">
                <span class="order-id">#${String(order.id).slice(-6)}</span>
                <div class="order-badges">
                    <span class="order-badge ${isPaid ? 'badge-paid' : 'badge-pending'}" id="pay-badge-${order.id}">
                        💳 ${payStatus}
                    </span>
                    <span class="order-badge ${isCompleted ? 'badge-done' : 'badge-pending'}" id="status-badge-${order.id}">
                        📦 ${ordStatus}
                    </span>
                </div>
            </div>
            <div class="order-card-body">
                <div class="order-row"><span class="order-label">Student</span><span>${order.studentName || 'Guest'}</span></div>
                <div class="order-row"><span class="order-label">Items</span><span>${itemList}</span></div>
                <div class="order-row"><span class="order-label">Total</span><span class="order-total">₹${order.total || 0}</span></div>
            </div>
            <div class="order-card-actions">
                <button class="order-btn btn-pay"
                    onclick="markOrderPaid(${order.id})"
                    ${isPaid ? 'disabled' : ''}>
                    ✅ Mark as Paid
                </button>
                <button class="order-btn btn-complete"
                    onclick="completeOrder(${order.id})"
                    ${isCompleted ? 'disabled' : ''}>
                    🏁 Complete Order
                </button>
            </div>
        </div>`;
    }).join('');
}

/** Mark a specific order as Paid and update DOM + localStorage */
function markOrderPaid(orderId) {
    const orders = JSON.parse(localStorage.getItem('campus_canteen_orders') || '[]');
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return;

    orders[idx].paymentStatus = 'Paid';
    localStorage.setItem('campus_canteen_orders', JSON.stringify(orders));

    // Live DOM update — no reload
    const badge = document.getElementById(`pay-badge-${orderId}`);
    if (badge) {
        badge.textContent = '💳 Paid';
        badge.classList.remove('badge-pending');
        badge.classList.add('badge-paid');
    }

    const btn = document.querySelector(`#order-card-${orderId} .btn-pay`);
    if (btn) btn.disabled = true;
}

/** Mark a specific order as Completed and update DOM + localStorage */
function completeOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('campus_canteen_orders') || '[]');
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return;

    orders[idx].status = 'Completed';
    localStorage.setItem('campus_canteen_orders', JSON.stringify(orders));

    // Live DOM update — no reload
    const badge = document.getElementById(`status-badge-${orderId}`);
    if (badge) {
        badge.textContent = '📦 Completed';
        badge.classList.remove('badge-pending');
        badge.classList.add('badge-done');
    }

    const btn = document.querySelector(`#order-card-${orderId} .btn-complete`);
    if (btn) btn.disabled = true;
}
