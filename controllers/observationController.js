import Observation from "../models/Observation.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import { exportObservationsDataset, syncDataset } from "./datasetExport.js";
import { Parser } from "json2csv";

const populateUser = {
  path: "user",
  select: "username",
  model: User,
};

// Get all observations for logged-in user
export const getUserObservations = async (req, res) => {
  try {
    const observations = await Observation.find({ user: req.body.userId });
    res.status(200).json({ success: true, data: observations });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get single observation by ID
export const getSingleObservation = async (req, res) => {
  try {
    const observation = await Observation.findOne({
      _id: req.params.id,
      user: req.body.userId,
    }).populate(populateUser);

    if (!observation) {
      return res.status(404).json({
        success: false,
        message: "Observation not found",
      });
    }

    res.status(200).json({ success: true, data: observation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get *all* observations (no user filter)
export const getAllObservations = async (req, res) => {
  try {
    const observations = await Observation.find({})
      .populate(populateUser)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: observations });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching observations",
    });
  }
};

export const createObservation = async (req, res) => {
  try {
    const observation = await Observation.create({
      ...req.body,
      user: req.body.userId,
    });

    // Export dataset without sending response
    // Trigger async dataset sync without awaiting
    syncDataset().catch(console.error);

    res.status(201).json({
      success: true,
      data: observation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete observation
export const deleteObservation = async (req, res) => {
  try {
    const observation = await Observation.findOneAndDelete({
      _id: req.params.id,
      user: req.body.userId, // Get user ID directly from request body
    });

    if (!observation) {
      return res.status(404).json({
        success: false,
        message: "Observation not found",
      });
    }

    // Delete image from Cloudinary
    if (observation.image.public_id) {
      await cloudinary.uploader.destroy(observation.image.public_id);
    }

    res.status(200).json({
      success: true,
      message: "Observation deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const exportObservationsCSV = async (req, res) => {
  try {
    const observations = await Observation.find({})
      .populate(populateUser)
      .lean();

    const fields = [
      { label: "Observation ID", value: "_id" },
      { label: "Image URL", value: "image.url" },
      { label: "Username", value: "user.username" },
      { label: "Location", value: "location" },
      { label: "Notes", value: "notes" },
      { label: "Category", value: "category" },
      { label: "Animal Group", value: "animalGroup" },
      { label: "Species", value: "species" },
      {
        label: "Confidence %",
        value: "confidence",
        format: (value) => (value ? `${Math.round(value * 100)}%` : "N/A"),
      },
      {
        label: "Created At",
        value: "createdAt",
        format: (value) => new Date(value).toISOString(),
      },
      {
        label: "Updated At",
        value: "updatedAt",
        format: (value) => new Date(value).toISOString(),
      },
      { label: "Public ID", value: "image.public_id" },
    ];

    const opts = {
      fields,
      transforms: [
        (item) => ({
          ...item,
          confidence: item.confidence ? item.confidence : null,
        }),
      ],
    };

    const parser = new Parser(opts);
    const csv = parser.parse(observations);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=observations_export.csv"
    );
    res.status(200).send(csv);
  } catch (error) {
    console.error("CSV export error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate CSV export",
    });
  }
};
