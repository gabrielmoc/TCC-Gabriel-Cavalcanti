import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(currentDirectory, "../..");
const solrUrl = process.env.SOLR_URL || "http://127.0.0.1:8983/solr/catalog";
const catalogPath = path.join(rootDirectory, "shared/datasets/catalog.json");

const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const documents = catalog.map((item) => ({
  ...item,
  // O identificador padrão do Solr é textual; este campo preserva a ordem numérica do baseline.
  sortOrder_i: item.id,
}));
const response = await fetch(`${solrUrl}/update?commit=true`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(documents),
});

if (!response.ok) {
  throw new Error(
    `Falha ao indexar catálogo no Solr: HTTP ${response.status} ${await response.text()}`
  );
}

console.log(
  `Catálogo indexado no Solr com ${documents.length} documentos em ${solrUrl}.`
);
