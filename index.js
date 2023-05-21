const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

app.get(
  '/',
  (req, res) => {
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
    // await client.connect();

    const toysCollections = client.db('toysDB').collection('toysCollection');

    // specific data get by subCategory
    app.get('/toys/:subCategory', async (req, res) => {
      const cursor = toysCollections.find({ subCategory: req.params.subCategory })
      const result = await cursor.toArray();
      res.send(result)
    })

    // specific data get by _id
    app.get('/viewDetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollections.findOne(query);
      res.send(result)
    })

    // get all data
    app.get('/allToys', async (req, res) => {
      const cursor = toysCollections.find().limit(20);
      const result = await cursor.toArray();
      res.send(result)
    })

    // post
    app.post('/addAToy', async (req, res) => {
      const addToy = req.body;
      const result = await toysCollections.insertOne(addToy);
      res.send(result)
      console.log(addToy);
    })

    // read some data
    app.get('/addAToy', async (req, res) => {
      try {
        if (req.query.sellerEmail) {
          const query = { sellerEmail: req.query.sellerEmail }
          const sort = req?.query?.sort == 'true' ? 1 : -1;
          const result = await toysCollections.find(query).sort({ price: sort }).toArray()
          return res.send(result)
        }
        else{
          res.status(404).send({error: true, message: 'User info not found'})
        }
      }
      catch(error){
        res.status(401).send({error: true, message: 'unauthorized'})
      }
    })

    // delete operation
    app.delete('/delete/:id',async(req,res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toysCollections.deleteOne(query);
      res.send(result);
    })

    // update operation
    app.put('/update/:id',async(req,res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const toy = req.body;
      const updatedToy = {
        $set: {
          price: toy.price,
          availableQuantity: toy.availableQuantity,
          details: toy.details
        }
      }
      const result = await toysCollections.updateOne(filter,updatedToy,options);
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
  port, () => {
    console.log(`Avenger toys API is running on port: ${port}`)
  }
)