const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const stripe = require("stripe")('sk_test_51M8t4dBPikRh9K5xPXkCouuUOV2vSsodd0JvZwgjqiYcu85LQAcz2nxcvTtnOS6BAVLpCCSS7m3RVs3gCP1FlpvA00IbGf2SdW');
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
        const booksCategory = client.db('bookWorld').collection('category');
        const bookingCollection = client.db('bookWorld').collection('booking');
        const paymentsCollection = client.db('bookWorld').collection('payments');

        app.get('/books', async (req, res) => {
            const query = {}
            const cursor = booksCollection.find(query)
            const books = await cursor.toArray()
            res.send(books)
        })
        // add a product
        app.post('/books', async (req, res) => {
            const product = req?.body;
            const result = await booksCollection.insertOne(product);
            res.send(result);

        })
        // booking collection
        app.post('/bookings', async (req, res) => {
            const booking = req?.body;
            console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);

        })
        app.get('/bookings', async (req, res) => {
            const query = {}
            const cursor = bookingCollection.find(query)
            const booking = await cursor.toArray()
            res.send(booking)

        })
        app.get('/bookings/:id', async (req, res) => {
            const id = req?.params.id;
            const filter = { _id: ObjectId(id) };
            console.log(id);

            const booking = await bookingCollection.findOne(filter)
            // const booking = await cursor.toArray()
            res.send(booking)

        })
        app.delete('/books/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await booksCollection.deleteOne(filter);
            res.send(result);
        })
        app.get('/books/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await booksCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })
        app.get('/books/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await booksCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        })
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(filter);
            res.send(result);
        })
        app.get('/category', async (req, res) => {
            const query = {}
            const cursor = booksCategory.find(query)
            const category = await cursor.toArray()
            res.send(category)
        })
        // show products category wise
        app.get('/categories/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category: category }
            const cursor = booksCollection.find(query)
            const categoriesBook = await cursor.toArray()
            res.send(categoriesBook)
        })
        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await booksCollection.findOne(query);
            res.send(booking);

        })
        // get my product
        app.get('/categories/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category: category }
            const cursor = booksCollection.find(query)
            const categoriesBook = await cursor.toArray()
            res.send(categoriesBook)
        })
        app.get('/myproducts/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = booksCollection.find(query);
            const myproducts = await cursor.toArray();
            res.send(myproducts);

        })
        app.get('/myorders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = bookingCollection.find(query);
            const myorders = await cursor.toArray();
            res.send(myorders);

        })


        // payment

        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingCollection.updateOne(filter, updatedDoc)
            res.send(updatedResult);
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