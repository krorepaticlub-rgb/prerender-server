import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/render", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send("Missing URL");
  }

  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 10000
    });

    const html = await page.content();

    await browser.close();

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Rendering failed");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
