require("dotenv").config();

const cors = require("cors");
const express = require("express");
const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.use("/nodes", require("./routes/nodesRoutes"));
app.use("/nodes/datacreators", require("./routes/datacreatorsRoutes"));
app.use("/nodes/dataholders", require("./routes/dataholdersRoutes"));
app.use("/jobs", require("./routes/jobsRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server listening on port " + PORT));
