const db = require("../config/db");

class DataHolder {
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
      "    SUM((SELECT COUNT(DISTINCT OfferId) From OfferHolders WHERE I.Identity = Holder)) AS TotalOffersWon," +
      "\n" +
      "    GREATEST(Stake - StakeReserved - 3000, 0) AS AvailableJobTokens," +
      "\n" +
      "    PaidOut," +
      "\n" +
      "    SUM((SELECT " +
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
      "                                    ELSE null \n" +
      "                                END)\n" +
      "                        ELSE null\n" +
      "                    END) \n" +
      "        FROM Offer o JOIN OfferHolders h ON h.OfferId = o.OfferId AND h.BlockchainId = o.BlockchainId\n" +
      "        WHERE o.BlockchainId = I.blockchainId AND h.Holder = I.Identity)) AS ActiveOffers\n" +
      "FROM Identity I\n" +
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
    const filter = nodeId ? " WHERE NodeId = ? " : " ";
    const sql =
      "SELECT " +
      "\n" +
      "    Identity," +
      "\n" +
      "    NodeId," +
      "\n" +
      "    o.OfferId," +
      "\n" +
      "    DATE_FORMAT(FinalizedTimestamp, '%Y-%m-%dT%h:%m:%s') AS FinalizedTimestamp," +
      "\n" +
      "    HoldingTimeInMinutes," +
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
      "    CASE WHEN(COALESCE(SUM(Amount), 0) = o.TokenAmountPerHolder)" +
      "\n" +
      "            THEN true " +
      "\n" +
      "            ELSE false " +
      "\n" +
      "          END AS Paidout," +
      "\n" +
      "    SUM(Amount) AS PaidoutAmount," +
      "\n" +
      "    (CASE WHEN(COALESCE(SUM(Amount), 0) = o.TokenAmountPerHolder) " +
      "\n" +
      "            THEN false " +
      "\n" +
      "            ELSE true " +
      "\n" +
      "         END) AS CanPayout," +
      "\n" +
      "    TokenAmountPerHolder," +
      "\n" +
      "    DATE_FORMAT(DATE_Add(FinalizedTimeStamp, INTERVAL + HoldingTimeInMinutes MINUTE), '%Y-%m-%dT%h:%m:%s') AS EndTimestamp," +
      "\n" +
      "    Name AS BlockchainName" +
      "\n" +
      "FROM" +
      "\n" +
      "    OfferHolders oh " +
      "\n" +
      "        JOIN Offer o ON oh.OfferId = o.OfferId " +
      "\n" +
      "        JOIN Blockchain ON o.BlockchainId = Id " +
      "\n" +
      "        JOIN Identity ON Identity = oh.Holder " +
      "\n" +
      "        LEFT JOIN PaidOut p ON p.Holder = oh.Holder AND p.OfferId = o.OfferId" +
      "\n" +
      filter +
      "GROUP BY oh.OfferId, oh.Holder";

    return db.query(sql, nodeId);
  }
}

module.exports = DataHolder;
