import express from "express";
import Guest from "../models/Guest.js";

const router = express.Router();

// POST - Créer un invité
router.post("/", async (req, res) => {
  try {
    const guest = new Guest(req.body);
    const saved = await guest.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET - Récupérer tous les invités
router.get("/", async (req, res) => {
  try {
    const guests = await Guest.find().sort({ createdAt: -1 });
    res.json(guests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
