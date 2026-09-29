import express from 'express';
import pg from 'pg';
const app = express();
const PORT = process.env.PORT || 3000;
// 1. Tell Express to use the EJS template parsing engine (MISSING IN ORIGINAL)
app.set('view engine', 'ejs');

// 2. Serve your static files out of the public folder
app.use(express.static('public'));

// 3. Handle form and JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
});



// 4. Root homepage route path
app.get('/', (req, res) => {
    // Because 'view engine' is set, you don't even need the ".ejs" extension here!
    res.render("index", { title: "My App" });
});

app.get('/books/new', (req, res) => {
    res.render('books');
});

app.post('/books', (req, res) => {
    const { title, author, genre, notes } = req.body;

    // Do something with the form data, e.g., save it to a database
    // For now, we'll just log it
    console.log({ title, author, genre, notes });

    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
