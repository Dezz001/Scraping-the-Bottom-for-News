var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Scraping Tools
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var PORT = 3000;

// Initialize Express
var app = express();

// Morgan for logging requests
app.use(logger("dev"));

// Form Handler
app.use(bodyParser.urlencoded({ extended: true }));

// Public directory
app.use(express.static("public"));

// Connect to Mongodb
mongoose.connect("mongodb://localhost/scraping-the-bottom-for-news");


// A GET route to scrape NYT
app.get("/scrape", function(req, res) {
  // Grab NYT's body
  axios.get("https://www.nytimes.com/").then(function(response) {
    // Load body into Cheerio
    var $ = cheerio.load(response.data);

    // Testing
    console.log($(".theme-summary").children(".story-heading").text())

    // Grab headline-text articles
    $(".theme-summary").each(function(i, element) {
      // Save results in object
      var result = {};

      // Save title and links as properties for object
      result.title = $(this).children("a").children("span").text();
      result.link = $(this).children("a").attr("href");
      console.log(result);

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
    res.send("NYTs Scrape Completed");
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


// Route - Saving/Updating Articles and associated Notes.
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
