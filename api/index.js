const express = require("express")
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require('path');
const User = require('./models/User');
const Post = require('./models/Post')
const app = express()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const bcrypt = require('bcryptjs');
const PostModel = require("./models/Post");

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

// middle ware to use imported library.

const corsOptions = {
  credentials: true,
  origin: 'https://blogapp-m884.onrender.com',
};
app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, '../client/build')));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.json());
app.use(cookieParser());


dotenv.config();

// database connection

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

  // register user

app.post('/register', async(req,res)=>{
const {username,password} = req.body;
try {
const userDoc = await User.create({
    username,
    password:bcrypt.hashSync(password,salt),
})
res.json(userDoc);
} catch (error) {
    res.status(400).json(error);
}
})
// user login ased on crediantials

app.post('/login',async(req,res)=>{
  const {username,password} = req.body;
   const userDoc = await User.findOne({username});
   const passOk = bcrypt.compareSync(password, userDoc.password);
    if(passOk){
      jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
       if(err) throw err;
       res.cookie('token',token).json({
          id:userDoc._id,
          username,
       });
      })
    }else{
      res.status(400).json('wrong credintials')
    }
  });
  // get profile info that saved during regisster

app.get('/profile', (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, secret, (err, info) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

  
    res.json(info); 
  });
});



// logout the app

app.post('/logout',(req,res)=>{
  res.cookie('token', '', { expires: new Date(0) });
  res.setHeader('Content-Type', 'application/json'); // Set Content-Type explicitly
  res.json({ message: 'Logged out successfully' });});

// create and post our idea

app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {title,summary,content} = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover:newPath,
      author:info.id,
    });
    res.json(postDoc);
  });

});

// edit our post if you are author of the post

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content } = req.body;
    const filter = { _id: id };
    const update = {
      title,
      summary,
      content,
    };

    if (newPath) {
      update.cover = newPath;
    }
    const updatedPost = await Post.updateOne(filter, update);

    if (updatedPost.nModified === 0) {
      return res.status(400).json('Failed to update post'); 
    } 

    res.json(updatedPost);
  });
});

// delete our post if you are author of the post

app.delete("/post/:id", async (req, res) => {
  console.log("DELETE request received at /post/:id");
  const postId = req.params.id;

  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Missing Token' })
  }
  jwt.verify(token, secret, async (err, userInfo) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
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

app.get('/post', async(req,res)=>{
  res.json(
    await Post.find()
    .populate('author',['username'])
    .sort({createdAt:-1})
    .limit(20)
    );
});

// get user info

app.get('/post/:id', async(req,res)=>{
const {id} = req.params;
const postDoc = await Post.findById(id).populate('author',['username']);
res.json(postDoc);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});


app.listen(4000);
