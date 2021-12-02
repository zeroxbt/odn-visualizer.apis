const DataCreator = require("../models/DataCreator.js");

exports.getNodes = async (req, res, next) => {
  try {
    const nodes = await DataCreator.getNodes();
    res.status(200).json(nodes);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getNode = async (req, res, next) => {
  try {
    const nodeDetail = await DataCreator.getNodes(req.params.nodeId);
    const identities = await DataCreator.getIdentities(req.params.nodeId);
    const node = { ...nodeDetail[0], identities: identities };
    res.status(200).json(node);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    const jobs = await DataCreator.getJobs(req.params.nodeId);
    res.status(200).json(jobs);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
