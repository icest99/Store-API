require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();
const errorHandler = require('./middleware/error-handler');
const routeNotFoundHandler = require('./middleware/not-found');
const port = process.env.PORT || 3000;
const connectDB = require('./db/connect');
const productsRouter = require('./routes/products');


//middleware
app.use(express.json());

//routes
app.get('/', (req, res) =>{
    res.send('<h1>Store API</h1><a href="/api/v1/products">products route</a>')
});
app.use('/api/v1/products', productsRouter)

//products route
app.use(errorHandler);
app.use(routeNotFoundHandler);

const startServer = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log(`Server is listening on port ${port}...`))
    } catch (error) {
        console.log(error)
    }
}

startServer();