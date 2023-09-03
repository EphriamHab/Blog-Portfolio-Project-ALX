const express = require("express")
const cors = require("cors");
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post')
const app = express()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads'));
mongoose.connect("mongodb+srv://ephremhabtamu0524:ephrem1234@cluster1.n3bi7va.mongodb.net/mernBlog?retryWrites=true&w=majority")
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

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
  })

// app.get('/profile',(req,res)=>{
//   

//   })
//   res.json(req.cookies);
// });
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




app.post('/logout',(req,res)=>{
    res.cookie('token','').json('ok');
});

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

app.get('/post', async(req,res)=>{
  res.json(
    await Post.find()
    .populate('author',['username'])
    .sort({createdAt:-1})
    .limit(20)
    );

});

app.get('/post/:id', async(req,res)=>{
const {id} = req.params;
const postDoc = await Post.findById(id).populate('author',['username']);
res.json(postDoc);
});


app.listen(4000);
