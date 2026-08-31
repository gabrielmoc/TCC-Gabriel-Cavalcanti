import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genres = [
  "action",
  "drama",
  "sci-fi",
  "comedy",
  "thriller",
  "fantasy",
  "animation",
  "documentary",
];

const adjectives = [
  "Silent",
  "Infinite",
  "Hidden",
  "Neon",
  "Golden",
  "Broken",
  "Crimson",
  "Electric",
  "Fading",
  "Atomic",
];

const nouns = [
  "Signal",
  "Frontier",
  "Echo",
  "Orbit",
  "Archive",
  "Pulse",
  "Horizon",
  "Circuit",
  "Chronicle",
  "Blueprint",
];

const baseCatalog = [
  { id: 10, title: "Movie X", genre: "action", year: 2023 },
  { id: 11, title: "Movie Z", genre: "drama", year: 2021 },
  { id: 18, title: "Movie Y", genre: "sci-fi", year: 2024 },
  { id: 24, title: "Movie W", genre: "comedy", year: 2022 },
  { id: 31, title: "Movie Q", genre: "action", year: 2025 },
  { id: 42, title: "Movie K", genre: "sci-fi", year: 2020 },
];

const baseUsers = [
  { id: 1, name: "User 1", preferredGenres: ["action", "sci-fi"] },
  { id: 2, name: "User 2", preferredGenres: ["drama"] },
  { id: 3, name: "User 3", preferredGenres: ["comedy", "action"] },
];

function buildCatalog(targetCount = 1500) {
  const catalog = [...baseCatalog];
  let nextId = 43;

  while (catalog.length < targetCount) {
    const sequence = catalog.length - baseCatalog.length;
    const adjective = adjectives[sequence % adjectives.length];
    const noun = nouns[Math.floor(sequence / adjectives.length) % nouns.length];
    const genre = genres[sequence % genres.length];
    const year = 2010 + (sequence % 16);

    catalog.push({
      id: nextId,
      title: `${adjective} ${noun} ${nextId}`,
      genre,
      year,
    });

    nextId += 1;
  }

  return catalog;
}

function buildUsers(targetCount = 240) {
  const users = [...baseUsers];

  for (let id = 4; id <= targetCount; id += 1) {
    const startIndex = (id - 1) % genres.length;
    const preferredGenres = [
      genres[startIndex],
      genres[(startIndex + 2) % genres.length],
    ];

    if (id % 5 === 0) {
      preferredGenres.push(genres[(startIndex + 4) % genres.length]);
    }

    users.push({
      id,
      name: `User ${id}`,
      preferredGenres,
    });
  }

  return users;
}

function writeJson(filename, data) {
  const filepath = path.join(__dirname, filename);
  writeFileSync(filepath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

mkdirSync(__dirname, { recursive: true });

const catalog = buildCatalog();
const users = buildUsers();

writeJson("catalog.json", catalog);
writeJson("users.json", users);

console.log(
  JSON.stringify(
    {
      message: "Case 2 datasets generated successfully",
      catalogItems: catalog.length,
      users: users.length,
    },
    null,
    2
  )
);
