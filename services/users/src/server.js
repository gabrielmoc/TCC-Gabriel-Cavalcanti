const express = require("express");

const app = express();
const port = Number(process.env.USERS_SERVICE_PORT || 3002);

app.get("/health", (_req, res) => {
  res.json({
    service: "users",
    status: "ok",
  });
});

app.listen(port, () => {
  console.log(`users listening on port ${port}`);
});
