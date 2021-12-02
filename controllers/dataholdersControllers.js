const DataHolder = require("../models/DataHolder.js");

exports.getNodes = async (req, res, next) => {
  try {
    const nodes = await DataHolder.getNodes();
    res.status(200).json(nodes);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getNode = async (req, res, next) => {
  try {
    const nodeDetail = await DataHolder.getNodes(req.params.nodeId);
    const identities = await DataHolder.getIdentities(req.params.nodeId);
    const node = { ...nodeDetail[0], identities: identities };
    res.status(200).json(node);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    const jobs = await DataHolder.getJobs(req.params.nodeId);
    res.status(200).json(jobs);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
