const mongoose = require("mongoose");
const db = require("../config/databaseConfig");

/* user schema */
const clinicNoteSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.ObjectId, ref: "Paitent" },
  dateTime: String,
  note: String,
});

const ClinicNote = db.model("ClinicNote", clinicNoteSchema);
/* export model */
module.exports = ClinicNote;