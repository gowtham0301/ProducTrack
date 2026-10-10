
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// Valid task statuses
const validStatuses = ["To Do", "In Progress", "Completed"];

// MongoDB Task Schema

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required."],
      trim: true,
      minlength: [1, "Task title cannot be empty."],
      maxlength: [120, "Task title cannot exceed 120 characters."],
    },
    status: {
      type: String,
      enum: {
        values: validStatuses,
        message: "Status must be To Do, In Progress, or Completed.",
      },
      default: "To Do",
    },
  },
  {
    timestamps: true,
  }
);


// Task Model
const Task = mongoose.model("Task", taskSchema);

// Convert MongoDB documents to the format expected by React
function formatTask(task) {
  return {
    id: task._id.toString(),
    title: task.title,
    status: task.status,
  };
}

// GET: Retrieve all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    return res.status(200).json(tasks.map(formatTask));
  } catch (error) {
    console.error("Get tasks error:", error.message);
    return res.status(500).json({
      message: "Failed to retrieve tasks.",
    });
  }
});

// POST: Create a new task

app.post("/api/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    // Validate the title
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required.",
      });
    }

    if (title.trim().length > 120) {
      return res.status(400).json({
        success: false,
        message: "Task title cannot exceed 120 characters.",
      });
    }

    // Create the task in MongoDB
    const task = await Task.create({
      title: title.trim(),
      status: "To Do",
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      task: formatTask(task),
    });
  } catch (error) {
    console.error("Create task error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task data.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create task.",
    });
  }
});

// PATCH: Update a task

app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;

    // Validate MongoDB ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }

    // Require at least one field to update
    if (title === undefined && status === undefined) {
      return res.status(400).json({
        message: "Provide a title or status to update.",
      });
    }

    const updates = {};

    // Validate title if provided
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Task title cannot be empty.",
        });
      }

      if (title.trim().length > 120) {
        return res.status(400).json({
          message: "Task title cannot exceed 120 characters.",
        });
      }

      updates.title = title.trim();
    }

    // Validate status if provided
    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid task status.",
        });
      }

      updates.status = status;
    }

    const task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    // Keep the response compatible with the existing frontend
    return res.status(200).json(formatTask(task));
  } catch (error) {
    console.error("Update task error:", error.message);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task data.",
      });
    }

    return res.status(500).json({
      message: "Failed to update task.",
    });
  }
});

// DELETE: Remove a task

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    // Delete the task from MongoDB
    const task = await Task.findByIdAndDelete(id);

    // Handle a valid ID that doesn't exist
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
      task: formatTask(task),
    });
  } catch (error) {
    console.error("Delete task error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete task.",
    });
  }
});


// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    message: "DevTrack API is running!",
  });
});


/* Handle unknown routes */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* Centralized error handler */
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  // Invalid JSON sent in the request body
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
});

// Connect to MongoDB before starting Express
async function startServer() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the .env file.");
    }

    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`DevTrack API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start DevTrack:", error.message);
    process.exit(1);
  }
}

startServer();
