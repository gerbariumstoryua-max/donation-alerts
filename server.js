const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let clients = [];

/* WEBHOOK from NOWPayments */
app.post("/webhook", (req, res) => {
    const data = req.body;

    const alert = {
        message: `🔥 Someone donated ${data.price_amount || "?"} ${data.price_currency || "crypto"}`
    };

    clients.forEach(c => c.res.write(`data: ${JSON.stringify(alert)}\n\n`));

    res.sendStatus(200);
});

/* LIVE STREAM */
app.get("/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");

    clients.push({ res });

    req.on("close", () => {
        clients = clients.filter(c => c.res !== res);
    });
});

app.listen(3000, () => console.log("Server running"));
