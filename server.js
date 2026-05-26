import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let clients = [];

/* =========================
   ROOT (перевірка що сервер живий)
========================= */
app.get("/", (req, res) => {
    res.send("OK - Donation server is running 🚀");
});

/* =========================
   STREAM (сайт слухає донати)
========================= */
app.get("/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.write("\n");

    clients.push(res);

    req.on("close", () => {
        clients = clients.filter(c => c !== res);
    });
});

/* =========================
   NOWPAYMENTS WEBHOOK
========================= */
app.post("/webhook", (req, res) => {
    try {
        const payment = req.body;

        console.log("💸 Webhook received:", payment);

        const message = {
            name: payment.order_id || "Anonymous",
            amount: payment.price_amount || 0,
            currency: payment.price_currency || "USD"
        };

        clients.forEach(client => {
            client.write(`data: ${JSON.stringify(message)}\n\n`);
        });

        res.sendStatus(200);

    } catch (err) {
        console.log("Webhook error:", err);
        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🔥 Server running on port", PORT);
});
