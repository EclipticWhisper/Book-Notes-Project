  <!-- Sorting Filter Controller Form -->

    <form class="sort-bar" action="/" method="GET">
        <select name="sort" onchange="this.form.submit()">
            <option value="recency" <%= currentSort === 'recency' ? 'selected' : '' %>>Sort by Recency</option>
            <option value="rating" <%= currentSort === 'rating' ? 'selected' : '' %>>Sort by Rating</option>
            <option value="title" <%= currentSort === 'title' ? 'selected' : '' %>>Sort by Title</option>
        </select>
    </form>


    <!-- Master Book Collection Loop Matrix -->
    <% if (books && books.length > 0) { %>
        <% books.forEach(book => { %>
            <article class="book-card">

                <!-- Dynamic Open Library Cover Art Endpoint Integration Matrix -->
                <img src="https://openlibrary.org<%= book.isbn %>-M.jpg?default=false"
                     alt="<%= book.title %>"
                     onerror="this.onerror=null; this.src='https://placehold.co';">

                <!-- Core Stored PostgreSQL Variables Data Ingestion Blocks -->
                <div class="book-card__content">
                    <h2><%= book.title %></h2>
                    <p>Author: <%= book.author %></p>
                    <p>Rating: <%= book.rating %>/10</p>
                    <p>Date Read: <%= new Date(book.date_read).toLocaleDateString() %></p>
                    <p><%= book.notes %></p>

                    <!-- Database DELETE Action Trigger -->
                    <form action="/books/<%= book.id %>?_method=DELETE" method="POST">
                        <button type="submit" onclick="return confirm('Delete entry?')">Delete</button>
                    </form>
                </div>
            </article>
        <% }) %>
    <% } else { %>
        <p class="empty-state">No books added yet. Start your collection with a new reading note.</p>
    <% } %>
