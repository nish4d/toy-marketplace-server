const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin:"*",
    methods: "GET,POST,PATCH,DELETE,PUT",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  })
);
app.use(express.json());

// mongo db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yngd7m6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client.db("ToyMarket").collection("ToyService");

    // const indexKeys = { toyName: 1 };
    // const indexOptions = { name: "toyCategory" };
    // const results = await toyCollection.createIndex(indexKeys, indexOptions);

    // limit all get
    app.get("/toys", async (req, res) => {
      const result = await toyCollection.find().limit(20).toArray();
      res.send(result);
    });

    // no limit all get
    app.get("/toysLimit", async (req, res) => {
      const result = await toyCollection.find().toArray();
      res.send(result);
    });

    // single get
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    // search
    app.get("/toySearch/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyCollection
        .find({
          $or: [{ toyName: { $regex: text, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    // single post
    app.post("/toys", async (req, res) => {
      const cursor = req.body;
      const result = await toyCollection.insertOne(cursor);
      res.send(result);
    });

    //email by data
    // app.get("/toyEmail/:email", async (req, res) => {
    //   //   console.log(req.params.email);
    //   const result = await toyCollection
    //     .find({
    //       sellerEmail: req.params.email,
    //     })
    //     .sort({
    //       price: -1
    //     })
    //     .toArray();
    //   res.send(result);
    // });


    // sort and email
    app.get('/toysEmailSort', async (req, res) => {
      const email = Object.values(req.query)[0]
      const sort = Object.values(req.query)[1]
      const query = {sellerEmail: email}
      const result = await toyCollection.find(query).sort({price:sort}).toArray();
      res.send(result);
    })


    // category by data
    app.get("/toyCategory/:category", async (req, res) => {
      //   console.log(req.params.email);
      const result = await toyCollection
        .find({
          subCategory: req.params.category,
        })
        .toArray();
      res.send(result);
    });

    // update
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateToy = req.body;
      const data = {
        $set: {
          toyName: updateToy.toyName,
          sellerName: updateToy.sellerName,
          sellerEmail: updateToy.sellerEmail,
          pictureUrl: updateToy.pictureUrl,
          subCategory: updateToy.subCategory,
          price: updateToy.price,
          rating: updateToy.rating,
          quantity: updateToy.quantity,
          description: updateToy.description,
        },
      };
      const result = await toyCollection.updateOne(filter, data, options);
      res.send(result);
    });

    // delete
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy Server Running.....");
});

app.listen(port, () => {
  console.log(`toy server listening on ${port}`);
});
