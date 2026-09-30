import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import axios from 'axios';

// 1. ALWAYS initialize dotenv before using any process.env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Tell Express to use the EJS template parsing engine
app.set('view engine', 'ejs');

// 3. Serve static files and handle payloads
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 4. Database configuration
const db = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
    max: 10,
    idleTimeoutMillis: 30000,
});

// Updated to grab your newly required cover_url column from the database
async function getItems() {
    const result = await db.query("SELECT id, title, author, rating, date_read, isbn, notes, cover_url FROM books ORDER BY id ASC");
    return result.rows;
}

// 5. Root homepage route path
app.get('/', async (req, res) => {
    try {
        const items = await getItems();
        res.render("index", { books: items, currentSort: req.query.sort || 'recency' });
    } catch (err) {
        console.error("Failed to fetch books:", err);
        res.status(500).send("Database error loading homepage");
    }
});

app.get('/add', (req, res) => {
    res.render('books');
});

// 6. Handle form submissions with integrated Axios API checking middleware
app.post('/add', async (req, res) => {
    const { title, author, rating, date_read, notes, isbn } = req.body;

    // Clean up the input text string by stripping unexpected spaces or punctuation dashes
    const cleanIsbn = isbn ? isbn.replace(/[- ]/g, "") : "";
    
    // Default standard image if Open Library down or missing asset index matches
    let coverUrl = `https://placehold.co/600x800?text=${encodeURIComponent(title)}`;

    if (cleanIsbn) {
        try {
            // Use Axios to call the data structure endpoint with an automated 3-second network drop timeout failsafe config
            const apiResponse = await axios.get(
                `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`,
                { timeout: 3000 } 
            );

            const bookKey = `ISBN:${cleanIsbn}`;

            // Check if the response contains data and has a cover property array on file
            if (apiResponse.data && apiResponse.data[bookKey] && apiResponse.data[bookKey].cover) {
                coverUrl = apiResponse.data[bookKey].cover.medium; 
            } else {
                // Alternative endpoint format fallback layer strategy matching our structural rules if missing imagery dictionary metadata maps
                coverUrl = `https://covers.openlibrary.org/isbn/${cleanIsbn}-M.jpg?default=false`;
            }
        } catch (apiErr) {
            console.warn("Axios API fetch sequence interrupted or timed out. Defaulting to clean image URL template configurations.", apiErr.message);
            coverUrl = `https://covers.openlibrary.org/isbn/${cleanIsbn}-M.jpg?default=false`;
        }
    }

    try {
        // Save everything—including your managed, clean backend string image token—into the database tables structure layer
        const queryText = 'INSERT INTO books (title, author, rating, date_read, isbn, notes, cover_url) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        const values = [title, author, rating, date_read, cleanIsbn, notes, coverUrl];

        await db.query(queryText, values);
        res.redirect('/');
    } catch (err) {
        console.error("Database persistence logic insertion execution failed:", err);
        res.status(500).send("Error saving book to database storage node clusters.");
    }
});

app.post('/books/:id/delete', async (req, res) => {
    const bookId = req.params.id;
    try {
        await db.query('DELETE FROM books WHERE id = $1', [bookId]);
        res.redirect('/');
    } catch (err) {
        console.error("Database deletion error:", err);
        res.status(500).send("Error dropping book entity rows.");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
