const express = require("express");
const nodesController = require("../controllers/nodesControllers");
const router = express.Router();

// @route GET - /nodes/
router.route("/").get(nodesController.getNodes);
router.route("/:nodeId").get(nodesController.getNode);
router.route("/:nodeId/tokentransfers").get(nodesController.getTokenTransfers);
module.exports = router;
