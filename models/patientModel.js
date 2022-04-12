const mongoose = require("mongoose");
const db = require("../config/databaseConfig");

/* user schema */
const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    require: [true],
  },
  type: {
    type: String,
    require: [true],
  },
  clinician: {
    type: mongoose.Schema.ObjectId,
    ref: "Clinician",
    require: [true],
  },
  email: {
    type: String,
    require: [true],
  },
  dataSet: {
    bgl: { min: String, max: String },
    weight: { min: String, max: String },
    insulin: { min: String, max: String },
    exercise: { min: String, max: String },
  },
  startDate: Number,
  dayscompleted: Number,
  supportMsg: String,
  lastName: String,
  dob: String,
  gender: String,
  hash: String,
  salt: String,
});

const Patient = db.model("Patient", patientSchema);
/* export model */
module.exports = Patient;
