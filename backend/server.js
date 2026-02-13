import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import guestRoutes from "./routes/guest.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/guests", guestRoutes);

// Connexion MongoDB + lancement serveur
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion MongoDB :", err);
  });
