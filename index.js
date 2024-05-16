import express from "express";

import runScraperProcess from "./scraper.js";

const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  res.send(`
    <html>
      <body>
        <button onclick="fetch('/run').then(response => response.text()).then(alert)">Click me</button>
      </body>
    </html>
  `);
});

app.get("/run", async (req, res) => {
  await runScraperProcess();
  res.send("Function run successfully!");
});

app.listen(port, () => {
  console.log(`Scraper app listening at http://localhost:${port}`);
});
