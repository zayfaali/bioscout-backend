import mongoose from "mongoose";

const observationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      public_id: String,
      url: String,
    },
    location: {
      type: String,
      required: true,
    },
    notes: String,
    category: {
      type: String,
      required: true,
    },
    animalGroup: {
      type: String,
      required: true,
    },
    species: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Observation", observationSchema);
