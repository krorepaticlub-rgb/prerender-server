import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/render", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send("Missing url parameter");
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ],
      headless: "new"
    });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 15000
    });

    const html = await page.content();

    res.set("Content-Type", "text/html");
    res.send(html);

  } catch (error) {
    console.error("Render error:", error);
    res.status(500).send("Rendering failed");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.get("/", (req, res) => {
  res.send("Prerender server running ✅");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
