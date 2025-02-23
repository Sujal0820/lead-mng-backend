import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb+srv://pratikchavan0554062:fQAfUT5zAEW44AFT@cluster0.uotoq.mongodb.net/Pratik0559975?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error: ", err));

// Contact Schema
const contactSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  City: { type: String, required: true },
  State: { type: String, required: true },
  MobileNumber: { type: String, required: true },
});

const Contact = mongoose.model("Contacts", contactSchema, "lead_small_db");

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed for security
  role: { type: String, required: true, enum: ["admin", "employee"] },
});

const User = mongoose.model("User", userSchema, "user_roles");

// Create Employee (POST)
app.post("/users", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newUser = new User({ username, password, role });
    await newUser.save();
    res.status(201).json({ message: "Employee created successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Error creating employee", error: err.message });
  }
});

// Remove Employee (DELETE)
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ message: "Employee removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error removing employee", error: err.message });
  }
});


// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ success: true,username: user.username, role: user.role });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Fetch Users (GET)
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude password for security
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Task Schema
const taskSchema = new mongoose.Schema({
  task_description: { type: String, required: true },
  username: { type: String, required: true },
});

const Task = mongoose.model("Task", taskSchema, "tasks");

// Add Task (POST)
app.post("/tasks", async (req, res) => {
  const { task_description, username } = req.body;

  if (!task_description || !username) {
    return res.status(400).json({ message: "Task description and username are required." });
  }

  try {
    const newTask = new Task({ task_description, username });
    await newTask.save();
    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (err) {
    res.status(500).json({ message: "Error saving task" });
  }
});

// Fetch All Tasks (GET)
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// Count for calls made by single employee
app.get("/status/count/:username", async (req, res) => {
  const { username } = req.params;

  // Get today's start and end timestamps
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const count = await Status.countDocuments({
      employee: username,
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });

    res.json({ username, count });
  } catch (err) {
    res.status(500).json({ message: "Error fetching count", error: err.message });
  }
});

// Count for total calls made today
app.get("/status/all/today", async (req, res) => {
  // Get today's start and end timestamps
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const totalCount = await Status.countDocuments({
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });

    res.json({ totalCallsToday: totalCount });
  } catch (err) {
    res.status(500).json({ message: "Error fetching total count", error: err.message });
  }
});


// Status Schema
const statusSchema = new mongoose.Schema({
  contactName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  employee: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  status: { type: String, required: true },
  followUpDate: { type: Date },
  narration: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const Status = mongoose.model("Status", statusSchema, "call_logs");

// Add Status (POST)
app.post("/status", async (req, res) => {
  const { contactName, mobileNumber, employee, city, state, status, followUpDate, narration } = req.body;

  if (!contactName || !mobileNumber || !employee || !city || !state || !status) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newStatus = new Status({
      contactName,
      mobileNumber,
      employee,
      city,
      state,
      status,
      followUpDate,
      narration,
      timestamp: new Date(),
    });

    await newStatus.save();
    res.status(201).json({ message: "Status saved successfully", status: newStatus });
  } catch (err) {
    res.status(500).json({ message: "Error saving status", error: err.message });
  }
});


// Fetch Status Logs (GET)
app.get("/status", async (req, res) => {
  try {
    const statuses = await Status.find();
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching status logs", error: err.message });
  }
});

// Add Contact (POST)
app.post("/contacts", async (req, res) => {
  const { Name, City, State, MobileNumber, AddedBy } = req.body;

  if (!Name || !City || !State || !MobileNumber || !AddedBy) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newContact = new Contact({
      Name,
      City,
      State,
      MobileNumber,
      AddedBy,
    });

    await newContact.save();
    res.status(201).json({ message: "Contact added successfully", contact: newContact });
  } catch (err) {
    res.status(500).json({ message: "Error saving contact", error: err.message });
  }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});