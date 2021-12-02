const express = require("express");
const datacreatorsControllers = require("../controllers/datacreatorsControllers");
const router = express.Router();

router.route("/").get(datacreatorsControllers.getNodes);
router.route("/:nodeId").get(datacreatorsControllers.getNode);
router.route("/:nodeId/jobs").get(datacreatorsControllers.getJobs);
module.exports = router;
