const express = require("express")
const app = express()
app.post('/register', (req,res)=>{
res.json('test ok')
})
app.listen(4000,(req,res)=>{
    console.log("App is listen on port 400")
})
