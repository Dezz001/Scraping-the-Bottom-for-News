var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Create a new NoteSchema object
var NoteSchema = new Schema({
  title: String,
  body: String
});

// Model for NoteSchema
var Note = mongoose.model("Note", NoteSchema);

// Export
module.exports = Note;
