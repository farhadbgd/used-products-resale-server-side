const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kliinjg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// crud functions
async function run() {
    try {
        // collections
        const booksCollection = client.db('bookWorld').collection('books');

        app.get('/books', async (req, res) => {
            const query = {}
            const cursor = booksCollection.find(query)
            const books = await cursor.toArray()

            res.send(books)
        })



    }
    finally {

    }
}
run().catch(console.log);











app.get('/', (req, res) => {
    res.send('Wow server is running');
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});