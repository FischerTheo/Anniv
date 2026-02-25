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
      type: [Number],
      validate: {
        validator: (arr) => arr.every((d) => Number.isInteger(d) && d >= 1 && d <= 31),
        message: "Les jours doivent être entre 1 et 31",
      },
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
