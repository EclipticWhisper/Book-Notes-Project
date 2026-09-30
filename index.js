import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
const app = express();
const PORT = process.env.PORT || 3000;
// 1. Tell Express to use the EJS template parsing engine (MISSING IN ORIGINAL)
app.set('view engine', 'ejs');

// 2. Serve your static files out of the public folder
app.use(express.static('public'));

// 3. Handle form and JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
dotenv.config();

const db = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
    max: 10,
    idleTimeoutMillis: 30000,
});

async function getItems() {
    const result = await db.query("SELECT id, title, author, rating,date_read, notes FROM books ORDER BY id ASC");
    return result.rows;
}

// 4. Root homepage route path
app.get('/', async (req, res) => {
    // Because 'view engine' is set, you don't even need the ".ejs" extension here!
    const items = await getItems();
    res.render("books", { books: items, currentSort: req.query.sort || 'recency' });
});

// Changed app.get to app.post to handle form submissions
app.post('/books/new', async (req, res) => {
    // 1. Destructure the values from the request body
    const { title, author, rating, date_read, notes } = req.body;

    try {
        // 2. Define the proper SQL query text
        const queryText = 'INSERT INTO books (title, author, rating, date_read, notes) VALUES ($1, $2, $3, $4, $5)';
        const values = [title, author,rating, date_read, notes];

        // 3. Execute the query using your pg pool instance
        await db.query(queryText, values);

        // 4. Redirect the user back to the homepage to see their updated list
        res.redirect('/');
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Error saving book to database");
    }

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
