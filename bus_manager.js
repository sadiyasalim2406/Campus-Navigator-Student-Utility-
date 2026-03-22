/**
 * Bus Management Module
 * Handles data persistence and logic for Bus Routes
 */

const BusManager = {
    DATA_KEY: 'campus_bus_data',

    // Preloaded Routes
    INITIAL_ROUTES: [
        { id: 1, number: '01', name: 'Kottarakara Route', status: 'Available', alert: '' },
        { id: 2, number: '02', name: 'Anjallumood Route', status: 'Available', alert: '' },
        { id: 3, number: '03', name: 'Kollam Route', status: 'Available', alert: '' },
        { id: 4, number: '04', name: 'Kundara Route', status: 'Available', alert: '' },
        { id: 5, number: '05', name: 'Ayathil Route', status: 'Available', alert: '' },
        { id: 6, number: '06', name: 'Karunagapally Route', status: 'Available', alert: '' },
        { id: 7, number: '07', name: 'Oochira Route', status: 'Available', alert: '' }
    ],

    /**
     * Initialize Data
     */
    init: function () {
        if (!localStorage.getItem(this.DATA_KEY)) {
            localStorage.setItem(this.DATA_KEY, JSON.stringify(this.INITIAL_ROUTES));
        }
    },

    /**
     * Get all routes
     */
    getRoutes: function () {
        this.init();
        return JSON.parse(localStorage.getItem(this.DATA_KEY));
    },

    /**
     * Update a route
     * @param {number} id 
     * @param {string} status 'Available' or 'Not Available'
     * @param {string} alertMsg Custom message
     */
    updateRoute: function (id, status, alertMsg) {
        const routes = this.getRoutes();
        const index = routes.findIndex(r => r.id === id);
        if (index !== -1) {
            routes[index].status = status;
            routes[index].alert = alertMsg;
            localStorage.setItem(this.DATA_KEY, JSON.stringify(routes));
            return true;
        }
        return false;
    }
};
