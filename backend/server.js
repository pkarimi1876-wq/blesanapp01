require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Blesan AI Backend is running",
  });
});

app.post("/api/ai/chat", async (req, res) => {
    console.log("AI REQUEST RECEIVED:", req.body);
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "پرسیارێک بنووسە.",
      });
    }

    const response = await client.responses.create({
      model: "gpt-5-mini",
      instructions:
        "تۆ یاریدەدەری زیرەکی ئەپی دێهاتی بڵەسەنیت. وەڵامەکانت بە زمانی کوردیی سۆرانی، بە شێوەیەکی ڕوون و ڕێزدار بن.",
      input: message,
    });

    res.json({
      success: true,
      answer: response.output_text,
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    res.status(500).json({
      success: false,
      error: "کێشەیەک لە پەیوەندی بە AI ڕوویدا.",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Blesan AI Backend running on port ${PORT}`);
});