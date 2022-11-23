const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
// const port = process.env.REACT_APP_API_URL;
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Wow server is running');
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});