const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const stripe = require("stripe")(process.env.SECRET_KEYS_API_SK);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yopcie1.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } });

async function run() {

    try {

        // await client.connect();

        const closeCollection = client.db('RS').collection('close');
        const shopCollection = client.db('RS').collection('shop');
        const paymentCollection = client.db('RS').collection("payment");

        app.get('/deal-close/v1', async (req, res) => {
            const result = await closeCollection.find().toArray();
            res.send(result);
        });

        app.get('/cars/v1', async (req, res) => {
            const result = await shopCollection.find().toArray();
            res.send(result)
        });

        app.get('/cars/body-type/v1', async (req, res) => {
            const query = { title: req.query.query };
            const result = await shopCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/cars/body-type/v1', async (req, res) => {
            const query = { bodyType: req.query.query };
            const result = await shopCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/cars/fuel-type/v1', async (req, res) => {
            const query = { fuelType: req.query.query };
            const result = await shopCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/cars/transmission-type/v1', async (req, res) => {
            const query = { transmissionType: req.query.query };
            const result = await shopCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/cars/regional-spec/v1', async (req, res) => {
            const query = { regionalSpec: req.query.query };
            const result = await shopCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/cars/steering-side/v1', async (req, res) => {
            const query = { steeringSide: req.query.query };
            const result = await shopCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/cars/condition/v1', async (req, res) => {
            const query = { condition: req.query.query };
            const result = await shopCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/portfolios/v1', async (req, res) => {
            const result = await closeCollection.find().toArray();
            res.send(result);
        });

        app.get('/deal-close/v1/:id', async (req, res) => {
            const id = req.params.id;
            const query = new ObjectId(id)
            const result = await closeCollection.findOne(query);
            res.send(result);
        });

        app.get('/shop/v1/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await shopCollection.findOne(query);
            res.send(result);
        });

        app.get('/pays', async (req, res) => {
            let query = {};

            if (req.query.status) {
                query = { status: req.query.status }
            }

            const result = await paymentCollection.find(query).toArray();
            res.send(result)
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

        app.patch('/edit-car/v1/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const data = req.body;
            const updatedDoc = {
                $set: { title: data.title, fuelType: data.fuelType, year: data.year, mileage: data.mileage, price: data.price, bodyType: data.bodyType, condition: data.condition, transmissionType: data.transmissionType, regionalSpec: data.regionalSpec, steeringSide: data.steeringSide, photo: data.photo }
            };

            const result = await shopCollection.updateOne(filter, updatedDoc);
            res.send(result);

        });

        app.patch('/edit-portfolio/v1/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const data = req.body;
            const updatedDoc = {
                $set: { title: data.title, fuelType: data.fuelType, year: data.year, mileage: data.mileage, price: data.price, bodyType: data.bodyType, condition: data.condition, transmissionType: data.transmissionType, regionalSpec: data.regionalSpec, steeringSide: data.steeringSide, photo: data.photo }
            };

            const result = await closeCollection.updateOne(filter, updatedDoc);
            res.send(result);

        });

        app.patch('/pays/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: { status: "Verified" }
            };

            const result = await paymentCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        // Payment Intent
        app.post("/payment-intent", async (req, res) => {
            const { price } = req.body;
            const amount = parseInt(price * 100);
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_types: ["card"],
            });
            res.send({ clientSecret: paymentIntent.client_secret });
        });

        // Payment post
        app.post('/payments', async (req, res) => {
            const payment = req.body
            const paymentResult = await paymentCollection.insertOne(payment)

            res.send(paymentResult)
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