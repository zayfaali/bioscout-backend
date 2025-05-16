// controllers/datasetExport.js
import Observation from "../models/Observation.js";
import User from "../models/User.js";
import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const populateUser = {
  path: "user",
  select: "username",
  model: User,
};

// controllers/datasetExport.js
export const syncDataset = async () => {
  let filePath;
  try {
    const observations = await Observation.find({}).populate(populateUser);
    const textData = observations
      .map((obs) => {
        return `
Observation ID: ${obs._id}
Title: ${obs.title || "N/A"}
Description: ${obs.description || "N/A"}
Species: ${obs.species || "N/A"}
Location: ${obs.location || "N/A"}
Date: ${obs.observationDate || "N/A"}
Weather: ${obs.weatherConditions || "N/A"}
Habitat: ${obs.habitatType || "N/A"}
Notes: ${obs.additionalNotes || "N/A"}
----------------------------------------\n
`;
      })
      .join("\n");

    // Create temporary file
    filePath = path.join(
      __dirname,
      "../temp",
      `observations-${Date.now()}.txt`
    );
    fs.writeFileSync(filePath, textData);
    console.log(`File created at: ${filePath}`);

    // Validate file existence
    if (!fs.existsSync(filePath)) {
      throw new Error("File creation failed");
    }

    // Create form data with proper file attachment
    const form = new FormData();
    form.append("dataframe", "deba045d-ede9-47b7-b6b6-33f2b87580ba");
    form.append("file", fs.createReadStream(filePath), {
      filename: "observations.txt",
      contentType: "text/plain",
    });

    // Send request with verbose logging
    console.log("Sending request to Vext API...");
    const response = await axios.post(
      "https://api.vextapp.com/openapi/v2/data-source",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Apikey: "Api-Key 1a8O3yR0.Tr03YAoMXPo6UcQvELVQ6aqu4cYvmrRS",
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    console.log("API response:", response.data);
    return true;
  } catch (error) {
    console.error(
      "API submission failed:",
      error.response?.data || error.message
    );
    return false;
  } finally {
    // Cleanup file only after API call completes
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Temporary file cleaned: ${filePath}`);
    }
  }
};

// Endpoint handler for dataset export
export const handleDatasetExport = async (req, res) => {
  try {
    const result = await syncDataset();
    if (result) {
      res.status(200).json({ success: true, message: "Dataset synced" });
    } else {
      res.status(500).json({ success: false, message: "Dataset sync failed" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function for observation creation
export const exportObservationsDataset = async (req, res) => {
  try {
    await syncDataset();
  } catch (error) {
    console.error("Dataset export error:", error);
  }
};
