const db = require("../config/db");

class DataCreator {
  static getNodes(nodeId) {
    const filter = nodeId ? " WHERE I.NodeId = ? " : " ";
    const sql =
      "SELECT " +
      "\n" +
      "    NodeId," +
      "\n" +
      "    Stake," +
      "\n" +
      "    StakeReserved," +
      "\n" +
      "    (SELECT COUNT(DISTINCT OfferId)) AS TotalOffersCreated," +
      "\n" +
      "    ROUND((SELECT AVG(DataSetSizeInBytes)) / 1000) AS AvgDataSetSizeKB," +
      "\n" +
      "    ROUND((SELECT AVG(HoldingTimeInMinutes))) AS AvgHoldingTimeInMinutes," +
      "\n" +
      "    ROUND((SELECT AVG(TokenAmountPerHolder))) AS AvgTokenAmountPerHolder," +
      "\n" +
      "    date_format(COALESCE(MIN(O.FinalizedTimestamp), MIN(O.CreatedTimestamp)), '%Y-%m-%dT%h:%m:%s') AS FirstOffer," +
      "\n" +
      "    date_format(COALESCE(MAX(O.FinalizedTimestamp), MAX(O.CreatedTimestamp)), '%Y-%m-%dT%h:%m:%s') AS LastOffer," +
      "\n" +
      "    (SELECT " +
      "\n" +
      "        COUNT(DISTINCT " +
      "\n" +
      "                CASE WHEN o.IsFinalized = 1 " +
      "\n" +
      "                        THEN (" +
      "\n" +
      "                            CASE WHEN NOW() <= DATE_Add(o.FinalizedTimeStamp, INTERVAL + o.HoldingTimeInMinutes MINUTE) " +
      "\n" +
      "                                    THEN O.OfferId " +
      "\n" +
      "                                    ELSE null " +
      "\n" +
      "                                END)" +
      "\n" +
      "                        ELSE null" +
      "\n" +
      "                    END)) AS ActiveOffers" +
      "\n" +
      "FROM Identity I LEFT JOIN Offer O ON O.DCNodeId = I.NodeId" +
      "\n" +
      filter +
      "GROUP BY I.NodeId";

    return db.query(sql, nodeId);
  }

  static getIdentities(nodeId) {
    const sql =
      "SELECT i.Identity, bc.Name BlockchainName, i.Stake, i.StakeReserved FROM Identity i" +
      "\n" +
      "JOIN blockchain bc ON bc.id = i.blockchainid" +
      "\n" +
      "WHERE i.NodeId = ?";

    return db.query(sql, nodeId);
  }

  static getJobs(nodeId) {
    const filter = nodeId ? " WHERE DCNodeId = ? " : " ";
    const sql =
      "SELECT " +
      "\n" +
      "    OfferId," +
      "\n" +
      "    DATE_FORMAT(CreatedTimestamp, '%Y-%m-%dT%h:%m:%s') as CreatedTimestamp," +
      "\n" +
      "    DATE_FORMAT(FinalizedTimestamp, '%Y-%m-%dT%h:%m:%s') as FinalizedTimestamp," +
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
      "    (CASE WHEN(IsFinalized = false)" +
      "\n" +
      "            THEN NULL" +
      "\n" +
      "            ELSE DATE_FORMAT(DATE_Add(FinalizedTimeStamp, INTERVAL + HoldingTimeInMinutes MINUTE), '%Y-%m-%dT%h:%m:%s')" +
      "\n" +
      "            END) as EndTimestamp," +
      "\n" +
      "    Name as BlockchainName" +
      "\n" +
      "FROM Offer JOIN Blockchain ON BlockchainId = Id" +
      filter;

    return db.query(sql, nodeId);
  }
}

module.exports = DataCreator;
