const express = require('express');
const session = require('express-session');
const app = express();
const configRoutes = require('./routes');

app.use(express.json());

app.use(session({
    name: "AuthCookie",
    secret: "secret-key",
    saveUninitialized: true,
    resave: false
}));

//middleware functions

//POST	/blog
app.post('/blog', (req,res,next)=>{
    // console.log(req.method);
    // console.log(req.url);
    // console.log(req.session.loginStatus);
    if(req.session.loginStatus){
        next();
    }else{
        return res.status(403).json({message: "User is not logged in."});
    }
});

//PUT	/blog/:id
app.put('/blog/:id', (req,res,next)=>{
    // console.log(req.method);
    // console.log(req.url);
    // console.log(req.session.loginStatus);
    if(req.session.loginStatus){
        next();
    }else{
        return res.status(403).json({message: "User is not logged in."});
    }
});

//PATCH	/blog/:id
app.patch('/blog/:id', (req,res,next)=>{
    // console.log(req.method);
    // console.log(req.url);
    // console.log(req.session.loginStatus);
    if(req.session.loginStatus){
        next();
    }else{
        return res.status(403).json({message: "User is not logged in."});
    }
});

//POST	/blog/signup
app.use('/blog/signup', (req,res,next)=>{
    //console.log("in /blog/signup");
    next();
});

//POST	/blog/login
app.use('/blog/login', (req, res, next)=>{
  //  console.log("in /blog/login");
    if (req.session.loginStatus)
        res.status(400).json({message: "You are already logged in."})
    else
        next();
});

//GET	/blog/logout
app.use('/blog/logout', (req, res, next)=>{
  //  console.log("in /blog/logout");
    if (!req.session.loginStatus)
        res.status(400).json({message: "You are not logged in. You must be logged in before logging out."})
    else
        next();
});

// app.use('/blog', (req,res,next)=>{
//     console.log(req.method);
//     console.log(req.url);
//     console.log(req.session.loginStatus);
//     console.log("in /blog");
//     console.log(req.method == "POST" && req.url == undefined);
//     if(req.method == "POST" && req.url == undefined){
//         console.log("in if");
//         if(req.session.loginStatus){
//             next();
//         }else{
//             return res.status(403).json({message: "User is not logged in."});
//         }
//     }else  
//         return;
// });

app.post('/blog/:id/comments', (req,res,next)=>{
    //console.log("in /blog/:id/comments");
    if(req.session.loginStatus){
        next();
    }else{
        return res.status(403).json({message: "User is not logged in."});
    }
});

app.delete('/blog/:blogId/:commentId', (req,res,next)=>{
   // console.log("in /blog/:blogId/:commentId");
    if(req.session.loginStatus){
        next();
    }else{
        return res.status(403).json({message: "User is not logged in."});
    }
});

configRoutes(app);

app.listen(3000, ()=>{
    console.log("We have a server");
    console.log("Routes will be running on http://localhost:3000");
});