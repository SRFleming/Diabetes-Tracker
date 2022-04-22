const express = require("express");
const router = express.Router();
const patientAuth = require("./authMiddleware.js").patientAuth;
const Health = require("../models/healthModel.js");
const Data = require("../models/dataModel.js");

/* patient login */
router.get("/", patientAuth, (req, res) => {
  res.redirect("/patient/dashboard");
});

/* patient dashboard */
router.get("/dashboard", patientAuth, async (req, res) => {
  /* authenticated patient */
  const patient = req.user;
  /* current date */
  const date = new Date().toLocaleDateString("en-AU", {
    timeZone: "Australia/Melbourne",
  });
  /* health records */
  const todayRecord = await Health.findOne({
    patient: patient._id,
    date: date,
  })
    .populate("bgl")
    .populate("insulin")
    .populate("weight")
    .populate("exercise")
    .lean();
  /* calculate data entry progress */
  const currentProg = await progress(patient, date);
  /* render the patient dashboard page */
  res.render("ptDashboard", {
    healthRd: todayRecord,
    patient: patient.firstName,
    style: "ptDashboard.css",
    progress: currentProg,
  });
});

/* addHealth page */
router.get("/addHealth", patientAuth, async (req, res) => {
  /* authenticated patient */
  const patient = req.user;
  /* current date time */
  const date = new Date().toLocaleDateString("en-AU", {
    timeZone: "Australia/Melbourne",
  });
  /* health records */
  const todayRecord = await Health.findOne({
    patient: patient._id,
    date: date,
  })
    .populate("bgl")
    .populate("insulin")
    .populate("weight")
    .populate("exercise")
    .lean();
  /* render the page */
  res.render("ptAddData", {
    healthRd: todayRecord,
    required: Object.keys(patient.dataSet),
    style: "ptAddData.css",
  });
});

/* patient create or update health record */
router.post("/addHealth/:type", patientAuth, async (req, res) => {
  const patient = req.user;
  const dataType = req.params.type;
  const figure = req.body[dataType];
  const comment = req.body[`${dataType}Comment`];
  /* current date */
  const today = new Date();
  const date = today.toLocaleDateString("en-AU", {
    timeZone: "Australia/Melbourne",
  });
  const time = today.toLocaleTimeString("en-AU", {
    timeZone: "Australia/Melbourne",
  });
  /* find the document */
  const healthDoc = await Health.findOne({
    patient: patient._id,
    date: date,
  }).exec();
  /* create new health record */
  if (!healthDoc) {
    /* create data entry */
    const newDataEntry = new Data({
      figure: figure,
      time: time,
      clinician: patient.clinician,
      patient: {
        id: patient._id,
        fullName: `${patient.firstName} ${patient.lastName}`,
      },
      about: dataType,
      comment: comment,
    });
    const savedDataEntry = await newDataEntry.save();
    /* create health record */
    const newDoc = new Health({
      date: date,
      patient: patient._id,
      [dataType]: savedDataEntry._id,
    });
    await newDoc.save();
    res.redirect("/patient/addHealth");
    /* update health record*/
  } else {
    /* create data entry */
    const newDataEntry = new Data({
      figure: figure,
      time: time,
      clinician: patient.clinician,
      patient: {
        id: patient._id,
        fullName: `${patient.firstName} ${patient.lastName}`,
      },
      about: dataType,
      comment: comment,
    });
    const savedDataEntry = await newDataEntry.save();
    /* update health record */
    healthDoc[dataType] = savedDataEntry._id;
    await healthDoc.save();
    res.redirect("/patient/addHealth");
  }
});

/* calculate the progress of today's data entry */
const progress = async (patient, today) => {
  /* retrieve today's health record & required data */
  const record = await Health.findOne({
    patient: patient._id,
    date: today,
  }).lean();
  const requiedEntry = Object.keys(patient.dataSet).length;
  if (record) {
    const keys = Object.keys(record);
    var completed = 0;
    /* calculate engagement rate */
    for (const key in patient.dataSet) {
      if (keys.includes(key)) {
        completed++;
      }
    }
    return Math.floor((completed / requiedEntry) * 100);
  } else {
    return 0;
  }
};

module.exports = router;
