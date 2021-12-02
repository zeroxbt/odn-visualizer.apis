"SELECT " + "\n" +
"    i.Identity, " + "\n" +
"    bc.Name BlockchainName, " + "\n" +
"    i.Stake, " + "\n" +
"    i.StakeReserved " + "\n" +
"FROM Identity i" + "\n" +
"    JOIN blockchain bc ON bc.id = i.blockchainid" + "\n" +
"    JOIN OfferHolders oh ON oh.Holder = i.Identity" + "\n" +
"GROUP BY oh.OfferId";
