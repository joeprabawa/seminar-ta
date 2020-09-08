require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const routes = require("./routes/api");

app.use(cors({ origin: true }));
app.use("/api/v1", routes);

app.listen(PORT, () => {
  console.log(`Server Listening on port http://localhost:${PORT}`);
});
