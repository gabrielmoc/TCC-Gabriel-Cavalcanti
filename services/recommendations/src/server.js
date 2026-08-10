const express = require("express");

const app = express();
const port = Number(process.env.RECOMMENDATIONS_SERVICE_PORT || 3003);

app.get("/health", (_req, res) => {
  res.json({
    service: "recommendations",
    status: "ok",
  });
});

app.listen(port, () => {
  console.log(`recommendations listening on port ${port}`);
});
