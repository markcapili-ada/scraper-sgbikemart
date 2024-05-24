import express from "express";
import runScraperProcess from "./scraper.js";
import dotenv from "dotenv";
import authenticate from "./auth.js";
import jwt from "jsonwebtoken";
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", authenticate, async (req, res) => {
  res.send(`
    <html>
      <body>
        <button onclick="fetch('/run').then(response => response.text()).then(alert)">Click me</button>
      </body>
    </html>
  `);
  console.log(`I got pinged`);
});

app.get("/run", authenticate, async (req, res) => {
  await runScraperProcess();
  res.send("Function run successfully!");
});

app.post("/login", (req, res) => {
  const username = process.env.USER_ENV;
  const password = process.env.PASSWORD_ENV;
  console.log(req.body);
  if (req.body.username === username && req.body.password === password) {
    const token = jwt.sign({ username: username }, process.env.JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).send("Invalid username or password");
  }
});

app.listen(port, () => {
  console.log(`Scraper app listening at http://localhost:${port}`);
});
