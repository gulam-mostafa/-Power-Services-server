const express = require('express')
const app = express();
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId, OrderedBulkOperation } = require('mongodb');
const port = process.env.PORT || 5000;

//middleware  
app.use(cors())
app.use(express.json());
console.log(process.env.DB_USER)
console.log(process.env.DB_PASSWORD)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pjwtwko.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('services').collection('users')
        const reviewCollection = client.db('services').collection('reviews')

        app.post('/users', async (req, res) => {
            const user = req.body
            console.log(user);
            const result = await serviceCollection.insertOne(user);
            res.send(result)

        })

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find()
            const services = await cursor.sort({ createdAt: -1 }).toArray();
            res.send(services);
        })
        app.get('/servicesthree', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find()
            const services = await cursor.limit(3).sort({ createdAt: -1 }).toArray();
            res.send(services);
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })
        // review api  
        // for services id and review data load 
        app.get('/review/:id', async (req, res) => {

            const id = req.params.id;
            const query = { service: id }
            const cursor = reviewCollection.find(query).sort({ date: -1 });
            const reviews = await cursor.sort({ createdAt: -1 }).toArray();
            res.send(reviews)
        })

        // for email
        app.get('/reviews', async (req, res) => {
            console.log(req.query.email)
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.sort({ createdAt: -1 }).toArray();
            res.send(reviews)
        })
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result);
        });
        app.get('/myreview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.findOne(query);
            res.send(result)
        })
        app.put('/myreview/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const user = req.body;
            const option = { upsert: true }

            const updatedUser = {
                $set: {
                    message: user.message
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedUser, option);
            res.send(result);
            console.log(updatedUser)
        })

        app.delete('/myreview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId }
            const result = await reviewCollection.deleteOne(query);
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send(' Node server is running')
})
app.listen(port, () => {
    console.log(`somple site is running on port ${port}`)
})