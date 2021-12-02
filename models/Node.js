const db = require("../config/db");

class Node {
  static getNodes(nodeId) {
    const filter = nodeId ? " AND I.NodeId = ? " : " ";
    const sql =
      "SELECT " +
      "\n" +
      "    t1.isDataHolder," +
      "\n" +
      "    t1.NodeId," +
      "\n" +
      "    t1.Stake," +
      "\n" +
      "    t1.StakeReserved," +
      "\n" +
      "    t1.TotalOffersWon," +
      "\n" +
      "    t1.AvailableJobTokens," +
      "\n" +
      "    t1.PaidOut," +
      "\n" +
      "    t1.ActiveWonOffers," +
      "\n" +
      "    t2.isDataCreator," +
      "\n" +
      "    t2.TotalOffersCreated," +
      "\n" +
      "    t2.AvgDataSetSizeKB," +
      "\n" +
      "    t2.AvgHoldingTimeInMinutes," +
      "\n" +
      "    t2.AvgTokenAmountPerHolder," +
      "\n" +
      "    t2.FirstOffer," +
      "\n" +
      "    t2.LastOffer," +
      "\n" +
      "    t2.ActiveOffersCreated" +
      "\n" +
      "" +
      "\n" +
      "FROM (SELECT" +
      "\n" +
      "        ((SELECT COUNT(DISTINCT OH.OfferId)) > 0) AS isDataHolder," +
      "\n" +
      "        NodeId," +
      "\n" +
      "        Stake," +
      "\n" +
      "        StakeReserved," +
      "\n" +
      "        (SELECT COUNT(DISTINCT OH.OfferId)) AS TotalOffersWon," +
      "\n" +
      "        GREATEST(Stake - StakeReserved - 3000, 0) AS AvailableJobTokens," +
      "\n" +
      "        PaidOut," +
      "\n" +
      "        (SELECT" +
      "\n" +
      "             COUNT(DISTINCT " +
      "\n" +
      "                 CASE WHEN IsFinalized = 1 " +
      "\n" +
      "                         THEN(" +
      "\n" +
      "                             CASE WHEN NOW() <= DATE_Add(FinalizedTimeStamp, INTERVAL + HoldingTimeInMinutes MINUTE) " +
      "\n" +
      "                                     THEN O.OfferId " +
      "\n" +
      "                                     ELSE null " +
      "\n" +
      "                                  END)" +
      "\n" +
      "                             ELSE null" +
      "\n" +
      "                         END)" +
      "\n" +
      "                     ) AS ActiveWonOffers" +
      "\n" +
      "    FROM Identity I " +
      "\n" +
      "        LEFT JOIN OfferHolders OH ON OH.Holder = I.Identity " +
      "\n" +
      "        LEFT JOIN Offer O ON O.OfferId = OH.OfferId" +
      "\n" +
      "    WHERE I.IsLatest = true " +
      filter +
      "\n" +
      "    GROUP BY NodeId) AS t1, " +
      "\n" +
      "    " +
      "\n" +
      "    (SELECT" +
      "\n" +
      "        NodeId," +
      "\n" +
      "        ((SELECT COUNT(DISTINCT OfferId)) > 0) AS isDataCreator," +
      "\n" +
      "        (SELECT COUNT(DISTINCT OfferId)) AS TotalOffersCreated," +
      "\n" +
      "        ROUND((SELECT AVG(DataSetSizeInBytes)) / 1000) AS AvgDataSetSizeKB," +
      "\n" +
      "        ROUND((SELECT AVG(HoldingTimeInMinutes))) AS AvgHoldingTimeInMinutes," +
      "\n" +
      "        ROUND((SELECT AVG(TokenAmountPerHolder))) AS AvgTokenAmountPerHolder," +
      "\n" +
      "        date_format(COALESCE(MIN(FinalizedTimestamp), MIN(CreatedTimestamp)), '%Y-%m-%dT%h:%m:%s') AS FirstOffer," +
      "\n" +
      "        date_format(COALESCE(MAX(FinalizedTimestamp), MAX(CreatedTimestamp)), '%Y-%m-%dT%h:%m:%s') AS LastOffer," +
      "\n" +
      "        (SELECT " +
      "\n" +
      "            COUNT(DISTINCT" +
      "\n" +
      "                CASE WHEN IsFinalized = 1" +
      "\n" +
      "                        THEN " +
      "\n" +
      "                            (CASE WHEN NOW() <= DATE_Add(FinalizedTimeStamp, INTERVAL + HoldingTimeInMinutes MINUTE)" +
      "\n" +
      "                                    THEN OfferId " +
      "\n" +
      "                                    ELSE null " +
      "\n" +
      "                                 END)" +
      "\n" +
      "                        ELSE null" +
      "\n" +
      "                    END)) AS ActiveOffersCreated" +
      "\n" +
      "    FROM Identity I LEFT JOIN Offer ON I.NodeId = DCNodeId" +
      "\n" +
      "    WHERE I.IsLatest = true " +
      filter +
      "\n" +
      "    GROUP BY NodeId) as t2" +
      "\n" +
      "WHERE t1.NodeId = t2.NodeId";

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

  static getTokenTransfers(nodeId) {
    const filter = nodeId ? " WHERE i.NodeId = ? " : " ";
    const sql =
      "SELECT " +
      "\n" +
      "    t.TransactionHash, " +
      "\n" +
      "    t.AmountDeposited AS Amount," +
      "\n" +
      "    t.GasPrice, " +
      "\n" +
      "    t.GasUsed," +
      "\n" +
      "    b.GasTicker, " +
      "\n" +
      "    b.TransactionUrl" +
      "\n" +
      "FROM tokensDeposited t" +
      "\n" +
      "    JOIN Identity i ON i.Identity = t.Profile" +
      "\n" +
      "    JOIN blockchain b ON b.id = t.BlockchainId" +
      filter +
      "\n" +
      "        UNION" +
      "\n" +
      "SELECT " +
      "\n" +
      "    t.TransactionHash, " +
      "\n" +
      "    t.AmountWithdrawn * (-1) AS Amount," +
      "\n" +
      "    t.GasPrice, " +
      "\n" +
      "    t.GasUsed," +
      "\n" +
      "    b.GasTicker, " +
      "\n" +
      "    b.TransactionUrl " +
      "\n" +
      "FROM tokensWithdrawn t" +
      "\n" +
      "    JOIN Identity i ON i.Identity = t.Profile" +
      "\n" +
      "    JOIN blockchain b ON b.id = t.BlockchainId" +
      filter +
      "\n" +
      "        UNION" +
      "\n" +
      "SELECT " +
      "\n" +
      "    pc.TransactionHash, " +
      "\n" +
      "    pc.InitialBalance AS Amount," +
      "\n" +
      "    pc.GasPrice, " +
      "\n" +
      "    pc.GasUsed," +
      "\n" +
      "    b.GasTicker, " +
      "\n" +
      "    b.TransactionUrl " +
      "\n" +
      "FROM profileCreated pc" +
      "\n" +
      "    JOIN Identity i ON i.Identity = pc.Profile" +
      "\n" +
      "    JOIN blockchain b ON b.id = pc.BlockchainId" +
      filter;

    return db.query(sql, [nodeId, nodeId, nodeId]);
  }
}

module.exports = Node;
