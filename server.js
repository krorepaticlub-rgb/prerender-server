import express from "express";
import puppeteer from "puppeteer-core";

const app = express();
const PORT = process.env.PORT || 3000;

// 🔴 Replace this with your Browserless API key
const BROWSERLESS_URL = "wss://chrome.browserless.io?token=2USaklerno1ccst96a3de2a00fcd8c76abecc100021dbd657";

app.get("/render", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send("Missing url parameter");
  }

  let browser;

  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: BROWSERLESS_URL
    });

    const page = await browser.newPage();

    // 🚀 Load page
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 20000
    });

    // ✅ Wait for content to render
    await page.waitForSelector("body", { timeout: 10000 });

    // ⏳ Extra buffer for JS-heavy apps (important)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 📄 Get final HTML
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

// Health check
app.get("/", (req, res) => {
  res.send("Prerender server running ✅");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
