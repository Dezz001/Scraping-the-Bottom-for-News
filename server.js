var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Requirments
var db = require("./models");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan for logging requests
app.use(logger("dev"));

// Form Handler
app.use(bodyParser.urlencoded({ extended: true }));

// Use public folder as a directory
app.use(express.static("public"));

// Connect to Mongo DB
mongoose.connect("mongodb://localhost/scraping-the-bottom-for-news");


// A GET route to scrape CNN
app.get("/scrape", function(req, res) {
  // Grab CNN's body
  axios.get("https://www.cnn.com/").then(function(response) {
    // Load body into Cheerio
    var $ = cheerio.load(response.data);

    // Grab headline-text articles
    $("cd__headline-text article div h3").each(function(i, element) {
      // Save results in object
      var result = {};

      // Save title and links as properties for object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Create's a new Article from result variable
      db.Article.create(result)
        .then(function(dbArticle) {
          
          // Testing to see new Article
          console.log(dbArticle);
        })
        .catch(function(err) {
          // Return Errors
          return res.json(err);
        });
    });

    // When sucessfully scrapped the message below will be returned
    res.send("CNN Scrape Completed");
  });
});


// Route - Getting Articles from DB
app.get("/articles", function(req, res) {
  // Find all Articles
  db.Article.find({})
    .then(function(dbArticle) {
      // Send Articles back to client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // Send Errors back to client
      res.json(err);
    });
});


// Route - Grabbing Articles by ID along with its Note.
app.get("/articles/:id", function(req, res) {
  
  db.Article.findOne({ _id: req.params.id })

    .populate("note")
    .then(function(dbArticle) {

      res.json(dbArticle);
    })
    .catch(function(err) {

      res.json(err);
    });
});


// Route - Saving/Updating an Articles associated Note.
app.post("/articles/:id", function(req, res) {
  
  db.Note.create(req.body)
    .then(function(dbNote) {

      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {

      res.json(dbArticle);
    })
    .catch(function(err) {
  
      res.json(err);
    });
});


// Start Server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
