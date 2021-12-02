const Nodes = require("../models/Node.js");

exports.getNodes = async (req, res, next) => {
  try {
    const nodes = await Nodes.getNodes();
    res.status(200).json(nodes);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getNode = async (req, res, next) => {
  try {
    const nodeDetail = await Nodes.getNodes(req.params.nodeId);
    const identities = await Nodes.getIdentities(req.params.nodeId);
    const node = { ...nodeDetail[0], identities: identities };
    res.status(200).json(node);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getTokenTransfers = async (req, res, next) => {
  try {
    const transfers = await Nodes.getTokenTransfers(req.params.nodeId);
    transfers.forEach(
      (t) =>
        (t.TransactionUrl = t.TransactionUrl.replace("{0}", t.TransactionHash))
    );
    res.status(200).json(transfers);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
