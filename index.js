// Modules
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // to use fetch in node

const { Product } = require('./product');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mongo connection
mongoose.connect('mongodb://localhost:27017/foodapi', { useNewUrlParser: true, useUnifiedTopology: true }); // connect to mongoose

// View engine
app.set('views', path.join(__dirname));
app.set('view engine', 'ejs');

const apiKey = 'a3388d0b313b431ea699fa465c88c195'; // API key for the API, use your own

//Routes

// Home page
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

// Search API
app.post("/search", async function (req, res) {
  const foodResponse = await fetch(`https://api.spoonacular.com/food/search?query=${req.body.product}&number=1&apiKey=${apiKey}`, { method: 'GET' }); // Get product data
  const wantedResponse = await foodResponse.json(); // Get JSON data
  await Product.create(wantedResponse.searchResults[0].results[0]) // Save product to DB
  return res.redirect(`/product/${req.body.product}`); // Redirect
});

// Render API
// Note we're gonna get the data from the 3rd-party API again in the render page because it shouldn't be affected by any DB issues
app.get("/product/:query", async function (req, res) {
  try {
    const foodResponse = await fetch(`https://api.spoonacular.com/food/search?query=${req.params.query}&number=1&apiKey=${apiKey}`, { method: 'GET' }); // Get product data
    const wantedResponse = await foodResponse.json(); // Get JSON data
    console.log(wantedResponse.searchResults[0].results[0])
    return res.render('productPage', { product: wantedResponse.searchResults[0].results[0] }); // Render procut page
  } catch (error) {
    return res.send(error)
  }
});

// Start Server
app.listen(8000, function () {
  console.log("working");
});

