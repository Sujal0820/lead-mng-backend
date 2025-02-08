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

// Schema and model
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

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Keeping it unencrypted for testing
  role: { type: String, required: true, enum: ["admin", "employee"] },
});

const User = mongoose.model("User", userSchema, 'user_roles');

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ success: true, role: user.role });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
