const express = require('express');
const router = express.Router();
const data = require('../data');
const blogData = data.blog;
const { ObjectId } = require('mongodb').ObjectId;

router.post('/signup', async(req, res)=>{

    //console.log("in SignUp");
    // console.log(req.body);
    let userDetails = req.body;
    userDetails.username = userDetails.username.toLowerCase();
    // console.log(userDetails);
    
    /* checking if body exists */
    if (!userDetails){
        res.status(400).json({error: 'All details are not supplied', message: 'You must provide name, username and password'});
        return;
    }

    //checking if body is of type object
    if(typeof userDetails !== "object"){
        res.status(400).json({error: 'Data is not of type object', messgae: 'You must provide data is json'});
        return;
    }

    //checking if object is empty
    if(Object.keys(userDetails).length === 0 || Object.keys(userDetails).length !== 3){
        res.status(400).json({error: 'All details are not supplied', message: 'You must provide name, username and password'});
        return;
    }

    //checking if name is string
    if(typeof userDetails.name !== "string"){
        res.status(400).json({error: 'name is not a string', message: 'name must be a non-empty string'});
        return;
    }

    if(typeof userDetails.name === ""){
        res.status(400).json({error: 'name is an empty string', message: 'name must be a non-empty string'});
        return;
    }

    //checking if username is string
    if(typeof userDetails.username !== "string"){
        res.status(400).json({error: 'username is not a string', message: 'username must be a non-empty string'});
        return;
    }

    if(userDetails.username === ""){
        res.status(400).json({error: 'username is an empty string', message: 'username must be a non-empty string'});
        return;
    }

    //checking if password is string
    if(typeof userDetails.password !== "string"){
        res.status(400).json({error: 'password is not a string', message: 'password must be a non-empty string'});
        return;
    }

    if(userDetails.password === ""){
        res.status(400).json({error: 'password is an empty string', message: 'password must be a non-empty string'});
        return;
    }

    //console.log(username + " " + name + " " + password);
    try{
        const userSignUpInfo = await blogData.addUser(
            // username,
            // name,
            // password
            userDetails
        );
        
        res.status(200).json(userSignUpInfo);  
    }catch(e){  
        res.status(500).json({error: e});
    }
});

router.post('/login', async(req, res)=>{
    let userDetails = req.body;
    userDetails.username = userDetails.username.toLowerCase();
    //console.log(userDetails)
    
    if (Object.keys(req.body).length !== 2){
        res.status(400).json({ error: 'All the data is not provided', message: 'You must provide all the username and password to login'});
        return;
    }

    if(typeof userDetails.username !== "string"){
        res.status(400).json({error: 'username is not a string', message: 'username must be a non-empty string'});
        return;
    }

    if(userDetails.username === ""){
        res.status(400).json({error: 'username is an empty string', message: 'username must be a non-empty string'});
        return;
    }

    //checking if password is string
    if(typeof userDetails.password !== "string"){
        res.status(400).json({error: 'password is not a string', message: 'password must be a non-empty string'});
        return;
    }

    if(userDetails.password === ""){
        res.status(400).json({error: 'password is an empty string', message: 'password must be a non-empty string'});
        return;
    }

    try{
        const isSuccess = await blogData.validateUser(userDetails);
        // res.status(200).json(userLoginInfo);
        // console.log("Data" + userLoginInfo.password);
        // console.log("Data" + userLoginInfo.username);
        // console.log("Data" + userLoginInfo.userInfo);
        // if (userLoginInfo.match) {
        //     res.status(200).json(userLoginInfo.userInfo);
        // }else{
        //     res.status(200).json(userLoginInfo); 
        // }
        //console.log(isSuccess);
        if (isSuccess){
            const userInfo = await blogData.getUserByUserName(userDetails);
            //console.log(userInfo);
            req.session.cookie.maxAge = 60000;
            req.session.userDetails = {
                userAuthenticated: true,
                userName: userDetails.username,
                userId: userInfo._id
            };
            req.session.loginStatus= true;
            //console.log(req.session.userDetails);
            res.status(200).json({ _id: userInfo._id, name: userInfo.name, username: userInfo.username, password: userDetails.password});
        }else {
            req.session.userDetails = {
                userAuthenticated: false
            }
            req.session.loginStatus= false;
           // console.log(req.session.userDetails);
            res.status(200).json("Username or password is incorrect.");
        }   
    }catch(e){
        res.status(500).json({error:e});
    }
});

router.get('/logout', async(req,res)=>{
    try{
        if(req.session.loginStatus){
            req.session.cookie.expires = new Date(Date.now());
            req.session.destroy();
            res.clearCookie('AuthCookie');
            res.status(200).json({message: "You have successfully logged out."});
        }else{
            res.status(403).json({message: "You must first login to logout."});
        }
    }catch(e){
        res.status(500).json({error:e})
    }
});

router.get('/', async(req, res)=>{
    try{
        const blogInfo = await blogData.getBlogs();
        let skip, take;
        
        if(req.query.skip){
            skip = parseInt(req.query.skip);                                // as req.query.skip is of type string

            if(isNaN(skip)){    //checking for type number
                res.status(400).json("Skip must be a positive number.");
                return;
            }
    
            if(skip <= 0)   //checking for skip <= 0
            {
                res.status(400).json("Skip must be a positive number greater than zero");
                return;
            }
        }

        if(req.query.take){
            take = parseInt(req.query.take);

            if(isNaN(take)){    //checking for type number
                res.status(400).json("Take must be a positive number.");
                return;
            }
            
            if(take <= 0)   //checking for skip <= 0
            {
                res.status(400).json("Take must be a positive number greater than zero");
                return;
            } 
        }

        let blogPosts = [];
        let size = 1;   
        if (skip && !take){                                                 //only skip is provided
            for(let index = skip; index < blogInfo.length; index++){
                if(size <= 20)                                              //displaying 20 blogs
                    {
                        blogPosts.push(blogInfo[index]);
                        size++;
                    }    
                else
                    break;    
            }
        }else if(take && !skip){                                             //only take is provided
            for (let index = 0; index < take && index < 100; index++){
                blogPosts.push(blogInfo[index]);
            }
        }else{                                                              //skip and take both are provided
            for (let index = skip; index < take && index < 100; index++){
                blogPosts.push(blogInfo[index]);
            }
        }
        //console.log(blogPosts.length);
        res.status(200).json(blogPosts);
    }catch(e){
        res.status(500).json({error:e});
    }
});

router.get('/:id', async(req,res)=>{
    try{
        //console.log(req.params.id);
        let temp;
        if (ObjectId.isValid(req.params.id)){
            try{
                temp = ObjectId(req.params.id).toString();
            }catch(error){
                res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
                return;    
            }
    
            if (temp !== req.params.id){
                res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
                return;     
            }
        }else{
            res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
            return;
        } 
        const blogInfo = await blogData.getBlogById(req.params.id);
        res.status(200).json(blogInfo);
    }catch(e){
        res.status(404).json({message: 'Enter a valid id', error: e})
    }
});

router.post('/', async(req,res)=>{
    try{
        //console.log("in post")
        //console.log(req.session.userDetails);
        //console.log(req.session.userDetails.userId + " " + req.session.userDetails.userName);

        if(!req.body){
            res.status(400).json({error:'data is not provided', message: "you must provide data to create blog"});
            return;
        }

        //checking type of req.body
        if (typeof req.body !== "object"){
            res.status(400).json({ error: 'Data is not of type object', message: 'You must provide data in json'});
            return;
        }

        //checking if req.body is empty
        if (!req.body || Object.keys(req.body).length === 0){
            res.status(400).json({ error: 'Data is not provided', message: 'You must provide data to create a book'});
            return;
        }

        //checking if req.body has all the fields
        if (Object.keys(req.body).length !== 2){
            res.status(400).json({ error: 'All the data is not provided', message: 'You must provide all the title and body to create a blog'});
            return;
        }

        //checking if title is string
        if(typeof req.body.title !== "string"){
            res.status(400).json({error: 'title is not of type string', message: 'title must be a non-empty string'});
            return;
        }

        //checking if title is empty
        if (req.body.title === ""){
            res.status(400).json({error: 'title is an empty string', message: 'title must be a non-empty string'});
            return;
        }
        //console.log(req.body.body);
         //checking if body is string
         if(typeof req.body.body !== "string"){
            res.status(400).json({error: 'body is not of type string', message: 'body must be a non-empty string'});
            return;
        }

        //checking if body is empty
        if (req.body.body === ""){
            res.status(400).json({error: 'body is an empty string', message: 'body must be a non-empty string'});
            return;
        }

        const blogPost = {
            "title" : req.body.title,
            "body" : req.body.body,
            "userThatPosted" : { "_id": req.session.userDetails.userId, "username": req.session.userDetails.userName },
            "comments" : []
        }
        //console.log(blogPost);
        const blogPostInserted = await blogData.createBlogPost(blogPost);
        //res.status(200).json(blogPost);
        //console.log(blogPostInserted);
        res.status(200).json(blogPostInserted);
    }catch(e){  
        res.status(500).json({error: e});
    }
});

router.put('/:id', async(req,res)=>{
    try{
        let temp;
        if (ObjectId.isValid(req.params.id)){
            try{
                temp = ObjectId(req.params.id).toString();
            }catch(error){
                res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
                return;    
            }
    
            if (temp !== req.params.id){
                res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
                return;     
            }
        }else{
            res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
            return;
        } 

        if(!req.body){
            res.status(400).json({error:'data is not provided', message: "you must provide data to update blog"});
            return;
        }

        //checking type of req.body
        if (typeof req.body !== "object"){
            res.status(400).json({ error: 'Data is not of type object', message: 'You must provide data in json'});
            return;
        }

        //checking if req.body is empty
        if (!req.body || Object.keys(req.body).length === 0){
            res.status(400).json({ error: 'Data is not provided', message: 'You must provide data to update a book'});
            return;
        }

        //checking if req.body has all the fields
        if (Object.keys(req.body).length !== 2){
            res.status(400).json({ error: 'All the data is not provided', message: 'You must provide all the title and body to create a blog'});
            return;
        }

        //checking if title is string
        if(typeof req.body.title !== "string"){
            res.status(400).json({error: 'title is not of type string', message: 'title must be a non-empty string'});
            return;
        }

        //checking if title is empty
        if (req.body.title.trim() === ""){
            res.status(400).json({error: 'title is an empty string', message: 'title must be a non-empty string'});
            return;
        }
        //console.log(req.body.body);
         //checking if body is string
        if(typeof req.body.body !== "string"){
            res.status(400).json({error: 'body is not of type string', message: 'body must be a non-empty string'});
            return;
        }

        //checking if body is empty
        if (req.body.body.trim() === ""){
            res.status(400).json({error: 'body is an empty string', message: 'body must be a non-empty string'});
            return;
        }

        const blogPostInfo = await blogData.getBlogById(req.params.id);
        //console.log(blogPostInfo);
        //checking if logged in user is the same user who posted the blog
        if (!req.session.userDetails.userId) res.status(500).json({message: "Please login again."});
        if(req.session.userDetails.userId === blogPostInfo.userThatPosted._id){
            //console.log("valid user");
            const blogPostUpdatedObj = {
                "title": req.body.title,
                "body": req.body.body,
                "userThatPosted" : { "_id": req.session.userDetails.userId, "username": req.session.userDetails.userName },
                "comments": blogPostInfo.comments
            }
            //console.log(blogPostUpdatedObj);
            const updatedBlogPost = await blogData.updateBlogPostByPut(req.params.id, blogPostUpdatedObj);
            res.status(200).json(updatedBlogPost);
        }else {
            //console.log("invalid user");
            res.status(401).json({message: "Currently logged in user is not the one posted the blog. Login with proper credentials."});
        }
    }catch(e){
        res.status(500).json({error:e});
    }
});

router.patch('/:id', async(req,res)=>{
    try{
        //check if same user is logged in

        if (ObjectId.isValid(req.params.id)){
            try{
                temp = ObjectId(req.params.id).toString();
            }catch(error){
                res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
                return;    
            }
    
            if (temp !== req.params.id){
                res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
                return;     
            }
        }else{
            res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
            return;
        }

        if(!req.body){
            res.status(400).json({error:'data is not provided', message: "you must provide data to update blog"});
            return;
        }

        //checking type of req.body
        if (typeof req.body !== "object"){
            res.status(400).json({ error: 'Data is not of type object', message: 'You must provide data in json'});
            return;
        }

        //checking if req.body is empty
        if (!req.body || Object.keys(req.body).length === 0){
            res.status(400).json({ error: 'Data is not provided', message: 'You must provide data to update a book'});
            return;
        }

        if (req.body.title || req.body.title != null){
                //checking if title is string
                console.log("Tetsing");
                if(typeof req.body.title !== "string"){
                    res.status(400).json({error: 'title is not of type string', message: 'title must be a non-empty string'});
                    return;
                }

                //checking if title is empty
                if (req.body.title.trim() === ""){
                    console.log("Testing 2");
                    res.status(400).json({error: 'title is an empty string', message: 'title must be a non-empty string'});
                    return;
                }
        }

        if(req.body.body){
            if(typeof req.body.body !== "string"){
                res.status(400).json({error: 'body is not of type string', message: 'body must be a non-empty string'});
                return;
            }
    
            //checking if body is empty
            if (req.body.body.trim() === ""){
                res.status(400).json({error: 'body is an empty string', message: 'body must be a non-empty string'});
                return;
            }
    
        }

        const blogPostInfo = await blogData.getBlogById(req.params.id);

        if (!req.session.userDetails.userId) res.status(500).json({message: "Please login again."});
        
        if(req.session.userDetails.userId === blogPostInfo.userThatPosted._id){
            //console.log("valid user");
            let updatedBlogPost = {};

            if (req.body.title && req.body.title != blogPostInfo.title){
                updatedBlogPost.title = req.body.title;
            }

            if(req.body.body && req.body.body != blogPostInfo.body){
                updatedBlogPost.body = req.body.body;
            }

            if (Object.keys(updatedBlogPost).length !== 0){
                try{
                    const updatedBlogPostInfo = await blogData.updateBlogPostByPatch(req.params.id, updatedBlogPost);
                    res.status(200).json(updatedBlogPostInfo);
                }catch(e){
                    res.status(500).json({error:e});
                }
            }else{
                res.status(400).json({error: 'No fields have been changed from their inital values, so no update has occurred', message:'enter valid data'});
            }
        }else {
            //console.log("invalid user");
            res.status(401).json({message: "Currently logged in user is not the one posted the blog. Login with proper credentials."});
        }   
    }catch(e){
        res.status(500).json({error:e});
    }
});

router.post('/:id/comments', async(req,res)=>{
    try{
        if (ObjectId.isValid(req.params.id)){
            try{
                temp = ObjectId(req.params.id).toString();
            }catch(error){
                res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
                return;    
            }
    
            if (temp !== req.params.id){
                res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
                return;     
            }
        }else{
            res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
            return;
        }

        //checking type of req.body
        if (typeof req.body !== "object"){
            res.status(400).json({ error: 'Data is not of type object', message: 'You must provide data in json'});
            return;
        }

        //checking if req.body is empty
        if (!req.body || Object.keys(req.body).length === 0){
            res.status(400).json({ error: 'Data is not provided', message: 'You must provide data to update a book'});
            return;
        }

        //checking if title is string
        if(!req.body.comment){
            res.status(400).json({error: 'comment is not provided', message: 'comment must be a non-empty string'});
            return;
        }

        if(typeof req.body.comment !== "string"){
            res.status(400).json({error: 'comment is not of type string', message: 'comment must be a non-empty string'});
            return;
        }

        //checking if title is empty
        if (req.body.comment.trim() === ""){
            res.status(400).json({error: 'comment is an empty string', message: 'comment must be a non-empty string'});
            return;
        }
        
        const comment = {
            "userThatPostedComment" : { "_id": req.session.userDetails.userId, "username": req.session.userDetails.userName },
            "comment": req.body.comment
        }

        const updatedBlogPost = await blogData.addCommentToBlog(req.params.id, comment);
        res.status(200).json(updatedBlogPost);
    }catch(e){
        res.status(500).json({error:e});
    }
});

router.delete('/:blogId/:commentId', async(req,res)=>{
    try{
        // console.log("in delete");
        // console.log(req.params.blogId);
        // console.log(req.params.commentId);
        if (ObjectId.isValid(req.params.blogId)){
            try{
                temp = ObjectId(req.params.blogId).toString();
            }catch(error){
                res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
                return;    
            }
    
            if (temp !== req.params.blogId){
                res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
                return;     
            }
        }else{
            res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
            return;
        }

        if (ObjectId.isValid(req.params.commentId)){
            try{
                temp = ObjectId(req.params.commentId).toString();
            }catch(error){
                res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
                return;    
            }
    
            if (temp !== req.params.commentId){
                res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
                return;     
            }
        }else{
            res.status(400).json({error: 'id is not valid', message: 'enter a valid Object Id'});
            return;
        }


        if (!req.session.userDetails.userId) res.status(500).json({message: "Please login again."});

        const commentDetails = await blogData.getCommentByCommentId(req.params.commentId);
        // console.log("comment info");
        // console.log(commentDetails);
        if(req.session.userDetails.userId === commentDetails.userThatPostedComment._id){
            const updatedBlogPost = await blogData.deleteCommentFromBlog(req.params.blogId, req.params.commentId);
            res.status(200).json(updatedBlogPost);
        }else{
            res.status(401).json({message: "Currently logged in user is not the one posted the comment. Login with proper credentials."});
        }
        
    }catch(e){
        res.status(500).json({error:e});
    }
});

module.exports = router;