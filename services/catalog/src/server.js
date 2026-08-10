const express = require("express");
const path = require("path");

const app = express();
const port = Number(process.env.CATALOG_SERVICE_PORT || 3001);
const catalog = require(path.resolve(
  __dirname,
  "../../../shared/datasets/catalog.json"
));

app.get("/catalog", (_req, res) => {
  res.json(catalog);
});

app.get("/catalog/:id", (req, res) => {
  const itemId = Number(req.params.id);
  const item = catalog.find((entry) => entry.id === itemId);

  if (!item) {
    return res.status(404).json({
      message: "Catalog item not found",
    });
  }

  return res.json(item);
});

app.get("/health", (_req, res) => {
  res.json({
    service: "catalog",
    status: "ok",
  });
});

app.listen(port, () => {
  console.log(`catalog listening on port ${port}`);
});
