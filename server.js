import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());

// Read JSON files manually
const customers = JSON.parse(fs.readFileSync("./data/customers.json"));
const orders = JSON.parse(fs.readFileSync("./data/orders.json"));

// Routes
app.get("/wp-json/wc/v3/customers", (req, res) => {
  res.json(customers);
});

app.get("/wp-json/wc/v3/orders", (req, res) => {
  res.json(orders);
});

// Health check
app.get("/", (req, res) => {
  res.send("Mock WooCommerce API Running");
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});