const db = require("../config/db");

class Job {
  static getAll(from, to) {
    let timeFilter = "";
    if (from && from !== null && to && to !== null) {
      timeFilter = " WHERE FinalizedTimestamp BETWEEN ? AND ?";
    } else if (from && from !== null) {
      timeFilter = " WHERE FinalizedTimestamp >= ?";
    }
    console.log(from);
    console.log(to);
    const sql =
      "SELECT" +
      "\n" +
      "    DCNodeId," +
      "\n" +
      "    OfferId," +
      "\n" +
      "    DATE_FORMAT(CreatedTimestamp, '%Y-%m-%dT%h:%m:%s') AS CreatedTimestamp," +
      "\n" +
      "    FinalizedTimestamp," +
      "\n" +
      "    DataSetSizeInBytes," +
      "\n" +
      "    HoldingTimeInMinutes," +
      "\n" +
      "    TokenAmountPerHolder," +
      "\n" +
      "    IsFinalized," +
      "\n" +
      "    (CASE WHEN(IsFinalized = false) " +
      "\n" +
      '            THEN "Not started" ' +
      "\n" +
      "            ELSE " +
      "\n" +
      "                CASE WHEN(NOW() <= DATE_Add(FinalizedTimeStamp, INTERVAL + HoldingTimeInMinutes MINUTE))" +
      "\n" +
      '                    THEN "Active"' +
      "\n" +
      '                    ELSE "Completed"' +
      "\n" +
      "                END" +
      "\n" +
      "                " +
      "\n" +
      "         END) as Status," +
      "\n" +
      "    DATE_FORMAT(DATE_Add(FinalizedTimeStamp, INTERVAL + HoldingTimeInMinutes MINUTE), '%Y-%m-%dT%h:%m:%s') AS EndTimestamp," +
      "\n" +
      "    B.Name AS BlockchainName" +
      "\n" +
      "FROM" +
      "\n" +
      "    Offer O JOIN Blockchain B ON O.BlockchainId = B.Id" +
      "\n" +
      timeFilter;

    return db.query(sql, [from, to]);
  }

  static getIdentities() {
    const sql =
      "SELECT " +
      "\n" +
      "    oh.OfferId, " +
      "\n" +
      "    i.Identity, " +
      "\n" +
      "    i.NodeId" +
      "\n" +
      "FROM Identity i" +
      "\n" +
      "    JOIN blockchain bc ON bc.id = i.blockchainid" +
      "\n" +
      "    JOIN OfferHolders oh ON oh.Holder = i.Identity" +
      "\n" +
      "WHERE IsLatest = 1";

    return db.query(sql);
  }

  static getAll2() {
    const sql =
      "SELECT\n" +
      "    DATE_ADD(f.`Timestamp`, INTERVAL + c.`HoldingTimeInMinutes` MINUTE) as `EndTimestamp`,\n" +
      "    `DCNodeId`,\n" +
      "    (select distinct `NodeId` from `Identity` where `Identity` = `Holder1`) as NodeId1,\n" +
      "    (select distinct `NodeId` from `Identity` where `Identity` = `Holder2`) as NodeId2,\n" +
      "    (select distinct `NodeId` from `Identity` where `Identity` = `Holder3`) as NodeId3,\n" +
      "    f.`OfferId`,\n" +
      "    f.`BlockchainId`\n" +
      "from\n" +
      "    `OfferCreated` as c join `OfferFinalized` as f on f.`OfferId` = c.`OfferId`";

    return db.query(sql);
  }

  static getPast24h() {
    const sql =
      "SELECT\n" +
      "    DATE_ADD(f.`Timestamp`, INTERVAL + c.`HoldingTimeInMinutes` MINUTE) as `EndTimestamp`,\n" +
      "    `DCNodeId`,\n" +
      "    (select distinct `NodeId` from `Identity` where `Identity` = `Holder1`) as NodeId1,\n" +
      "    (select distinct `NodeId` from `Identity` where `Identity` = `Holder2`) as NodeId2,\n" +
      "    (select distinct `NodeId` from `Identity` where `Identity` = `Holder3`) as NodeId3,\n" +
      "    f.`OfferId`,\n" +
      "    f.`BlockchainId`\n" +
      "from\n" +
      "    `OfferCreated` as c join `OfferFinalized` as f on f.`OfferId` = c.`OfferId`\n" +
      "where\n" +
      "    f.`Timestamp` >=  NOW() - INTERVAL 1 DAY";

    return db.query(sql);
  }

  static getAllActive() {
    const sql =
      "select\n" +
      "    DATE_ADD(f.`Timestamp`, INTERVAL + c.`HoldingTimeInMinutes` MINUTE) as `EndTimestamp`,\n" +
      "    `DCNodeId`,\n" +
      "    (select distinct `NodeId` from `Identity` where `Identity` = `Holder1`) as NodeId1,\n" +
      "    (select distinct `NodeId` from `Identity` where `Identity` = `Holder2`) as NodeId2,\n" +
      "    (select distinct `NodeId` from `Identity` where `Identity` = `Holder3`) as NodeId3,\n" +
      "    f.`OfferId`,\n" +
      "    f.`BlockchainId`\n" +
      "from\n" +
      "    `OfferCreated` as c join `OfferFinalized` as f on f.`OfferId` = c.`OfferId`\n" +
      "where\n" +
      "    DATE_ADD(f.`Timestamp`, INTERVAL + c.`HoldingTimeInMinutes` MINUTE) > NOW()";
    return db.query(sql);
  }

  static getDCNodes() {
    const sql =
      "SELECT DISTINCT `DCNodeId` " +
      "FROM `OfferFinalized` `f` JOIN `OfferCreated` as `c` on c.`OfferId` = f.`OfferId`";
    return db.query(sql);
  }

  static getDHNodes() {
    const sql =
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder1`) as NodeId from `OfferFinalized`\n" +
      "union\n" +
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder2`) from `OfferFinalized`\n" +
      "union\n" +
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder3`) from `OfferFinalized`";
    return db.query(sql);
  }

  static getDCNodesPast24h() {
    const sql =
      "SELECT DISTINCT `DCNodeId` " +
      "FROM `OfferFinalized` `f` JOIN `OfferCreated` as `c` on c.`OfferId` = f.`OfferId` where f.`Timestamp` >=  NOW() - INTERVAL 1 DAY";
    return db.query(sql);
  }

  static getDHNodesPast24h() {
    const sql =
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder1`) as NodeId from `OfferFinalized` where `Timestamp` >=  NOW() - INTERVAL 1 DAY\n" +
      "union\n" +
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder2`) from `OfferFinalized` where `Timestamp` >=  NOW() - INTERVAL 1 DAY\n" +
      "union\n" +
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder3`) from `OfferFinalized` where `Timestamp` >=  NOW() - INTERVAL 1 DAY";
    return db.query(sql);
  }

  static getAllNodesPast24h() {
    const sql =
      "SELECT DISTINCT `DCNodeId`as NodeId " +
      "FROM `OfferFinalized` `f` JOIN `OfferCreated` as `c` on c.`OfferId` = f.`OfferId` where f.`Timestamp` >=  NOW() - INTERVAL 1 DAY\n" +
      "union\n" +
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder1`) from `OfferFinalized` where `Timestamp` >=  NOW() - INTERVAL 1 DAY\n" +
      "union\n" +
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder2`) from `OfferFinalized` where `Timestamp` >=  NOW() - INTERVAL 1 DAY\n" +
      "union\n" +
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder3`) from `OfferFinalized` where `Timestamp` >=  NOW() - INTERVAL 1 DAY";
    return db.query(sql);
  }

  static getJobsById(id) {
    const sql =
      "SELECT\n" +
      "                DATE_ADD(f.`Timestamp`, INTERVAL + c.`HoldingTimeInMinutes` MINUTE) as `EndTimestamp`,\n" +
      "                `DCNodeId`,\n" +
      "                (select distinct `NodeId` from `Identity` where `Identity` = `Holder1`) as NodeId1,\n" +
      "                (select distinct `NodeId` from `Identity` where `Identity` = `Holder2`) as NodeId2,\n" +
      "                (select distinct `NodeId` from `Identity` where `Identity` = `Holder3`) as NodeId3,\n" +
      "                f.`OfferId`,\n" +
      "                f.`BlockchainId`\n" +
      "            from\n" +
      "                `OfferCreated` as c join `OfferFinalized` as f on f.`OfferId` = c.`OfferId` \n" +
      "where `DCNodeId` = ?" +
      "\tor `Holder1` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder2` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder3` in (select distinct `Identity` from `Identity` where `NodeId` = ?)";

    return db.query(sql, [id, id, id, id]);
  }

  static getDCNodesById(id) {
    const sql =
      "SELECT distinct\n" +
      "                `DCNodeId`\n" +
      "            from\n" +
      "                `OfferCreated` as c join `OfferFinalized` as f on f.`OfferId` = c.`OfferId` \n" +
      "where `DCNodeId` = ?" +
      "\tor `Holder1` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder2` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder3` in (select distinct `Identity` from `Identity` where `NodeId` = ?)";
    return db.query(sql, [id, id, id, id]);
  }

  static getDHNodesById(id) {
    const sql =
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder1`) as NodeId\n" +
      "from\n" +
      "                `OfferCreated` as c join `OfferFinalized` as f on f.`OfferId` = c.`OfferId`\n" +
      "where `DCNodeId` = ?" +
      "\tor `Holder1` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder2` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder3` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "union\n" +
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder2`) as NodeId\n" +
      "from\n" +
      "                `OfferCreated` as c join `OfferFinalized` as f on f.`OfferId` = c.`OfferId`\n" +
      "where `DCNodeId` = ?" +
      "\tor `Holder1` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder2` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder3` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "union\n" +
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder3`) as NodeId\n" +
      "            from\n" +
      "                `OfferCreated` as c join `OfferFinalized` as f on f.`OfferId` = c.`OfferId`\n" +
      "where `DCNodeId` = ?" +
      "\tor `Holder1` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder2` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder3` in (select distinct `Identity` from `Identity` where `NodeId` = ?)";

    return db.query(sql, [id, id, id, id, id, id, id, id, id, id, id, id]);
  }

  static getAllNodesById(id) {
    const sql =
      "SELECT distinct\n" +
      "                `DCNodeId` as NodeId\n" +
      "            from\n" +
      "                `OfferCreated` as c join `OfferFinalized` as f on f.`OfferId` = c.`OfferId` \n" +
      "where `DCNodeId` = ?" +
      "\tor `Holder1` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder2` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder3` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "union\n" +
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder1`) as NodeId\n" +
      "from\n" +
      "                `OfferCreated` as c join `OfferFinalized` as f on f.`OfferId` = c.`OfferId`\n" +
      "where `DCNodeId` = ?" +
      "\tor `Holder1` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder2` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder3` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "union\n" +
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder2`) as NodeId\n" +
      "from\n" +
      "                `OfferCreated` as c join `OfferFinalized` as f on f.`OfferId` = c.`OfferId`\n" +
      "where `DCNodeId` = ?" +
      "\tor `Holder1` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder2` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder3` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "union\n" +
      "Select (select `NodeId` from `Identity` where `Identity` = `Holder3`) as NodeId\n" +
      "            from\n" +
      "                `OfferCreated` as c join `OfferFinalized` as f on f.`OfferId` = c.`OfferId`\n" +
      "where `DCNodeId` = ?" +
      "\tor `Holder1` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder2` in (select distinct `Identity` from `Identity` where `NodeId` = ?)\n" +
      "\tor `Holder3` in (select distinct `Identity` from `Identity` where `NodeId` = ?)";

    return db.query(sql, [
      id,
      id,
      id,
      id,
      id,
      id,
      id,
      id,
      id,
      id,
      id,
      id,
      id,
      id,
      id,
      id,
    ]);
  }
}

module.exports = Job;
