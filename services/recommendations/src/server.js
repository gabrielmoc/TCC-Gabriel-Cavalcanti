const express = require("express");

const app = express();
const port = Number(process.env.RECOMMENDATIONS_SERVICE_PORT || 3003);
const usersServiceUrl = process.env.USERS_SERVICE_URL || "http://localhost:3002";
const catalogServiceUrl =
  process.env.CATALOG_SERVICE_URL || "http://localhost:3001";

app.get("/recommendations/:userId", async (req, res) => {
  const userId = Number(req.params.userId);

  if (Number.isNaN(userId)) {
    return res.status(400).json({
      message: "Invalid user id",
    });
  }

  try {
    const [userResponse, catalogResponse] = await Promise.all([
      fetch(`${usersServiceUrl}/users/${userId}`),
      fetch(`${catalogServiceUrl}/catalog`),
    ]);

    if (userResponse.status === 404) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!userResponse.ok || !catalogResponse.ok) {
      return res.status(502).json({
        message: "Failed to fetch upstream services",
      });
    }

    const user = await userResponse.json();
    const catalog = await catalogResponse.json();

    const recommendations = catalog.filter((item) =>
      user.preferredGenres.includes(item.genre)
    );

    return res.json({
      userId: user.id,
      recommendations,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal recommendations error",
      error: error.message,
    });
  }
});

app.get("/health", (_req, res) => {
  res.json({
    service: "recommendations",
    status: "ok",
  });
});

app.listen(port, () => {
  console.log(`recommendations listening on port ${port}`);
});
