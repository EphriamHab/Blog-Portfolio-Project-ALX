const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const User = require("./models/User");
const Post = require("./models/Post");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "/tmp/uploads/" });
const fs = require("fs");

const bcrypt = require("bcryptjs");
const PostModel = require("./models/Post");

const salt = bcrypt.genSaltSync(10);
const secret = "asdfe45we45w345wegw345werjktjwertkj";

const PORT = process.env.PORT || 4000;

// middle ware to use imported library.

// app.use(express.static(path.join(__dirname, "../client/build")));
app.use("/uploads", express.static("/tmp/uploads"));
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'https://blog-portfolio-project-alx-te3e.vercel.app', 
  credentials: true
}));

dotenv.config();

// database connection

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// register user

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (error) {
    res.status(400).json(error);
  }
});
// user login ased on crediantials

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token).json({
        id: userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json("wrong credintials");
  }
});
// get profile info that saved during regisster

app.get("/profile", (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, secret, (err, info) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    res.json(info);
  });
});

// logout the app

app.post("/logout", (req, res) => {
  res.cookie("token", "", { expires: new Date(0) });
  res.setHeader("Content-Type", "application/json"); // Set Content-Type explicitly
  res.json({ message: "Logged out successfully" });
});

// create and post our idea

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    });
    res.json(postDoc);
  });
});

// edit our post if you are author of the post

// In your POST /post route
app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json("No file uploaded");
  }

  const { originalname, path: tempPath } = req.file; 
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = tempPath + "." + ext;
  
  try {
    fs.renameSync(tempPath, newPath);
    
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err;
      const { title, summary, content } = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath.replace('/tmp', ''), 
        author: info.id,
      });
      res.json(postDoc);
    });
  } catch (error) {
    console.error("File handling error:", error);
    res.status(500).json("Error processing file");
  }
});

// delete our post if you are author of the post

app.delete("/post/:id", async (req, res) => {
  console.log("DELETE request received at /post/:id");
  const postId = req.params.id;

  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Missing Token" });
  }
  jwt.verify(token, secret, async (err, userInfo) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    try {
      const post = await PostModel.findById(postId);
      if (!post) {
        return res.status(404).json("Post not found");
      }
      if (post.author.toString() === userInfo.id) {
        try {
          await post.deleteOne();
          return res.status(200).json("Post has been deleted");
        } catch (error) {
          return res.status(500).json("Error deleting post");
        }
      } else {
        return res.status(401).json("You can delete only your post!");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  });
});

// display post information

app.get("/post", async (req, res) => {
  res.json(
    await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

// get user info

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});

// get all post of user

app.get("/", (req, res) => {
  return res.json({ 
    message: "Welcome to my blog API",
    endpoints: {
      register: "/register",
      login: "/login",
      posts: "/post",
      profile: "/profile"
    }
  });
});
  

app.listen(PORT, (req, res) => {
  console.log("Server is running on port 4000");
});
