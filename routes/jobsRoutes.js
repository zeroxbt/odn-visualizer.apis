const express = require("express");
const jobsController = require("../controllers/jobsControllers")
const router = express.Router();

// @route GET - /jobs/
router.route("/").get(jobsController.getAllJobs);

router.route("/:id").get(jobsController.getJobsById);

router.route("/time/24h").get(jobsController.getJobs24h);

module.exports = router;