const Jobs = require("../models/Job");
const lodash = require("lodash");

exports.getAllJobs = async (req, res, next) => {
  try {
    const from = req.query.from;
    const to = req.query.to;
    const jobsDetail = await Jobs.getAll(from, to);
    const identities = await Jobs.getIdentities();
    const ids = lodash.groupBy(identities, "OfferId");
    const jobs = jobsDetail.map((j) =>
      !j.IsFinalized
        ? { ...j, holders: [] }
        : {
            ...j,
            holders: ids[j.OfferId].map(({ OfferId, ...rest }) => rest),
          }
    );
    res.status(200).json(jobs);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getAllJobs2 = async (req, res, next) => {
  try {
    const jobs = await Jobs.getAllActive();
    let dcNodes = (await Jobs.getDCNodes()).map((id) => {
      return { id: id.DCNodeId, group: 0 };
    });
    let dhNodes = (await Jobs.getDHNodes()).map((id) => {
      return { id: id.NodeId, group: 1 };
    });
    let offerIds = jobs.map((job) => {
      return { id: job.OfferId, group: 2 };
    });
    let nodes = dcNodes.concat(dhNodes, offerIds);

    let links = jobs.flatMap((job) => [
      { source: job.DCNodeId, target: job.OfferId },
      { source: job.NodeId1, target: job.OfferId },
      { source: job.NodeId2, target: job.OfferId },
      { source: job.NodeId3, target: job.OfferId },
    ]);

    res.status(200).json({ nodes, links });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getJobsById = async (req, res, next) => {
  try {
    console.log(req.params.id);
    console.log(req.params.id);
    console.log(req.params.id);
    console.log(req.params.id);
    const jobs = await Jobs.getJobsById(req.params.id);
    let dcNodes = (await Jobs.getDCNodesById(req.params.id)).map((id) => {
      return { id: id.DCNodeId, group: "dc" };
    });
    let dhNodes = (await Jobs.getDHNodesById(req.params.id)).map((id) => {
      return { id: id.NodeId, group: "dh" };
    });
    console.log("dh nodes : " + dhNodes.length);
    let offerIds = jobs.map((job) => {
      return { id: job.OfferId, group: "offer", chainId: job.BlockchainId };
    });
    console.log("offers : " + offerIds.length);
    console.log(
      "offers eth :" + offerIds.filter((o) => o.chainId === 1).length
    );
    let nodes = dcNodes.concat(dhNodes, offerIds);
    console.log("total length " + nodes.length);

    let links = jobs.flatMap((job) => [
      {
        source: job.DCNodeId,
        target: job.OfferId,
        strength: job.DCNodeId == req.params.id ? 0.001 : 0.1,
        type: "created",
      },
      {
        source: job.NodeId1,
        target: job.OfferId,
        strength: job.NodeId1 == req.params.id ? 0.001 : 0.01,
        type: "holds",
      },
      {
        source: job.NodeId2,
        target: job.OfferId,
        strength: job.NodeId1 == req.params.id ? 0.001 : 0.01,
        type: "holds",
      },
      {
        source: job.NodeId3,
        target: job.OfferId,
        strength: job.NodeId1 == req.params.id ? 0.001 : 0.01,
        type: "holds",
      },
    ]);

    res.status(200).json({ nodes, links });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getJobs24h = async (req, res, next) => {
  try {
    const jobs = await Jobs.getPast24h();
    let dcNodes = (await Jobs.getDCNodesPast24h()).map((id) => {
      return { id: id.DCNodeId, group: "dc" };
    });
    let dhNodes = (await Jobs.getDHNodesPast24h()).map((id) => {
      return { id: id.NodeId, group: "dh" };
    });
    let offerIds = jobs.map((job) => {
      return { id: job.OfferId, group: "offer", chainId: job.BlockchainId };
    });
    let nodes = dcNodes.concat(dhNodes, offerIds);

    let links = jobs.flatMap((job) => [
      {
        source: job.DCNodeId,
        target: job.OfferId,
        strength: 1,
        type: "created",
      },
      {
        source: job.NodeId1,
        target: job.OfferId,
        strength: 0.1,
        type: "holds",
      },
      {
        source: job.NodeId2,
        target: job.OfferId,
        strength: 0.1,
        type: "holds",
      },
      {
        source: job.NodeId3,
        target: job.OfferId,
        strength: 0.1,
        type: "holds",
      },
    ]);

    res.status(200).json({ nodes, jobs });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
