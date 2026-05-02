require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;
const BASE_URL = `https://tapi.bale.ai/bot${TOKEN}`;
const users = {};

async function sendMessage(chat_id, text, keyboard) {
  const body = { chat_id, text };

  if (keyboard) {
    body.reply_markup = {
      keyboard,
      resize_keyboard: true,
    };
  }

  await axios.post(`${BASE_URL}/sendMessage`, body);
}

/*app.post("/webhook", async (req, res) => {
  console.log("UPDATE RECEIVED:", req.body);
  
  const message = req.body.message;
  if (!message) return res.sendStatus(200); */
  app.post("/webhook", (req, res) => {
  console.log("HIT");
  res.sendStatus(200);});

  const chatId = message.chat.id;
  const text = message.text;

  if (!users[chatId]) users[chatId] = { step: "start" };

  // شروع
  if (text === "/start") {
    users[chatId].step = "consult";

    await sendMessage(
      chatId,
      "👋 سلام\nبرای شروع روی مشاوره رایگان بزن",
      [["🎯 مشاوره رایگان"]]
    );
  }

  // مشاوره
  else if (text === "🎯 مشاوره رایگان") {
    users[chatId].step = "service";

    await sendMessage(chatId, "چه خدمتی می‌خوای؟", [
      ["طراحی سایت", "تولید محتوا"],
      ["پنل پیامک", "مشاوره رشد"],
    ]);
  }

  // انتخاب سرویس
  else if (users[chatId].step === "service") {
    users[chatId].service = text;
    users[chatId].step = "phone";

    await sendMessage(chatId, "شماره تماس رو بفرست 📞");
  }

  // دریافت شماره
  else if (users[chatId].step === "phone") {
    users[chatId].phone = text;
    users[chatId].step = "done";

    console.log("LEAD:", users[chatId]);

    await sendMessage(chatId, "ثبت شد 👌 به زودی تماس می‌گیریم");
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running..."));
