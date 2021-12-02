const express = require("express");
const dataholdersControllers = require("../controllers/dataholdersControllers");
const router = express.Router();

router.route("/").get(dataholdersControllers.getNodes);
router.route("/:nodeId").get(dataholdersControllers.getNode);
router.route("/:nodeId/jobs").get(dataholdersControllers.getJobs);
module.exports = router;
