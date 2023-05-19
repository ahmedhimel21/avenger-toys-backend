const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// avenger-toys
// U1QOOTc1Bv5iW9AR
// middleware
app.use(cors());
app.use(express.json());

app.get(
  '/',
  (req,res) =>{
    res.send('running')
  }
);


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hltgyxi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollections = client.db('toysDB').collection('toysCollection');

    // specific data get by subCategory
    app.get('/toys/:subCategory', async (req,res) =>{
      const cursor = toysCollections.find({subCategory: req.params.subCategory})
      const result = await cursor.toArray();
      res.send(result)
    })

    // specific data get by _id
    app.get('/viewDetails/:id', async(req,res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toysCollections.findOne(query);
      res.send(result)
    })

    // get all data
    app.get('/allToys', async(req,res) =>{
      const cursor = toysCollections.find().limit(20);
      const result = await cursor.toArray();
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(
  port, () =>{
    console.log(`Avenger toys API is running on port: ${port}`)
  }
)