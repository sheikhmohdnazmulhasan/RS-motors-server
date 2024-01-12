const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yopcie1.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } });

async function run() {

    try {

        await client.connect();

        const closeCollection = client.db('RS').collection('close');
        const shopCollection = client.db('RS').collection('shop');

        app.get('/deal-close/v1', async (req, res) => {
            const result = await closeCollection.find().toArray();
            res.send(result);
        });

        app.get('/cars/v1', async (req, res) => {
            const result = await shopCollection.find().toArray();
            res.send(result)
        });

        app.get('/portfolios/v1', async (req, res) => {
            const result = await closeCollection.find().toArray();
            res.send(result);
        })

        app.get('/deal-close/v1/:id', async (req, res) => {
            const id = req.params.id;
            const query = new ObjectId(id)
            const result = await closeCollection.findOne(query);
            res.send(result);
        });

        app.post('/deal-close/v1', async (req, res) => {
            const data = req.body;
            const result = await closeCollection.insertOne(data);
            res.send(result);
        });

        app.post('/add-car/v1', async (req, res) => {
            const data = req.body;
            const result = await shopCollection.insertOne(data);
            res.send(result);
        });

        app.delete('/car-delete/v1/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await shopCollection.deleteOne(query);
            res.send(result);
        });

        app.delete('/portfolio-delete/v1/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await closeCollection.deleteOne(query);
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => res.send('RS Server is Running'));

app.listen(port, () => console.log("RS Server is Running on PORT", port))