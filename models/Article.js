var mongoose = require("mongoose");

// Schema constructor
var Schema = mongoose.Schema;

// New Schema object
var ArticleSchema = new Schema({

  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },
  // // Article summary
  // summary: {
  //   type: String,
  //   required: true
  // },

  // Stores Note id
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var Article = mongoose.model("Article", ArticleSchema);

// Export Article
module.exports = Article;
