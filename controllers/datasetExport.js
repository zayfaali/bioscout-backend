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

export const syncDataset = async () => {
  let filePath;
  try {
    const observations = await Observation.find({})
      .populate(populateUser)
      .lean();

    const textData = observations
      .map((obs) => {
        return [
          `Observation ID: ${obs._id}`,
          `User: ${obs.user?.username || "Anonymous"} (${
            obs.user?._id || "no-id"
          })`,
          `Species: ${obs.species}`,
          `Category: ${obs.category}`,
          `Animal Group: ${obs.animalGroup}`,
          `Location: ${obs.location}`,
          `Confidence: ${obs.confidence}%`,
          `Notes: ${obs.notes || "No additional notes"}`,
          `Image URL: ${obs.image?.url || "No image"}`,
          `Public ID: ${obs.image?.public_id || "N/A"}`,
          `Created At: ${new Date(obs.createdAt).toISOString()}`,
          `Updated At: ${new Date(obs.updatedAt).toISOString()}`,
          "----------------------------------------",
        ].join("\n");
      })
      .join("\n\n");

    // Create temporary file
    filePath = path.join(
      __dirname,
      "../temp",
      `observations-${Date.now()}.txt`
    );

    // Ensure temp directory exists
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    fs.writeFileSync(filePath, textData);

    // Rest of the API call logic remains the same
    const form = new FormData();
    form.append("dataframe", "deba045d-ede9-47b7-b6b6-33f2b87580ba");
    form.append("file", fs.createReadStream(filePath), {
      filename: "observations.txt",
      contentType: "text/plain",
    });

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

    return true;
  } catch (error) {
    console.error("Dataset sync error:", error);
    return false;
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
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
