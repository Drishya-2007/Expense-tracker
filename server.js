require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB

mongoose.connect(process.env.MONGO_URI)

  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


// Schema
const ExpenseSchema = new mongoose.Schema({
  date: String,
  name: String,
  amount: Number
});

const Expense = mongoose.model("Expense", ExpenseSchema);

// Routes


app.get("/expenses", async (req, res) => {
  const data = await Expense.find();
  res.json(data);
});

app.post("/expenses", async (req, res) => {
  const expense = new Expense(req.body);
  await expense.save();
  res.json({ message: "Saved successfully" });
});

app.delete("/expenses/clear", async (req, res) => {
    try {
        await Expense.deleteMany({});
        res.status(200).send("All expenses cleared");
    } catch (err) {
        res.status(500).send("Error clearing expenses");
    }
});

app.delete("/expenses/:id", async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});


app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Get daily totals
app.get("/expenses/daily", async (req, res) => {
  const data = await Expense.aggregate([
    {
      $group: {
        _id: "$date",       // group by date
        total: { $sum: "$amount" }  // sum of amounts
      }
    },
    { $sort: { _id: 1 } } // sort by date ascending
  ]);
  res.json(data);
});

// Fallback for frontend (Express v5 SAFE)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// Listen LAST
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});