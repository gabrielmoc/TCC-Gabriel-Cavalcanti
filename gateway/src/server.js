const express = require("express");

const app = express();
const port = Number(process.env.GATEWAY_PORT || 3000);

app.get("/health", (_req, res) => {
  res.json({
    service: "gateway",
    status: "ok",
  });
});

app.listen(port, () => {
  console.log(`gateway listening on port ${port}`);
});
