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
mongoose.connect(
    "mongodb+srv://ephremhabtamu0524:ephrem1234@cluster1.n3bi7va.mongodb.net/mernBlog?retryWrites=true&w=majority"
    );
app.use(express.json());
app.use(cookieParser());


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

app.get('/profile',(req,res)=>{
  const {token} = req.cookies;
  jwt.verify(token, secret,{},(err,info)=>{
    if(err) throw err;
    res.json(info);
  })
  res.json(req.cookies)
});

app.post('/logout',(req,res)=>{
    res.cookie('token','').json('ok');
});

app.post('/post',uploadMiddleware.single('file'), async(req,res)=>{
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length-1];
    const newPath = path+'.'+ext;
    fs.renameSync(path,newPath);
    const {title,summary,content} = req.body;
     const postDoc = await Post.create({
      title,
      summary,
      content,
      cover:newPath,
    });
    res.json(postDoc);
  } catch (error) {N
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(4000);
