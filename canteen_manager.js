const CanteenManager = {
    MENU_KEY: 'campus_canteen_menu',
    CART_KEY: 'campus_canteen_cart',

    INITIAL_MENU: [
        { id: 1, name: 'Veg Burger', price: 45, stock: 50, category: 'Snacks', available: true, image: 'https://images.unsplash.com/photo-1585238341710-4d3ff484184d?w=400&h=300&fit=crop&auto=format' },
        { id: 2, name: 'Chicken Burger', price: 65, stock: 50, category: 'Snacks', available: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format' },
        { id: 3, name: 'Veg Sandwich', price: 30, stock: 50, category: 'Snacks', available: true, image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=300&fit=crop&auto=format' },
        { id: 4, name: 'Chicken Sandwich', price: 50, stock: 50, category: 'Snacks', available: true, image: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Chicken_sandwich.jpg' },
        { id: 5, name: 'Meals', price: 60, stock: 50, category: 'Lunch', available: true, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&auto=format' },
        { id: 6, name: 'Chicken Biryani', price: 120, stock: 50, category: 'Lunch', available: true, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop&auto=format' },
        { id: 7, name: 'Lime Juice', price: 15, stock: 50, category: 'Beverages', available: true, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&auto=format' },
        { id: 8, name: 'Tea', price: 10, stock: 50, category: 'Beverages', available: true, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&auto=format' },
        { id: 9, name: 'Coffee', price: 15, stock: 50, category: 'Beverages', available: true, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&auto=format' },
        { id: 10, name: 'Puffs (Egg)', price: 18, stock: 0, category: 'Snacks', available: false, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Egg_Puffs.jpg/400px-Egg_Puffs.jpg' }
    ],

    MENU_VERSION: '8',
    MENU_VER_KEY: 'campus_canteen_menu_ver',

    init: function () {
        // If menu version changed (e.g., images updated), reset stored menu
        const storedVer = localStorage.getItem(this.MENU_VER_KEY);
        if (storedVer !== this.MENU_VERSION) {
            localStorage.removeItem(this.MENU_KEY);
            localStorage.setItem(this.MENU_VER_KEY, this.MENU_VERSION);
        }
        if (!localStorage.getItem(this.MENU_KEY)) {
            localStorage.setItem(this.MENU_KEY, JSON.stringify(this.INITIAL_MENU));
        }
        if (!localStorage.getItem(this.CART_KEY)) {
            localStorage.setItem(this.CART_KEY, JSON.stringify([]));
        }
    },

    getMenu: function () {
        this.init();
        const menu = JSON.parse(localStorage.getItem(this.MENU_KEY)) || [];
        return menu.map(function (item) {
            // parseInt guards against undefined/null/NaN from old stored data
            const rawStock = parseInt(item.stock, 10);
            // If stock is missing/NaN, fall back to the available boolean
            const stock = isNaN(rawStock)
                ? (item.available !== false ? 50 : 0)
                : rawStock;
            return Object.assign({}, item, {
                stock: stock,
                available: stock > 0
            });
        });
    },

    getCart: function () {
        return JSON.parse(localStorage.getItem(this.CART_KEY)) || [];
    },

    addToCart: function (itemId) {
        const menu = this.getMenu();
        const item = menu.find(i => i.id === itemId);

        if (!item || !item.available) return { success: false, message: 'Item unavailable' };

        const cart = this.getCart();
        const existingItem = cart.find(i => i.id === itemId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...item, quantity: 1 });
        }

        localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
        return { success: true, message: 'Added to cart' };
    },

    removeFromCart: function (itemId) {
        let cart = this.getCart();
        const existingItem = cart.find(i => i.id === itemId);

        if (existingItem) {
            if (existingItem.quantity > 1) {
                existingItem.quantity--;
            } else {
                cart = cart.filter(i => i.id !== itemId);
            }
            localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
            return { success: true };
        }
        return { success: false };
    },

    deleteFromCart: function (itemId) {
        let cart = this.getCart();
        cart = cart.filter(i => i.id !== itemId);
        localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
        return { success: true };
    },

    clearCart: function () {
        localStorage.setItem(this.CART_KEY, JSON.stringify([]));
        return { success: true };
    },

    getCartTotal: function () {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Admin Functions
    addItem: function (item) {
        const menu = this.getMenu();
        const newItem = {
            id: Date.now(),
            stock: 50,
            ...item,
            available: true
        };
        menu.push(newItem);
        localStorage.setItem(this.MENU_KEY, JSON.stringify(menu));
        return { success: true, message: 'Item added successfully' };
    },

    toggleAvailability: function (itemId) {
        const menu = this.getMenu();
        const item = menu.find(i => i.id === itemId);
        if (item) {
            // Toggle via stock so it persists through getMenu()'s stock > 0 derivation
            item.stock = (Number(item.stock) > 0) ? 0 : 50;
            item.available = item.stock > 0;
            localStorage.setItem(this.MENU_KEY, JSON.stringify(menu));
            return { success: true };
        }
        return { success: false };
    },

    updatePrice: function (itemId, newPrice) {
        const menu = this.getMenu();
        const item = menu.find(i => i.id === itemId);
        if (item) {
            item.price = parseFloat(newPrice);
            localStorage.setItem(this.MENU_KEY, JSON.stringify(menu));
            return { success: true };
        }
        return { success: false };
    }
};

// Auto-initialize when loaded
document.addEventListener("DOMContentLoaded", function () {
    if (typeof CanteenManager !== 'undefined') {
        CanteenManager.init();
    }
});
