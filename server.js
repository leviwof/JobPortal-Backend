const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const Job = require("./models/Job");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const auth = require('./middleware/auth');

app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Ensure cookie-parser is used

const PORT = process.env.PORT || 3000;

app.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { name, email, password,role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword);
    console.log("User data:", req.body);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();
    res.send("User created successfully");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log("Received Request Body:", req.body);

    const loginEmail = email || name;
    console.log("Login Email Being Checked:", loginEmail);

    if (!loginEmail || !password) {
      return res.status(400).send("Email and password are required");
    }

    const user = await User.findOne({ email: loginEmail });
    console.log("Found User:", user); // Debug user
    if (!user) return res.status(404).send("Invalid Credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password Valid:", isPasswordValid);
    if (isPasswordValid) {
      const token = jwt.sign({ _id: user._id }, "RedVelvet@123&", {
        expiresIn: "1h",
      });
      console.log("Generated Token:", token);
      res.cookie("token", token, { httpOnly: true });
      // Ensure user data is sent
      res.status(200).send({
        message: "Login successful",
        token,
        user: {
          name: user.name || "Unknown",
          email: user.email || loginEmail,
          role: user.role || "Applicant", 
        },
      });
    } else {
      res.status(400).send("Invalid password");
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(400).send("Error: " + err.message);
  }
});

app.put('/user/update', async (req, res) => {
  try {
    const { _id, name, email, phone, age, gender, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { name, email, phone, age, gender, role },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/users", async (req, res) => {
  const userEmail = req.body.email; // Should be req.query.email for GET
  try {
    const user = await User.find({ email: userEmail });
    if (user.length === 0) {
      return res.status(404).send("User not found");
    } else {
      res.status(200).send(user);
    }
  } catch (error) {
    res.status(400).send("User not found");
  }
});

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(400).send("Error fetching users");
  }
});

app.delete("/delete", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete({ _id: userId });
    res.send("User deleted successfully");
  } catch (error) {
    res.status(400).send("Error deleting user");
  }
});

app.patch("/updateUser", async (req, res) => {
  const userId = req.body.userId; // Fixed from req.req?.userId
  const data = req.body;
  try {
    const ALLOWED_UPDATES = ["name", "password", "age", "phone"];
    const isUpdateAllowed = Object.keys(data).every((key) =>
      ALLOWED_UPDATES.includes(key)
    );
    if (!isUpdateAllowed)
      return res.status(400).send("Updating this is not allowed");

    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      new: true,
    });
    res.status(200).send("User updated successfully");
  } catch (error) {
    res.status(400).send("Error updating user");
  }
});

app.post('/api/jobs', auth, async (req, res) => {
  try {
    const { title, description, company, location, salary } = req.body;
    const job = new Job({
      title,
      description,
      company,
      location,
      salary,
      postedBy: req.user._id, // User ID from token
    });
    await job.save();
    res.status(201).send(job);
  } catch (err) {
    res.status(400).send('Error creating job: ' + err.message);
  }
});

// Read All Jobs
app.get('/api/jobs', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }); // Only user's jobs
    res.send(jobs);
  } catch (err) {
    res.status(400).send('Error fetching jobs: ' + err.message);
  }
});

// Read Single Job
app.get('/api/jobs/:id', auth, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).send('Job not found');
    res.send(job);
  } catch (err) {
    res.status(400).send('Error fetching job: ' + err.message);
  }
});

// Update Job
app.put('/api/jobs/:id', auth, async (req, res) => {
  try {
    const { title, description, company, location, salary } = req.body;
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id },
      { title, description, company, location, salary },
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).send('Job not found or not authorized');
    res.send(job);
  } catch (err) {
    res.status(400).send('Error updating job: ' + err.message);
  }
});

// Delete Job
app.delete('/api/jobs/:id', auth, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).send('Job not found or not authorized');
    res.send('Job deleted successfully');
  } catch (err) {
    res.status(400).send('Error deleting job: ' + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("MongoDB connected...");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });