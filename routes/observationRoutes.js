// routes/observations.js

import express from "express";
import {
  createObservation,
  getUserObservations,
  getSingleObservation,
  deleteObservation,
  getAllObservations,
  exportObservationsCSV,
} from "../controllers/observationController.js";
import { upload, uploadToCloudinary } from "../middlewares/upload.js";
import { handleDatasetExport } from "../controllers/datasetExport.js";

const router = express.Router();

// 1️⃣ Admin: list *all* observations (no auth filter)
router.get("/all", getAllObservations);

router.get("/export/csv", exportObservationsCSV);

// 2️⃣ “My Observations”: fetch for a given userId in body
router.post("/user", getUserObservations);

router.post("/export-dataset", handleDatasetExport);

// 3️⃣ Create a new observation (multipart upload + Cloudinary)
router.post("/", upload.single("image"), uploadToCloudinary, createObservation);

// 4️⃣ Get a single observation by ID
router.get("/:id", getSingleObservation);

// 5️⃣ Delete an observation by ID
router.delete("/:id", deleteObservation);

export default router;
