const LibraryManager = {
    BOOKS_KEY: 'campus_library_books',
    ISSUED_KEY: 'campus_library_issued',
    RESERVED_KEY: 'campus_library_reserved',

    INITIAL_BOOKS: [
        // CATEGORY 1: CSE CORE TEXTBOOKS
        { id: 1, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'CSE CORE TEXTBOOKS', copies: 5, total: 5, availableCopies: 5 },
        { id: 2, title: 'Operating System Concepts', author: 'Silberschatz', category: 'CSE CORE TEXTBOOKS', copies: 5, total: 5, availableCopies: 5 },
        { id: 3, title: 'Computer Networks', author: 'Andrew S. Tanenbaum', category: 'CSE CORE TEXTBOOKS', copies: 4, total: 4, availableCopies: 4 },
        { id: 4, title: 'Database System Concepts', author: 'Korth', category: 'CSE CORE TEXTBOOKS', copies: 4, total: 4, availableCopies: 4 },
        { id: 5, title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', category: 'CSE CORE TEXTBOOKS', copies: 3, total: 3, availableCopies: 3 },
        { id: 6, title: 'Compiler Design', author: 'Aho, Lam, Sethi', category: 'CSE CORE TEXTBOOKS', copies: 3, total: 3, availableCopies: 3 },
        { id: 7, title: 'Software Engineering', author: 'Ian Sommerville', category: 'CSE CORE TEXTBOOKS', copies: 5, total: 5, availableCopies: 5 },

        // CATEGORY 2: INSPIRATIONAL
        { id: 27, title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', category: 'INSPIRATIONAL', copies: 5, total: 5, availableCopies: 5 },
        { id: 28, title: 'The Diary of a Young Girl', author: 'Anne Frank', category: 'INSPIRATIONAL', copies: 4, total: 4, availableCopies: 4 },
        { id: 34, title: 'Atomic Habits', author: 'James Clear', category: 'INSPIRATIONAL', copies: 5, total: 5, availableCopies: 5 }
    ],

    init: function () {
        if (!localStorage.getItem(this.BOOKS_KEY) || JSON.parse(localStorage.getItem(this.BOOKS_KEY)).length < 5) {
            localStorage.setItem(this.BOOKS_KEY, JSON.stringify(this.INITIAL_BOOKS));
        }
        if (!localStorage.getItem(this.ISSUED_KEY)) {
            localStorage.setItem(this.ISSUED_KEY, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.RESERVED_KEY)) {
            localStorage.setItem(this.RESERVED_KEY, JSON.stringify([]));
        }
    },

    getBooks: function () {
        return JSON.parse(localStorage.getItem(this.BOOKS_KEY)) || [];
    },

    getStats: function () {
        const books = this.getBooks();
        const issued = JSON.parse(localStorage.getItem(this.ISSUED_KEY)) || [];
        const reserved = JSON.parse(localStorage.getItem(this.RESERVED_KEY)) || [];

        const totalBooks = books.reduce((sum, b) => sum + (b.total || b.copies), 0);
        const availableBooks = books.reduce((sum, b) => sum + (b.copies || 0), 0);

        return {
            totalBooks,
            availableBooks,
            issuedCount: issued.length,
            reservedCount: reserved.length
        };
    },

    issueBook: function (bookId, userEmail) {
        const books = this.getBooks();
        const bookIndex = books.findIndex(b => b.id == bookId);

        if (bookIndex !== -1 && books[bookIndex].copies > 0) {
            books[bookIndex].copies--;
            localStorage.setItem(this.BOOKS_KEY, JSON.stringify(books));

            const issued = JSON.parse(localStorage.getItem(this.ISSUED_KEY)) || [];
            issued.push({
                id: Date.now(),
                bookId,
                bookTitle: books[bookIndex].title,
                userEmail,
                borrowDate: new Date().toISOString(),
                status: 'Borrowed'
            });
            localStorage.setItem(this.ISSUED_KEY, JSON.stringify(issued));
            return { success: true };
        }
        return { success: false, message: 'Book not available' };
    },

    reserveBook: function (bookId, userEmail) {
        // Simple reservation mock
        const books = this.getBooks();
        const bookIndex = books.findIndex(b => b.id == bookId);
        if (bookIndex === -1) return { success: false, message: 'Book not found' };

        const reserved = JSON.parse(localStorage.getItem(this.RESERVED_KEY)) || [];
        reserved.push({
            id: Date.now(),
            bookId,
            bookTitle: books[bookIndex].title,
            userEmail,
            reservationDate: new Date().toISOString(),
            status: 'Active'
        });
        localStorage.setItem(this.RESERVED_KEY, JSON.stringify(reserved));
        return { success: true, message: 'Book Reserved!' };
    },
    getUserIssuedBooks: function (email) {
        const issued = JSON.parse(localStorage.getItem(this.ISSUED_KEY)) || [];
        return issued.filter(tx => tx.userEmail === email && tx.status === 'Borrowed');
    },

    getUserReservedBooks: function (email) {
        const reserved = JSON.parse(localStorage.getItem(this.RESERVED_KEY)) || [];
        return reserved.filter(res => res.userEmail === email && res.status === 'Active');
    },

    returnBook: function (txId) {
        const issued = JSON.parse(localStorage.getItem(this.ISSUED_KEY)) || [];
        const txIndex = issued.findIndex(tx => tx.id === txId);

        if (txIndex !== -1) {
            const tx = issued[txIndex];
            tx.status = 'Returned';
            tx.returnDate = new Date().toISOString();

            // Calculate fine
            const borrowDate = new Date(tx.borrowDate);
            const dueDate = new Date(borrowDate);
            dueDate.setDate(dueDate.getDate() + 7); // 7 days borrow limit
            const returnDate = new Date();
            let fine = 0;
            if (returnDate > dueDate) {
                const diffTime = Math.abs(returnDate - dueDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                fine = diffDays * 10; // 10 Rs per day fine
            }
            tx.fine = fine;

            // Increment book copies
            const books = this.getBooks();
            const bookIndex = books.findIndex(b => b.id == tx.bookId);
            if (bookIndex !== -1) {
                books[bookIndex].copies++;
                localStorage.setItem(this.BOOKS_KEY, JSON.stringify(books));
            }

            localStorage.setItem(this.ISSUED_KEY, JSON.stringify(issued));
            return { success: true, fine: fine };
        }
        return { success: false, message: 'Transaction not found' };
    },

    cancelReservation: function (resId) {
        const reserved = JSON.parse(localStorage.getItem(this.RESERVED_KEY)) || [];
        const resIndex = reserved.findIndex(r => r.id === resId);

        if (resIndex !== -1) {
            reserved[resIndex].status = 'Cancelled';
            localStorage.setItem(this.RESERVED_KEY, JSON.stringify(reserved));
            return { success: true };
        }
        return { success: false, message: 'Reservation not found' };
    },

    // Admin: Add a new book
    addBook: function (title, author, category, copies) {
        const books = this.getBooks();
        const total = parseInt(copies) || 1;
        books.push({
            id: Date.now(),
            title: title.trim(),
            author: author.trim(),
            category: category || 'General',
            copies: total,
            total: total,
            availableCopies: total
        });
        localStorage.setItem(this.BOOKS_KEY, JSON.stringify(books));
        return { success: true };
    },

    // Admin: Update an existing book
    updateBook: function (id, title, author, category, copies) {
        const books = this.getBooks();
        const book = books.find(b => b.id == id);
        if (!book) return { success: false };

        const newTotal = parseInt(copies) || book.total || book.copies;

        // Derive how many copies are currently issued (checked out)
        const oldTotal = book.total || book.copies;
        const oldAvailable = book.copies;
        const issuedCopies = Math.max(0, oldTotal - oldAvailable);

        // New available = new total minus still-issued copies, clamped to [0, newTotal]
        const newAvailable = Math.max(0, Math.min(newTotal, newTotal - issuedCopies));

        book.title = title.trim();
        book.author = author.trim();
        book.category = category || 'General';
        book.total = newTotal;
        book.copies = newAvailable;
        book.availableCopies = newAvailable;

        localStorage.setItem(this.BOOKS_KEY, JSON.stringify(books));
        return { success: true };
    },


    // Admin: Delete a book
    deleteBook: function (id) {
        let books = this.getBooks();
        books = books.filter(b => b.id != id);
        localStorage.setItem(this.BOOKS_KEY, JSON.stringify(books));
        return { success: true };
    },

    // Constants
    maxBorrowDays: 7,
    FINE_PER_DAY: 10,
    reservationValidityDays: 3
};

document.addEventListener("DOMContentLoaded", function () {
    LibraryManager.init();
});
