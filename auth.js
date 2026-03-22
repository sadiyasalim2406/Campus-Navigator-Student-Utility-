/**
 * Campus Navigator Authentication System
 * Handles User Signup, Login, Logout, and Role-Based Protection
 */

const Auth = {
    // Keys for LocalStorage
    USERS_KEY: 'campus_users',
    CURRENT_USER_KEY: 'campus_current_user',
    ADMIN_DATA_KEYS: {
        canteen: 'campus_canteen_data',
        library: 'campus_library_data',
        bus: 'campus_bus_data',
        messages: 'campus_messages'
    },

    /**
     * Initialize Auth System
     * Seeds default admin account if not exists.
     */
    init: function () {
        if (!localStorage.getItem(this.USERS_KEY)) {
            localStorage.setItem(this.USERS_KEY, JSON.stringify([]));
        }

        const users = JSON.parse(localStorage.getItem(this.USERS_KEY));
        const adminExists = users.find(u => u.email === 'admin@campus.com');

        if (!adminExists) {
            const adminUser = {
                id: 'admin_001',
                name: 'Administrator',
                email: 'admin@campus.com',
                password: 'admin123',
                role: 'admin'
            };
            users.push(adminUser);
            localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
            console.log("Default Admin Account Created");
        }
    },

    /**
     * Initialize secure pages
     * Checks if user is logged in, redirects if not.
     * Also handles role-based access.
     */
    initProtection: function () {
        // Ensure initialization happens
        this.init();

        const currentUser = JSON.parse(localStorage.getItem(this.CURRENT_USER_KEY));
        const path = window.location.pathname;
        const page = path.split("/").pop();

        // Pages that don't require login
        const publicPages = ['login.html', 'signup.html'];
        const isPublicPage = publicPages.includes(page);

        // 1. If not logged in and trying to access secure page -> Redirect to Login
        if (!currentUser && !isPublicPage) {
            sessionStorage.setItem('accessDenied', '1');
            window.location.href = 'login.html';
            return;
        }

        // 2. If logged in and trying to access public page -> Redirect to correct dashboard
        if (currentUser && isPublicPage) {
            if (currentUser.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
            return;
        }

        // 3. Role Protection: Admin Page — only admins allowed
        if (page === 'admin.html' && currentUser.role !== 'admin') {
            sessionStorage.setItem('accessDenied', '1');
            window.location.href = 'login.html';
            return;
        }

        // 4. Role Protection: Student Page — only students allowed (block admins)
        if (page === 'index.html' && currentUser.role !== 'student') {
            sessionStorage.setItem('accessDenied', '1');
            window.location.href = 'login.html';
            return;
        }
    },

    /**
     * Sign Up a new user
     * Default role is ALWAYS 'student'
     */
    signup: function (name, email, password) {
        this.init(); // Ensure users array exists
        const users = JSON.parse(localStorage.getItem(this.USERS_KEY));

        // Check if email exists
        if (users.find(u => u.email === email)) {
            return { success: false, message: "Email already registered!" };
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            role: 'student' // Enforce Student Role
        };

        users.push(newUser);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        // Auto-login after signup
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));
        return { success: true, user: newUser };
    },

    /**
     * Login a user
     */
    login: function (email, password) {
        this.init();
        const users = JSON.parse(localStorage.getItem(this.USERS_KEY));
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
            return { success: true, user: user };
        } else {
            return { success: false, message: "Invalid email or password." };
        }
    },

    /**
     * Logout
     */
    logout: function () {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        window.location.href = 'login.html';
    },

    /**
     * Get Current User
     */
    getCurrentUser: function () {
        return JSON.parse(localStorage.getItem(this.CURRENT_USER_KEY));
    }
};

// Auto-run init to ensure data integrity
Auth.init();
