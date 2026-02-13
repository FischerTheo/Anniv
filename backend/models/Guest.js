import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    allergiesAndDiet: {
      type: String,
      trim: true,
      default: "",
    },
    needsAccommodation: {
      type: Boolean,
      required: true,
      default: false,
    },
    availableDays: {
      type: [String],
      enum: ["Dimanche 9", "Lundi 10", "Mardi 11"],
      default: [],
    },
    availableTime: {
      type: [String],
      enum: ["Après-midi", "Soir"],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Guest", guestSchema);
