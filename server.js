import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://pratikchavan0554062:fQAfUT5zAEW44AFT@cluster0.uotoq.mongodb.net/Pratik0559975?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB connection error: ', err));

// Contact Schema
const contactSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  City: { type: String, required: true },
  State: { type: String, required: true },
  MobileNumber: { type: String, required: true },
});

const Contact = mongoose.model('Contacts', contactSchema, 'lead_small_db');

// Routes
app.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Keeping unencrypted for testing
  role: { type: String, required: true, enum: ["admin", "employee"] },
});

const User = mongoose.model("User", userSchema, 'user_roles');

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

// Fetch Users Route
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude password field for security
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

const taskSchema = new mongoose.Schema({
  task_description: { type: String, required: true },
  username: { type: String, required: true }
});

const Task = mongoose.model("Task", taskSchema, "tasks");

// Add Task Route
app.post('/tasks', async (req, res) => {
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

// Fetch All Tasks Route
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
