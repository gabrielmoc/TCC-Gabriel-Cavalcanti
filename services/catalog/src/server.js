const express = require("express");

const app = express();
const port = Number(process.env.CATALOG_SERVICE_PORT || 3001);

app.get("/health", (_req, res) => {
  res.json({
    service: "catalog",
    status: "ok",
  });
});

app.listen(port, () => {
  console.log(`catalog listening on port ${port}`);
});
