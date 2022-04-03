const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');

const bcrypt = require('bcrypt');
const saltRounds = 16;

const blogsData = mongoCollections.blogs;
const userData = mongoCollections.users;

//converts id to object id
async function convertToObject(id){
    try{
        return ObjectId(id);
    }catch(e){
        throw 'Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters';
    }
}

async function getUserById(id){
   // let parsedId = await convertToObject(id);
    
    const userCollection = await userData();

    const userDetails = await userCollection.findOne({_id: id});

    if(userDetails === null || !userDetails) throw "User not found";

    userDetails._id = userDetails._id.toString();  //converting objectId to string

    return userDetails;
}

async function addUser(userDetails){
    //console.log(userDetails);
    /* checking if userDetails exists */
    if (!userDetails){
        throw "userDetails must be provided";
    }

    //checking if body is of type object
    if(typeof userDetails !== "object"){
       throw "userDetails must be an object";
    }

    //checking if object is empty
    if(Object.keys(userDetails).length === 0 || Object.keys(userDetails).length !== 3){
       throw "all fields of userDetails are not provided."
    }

    //checking if name is string
    if(typeof userDetails.name !== "string"){
       throw "name must be an non-empty string"
    }

    if(typeof userDetails.name === ""){
        throw "name must be an non-empty string"
    }

    //checking if username is string
    if(typeof userDetails.username !== "string"){
        throw "username must be an non-empty string"

    }

    if(userDetails.username === ""){
        throw "username must be an non-empty string"
    }

    //checking if password is string
    if(typeof userDetails.password !== "string"){
        throw "password must be an non-empty string"

    }

    if(userDetails.password === ""){
        throw "password must be an non-empty string"

    }

    let hashedPassword = await bcrypt.hash(userDetails.password, saltRounds);
    
    let userSignUpDetails = {
        name: userDetails.name,
        username: userDetails.username,
        password: hashedPassword
    }

    const userCollection = await userData();

    const insertInfo = await userCollection.insertOne(userSignUpDetails);

    if(insertInfo.insertedCount === 0) throw "Could now add user";

    const newId = insertInfo.insertedId;  //returns id of type objectId
    
    const userInfo = await getUserById(newId);
    
    const createdUserDetails = {
        _id: userInfo._id,
        name: userInfo.name,
        username: userInfo.username,
        password: userDetails.password
    }
    //console.log(createdUserDetails);
    return createdUserDetails;
}

async function validateUser(userDetails){
    const { username, password } = userDetails;

    const userCollection = await userData();

    const userInfo = await userCollection.findOne({username: username});

    if (userInfo === null || !userInfo) throw "User not found";

    //console.log(userInfo);

    let match = await bcrypt.compare(password, userInfo.password); 
    
    return match;
}

async function getUserByUserName(userDetails){
    const username = userDetails.username;
    
    const userCollection = await userData();

    const userInfo = await userCollection.findOne({username: username});

    if (userInfo === null || !userInfo) throw "User not found"; 

    return userInfo;

}

async function getBlogs(){
    const blogsCollection = await blogsData();

    const blogsInfo = await blogsCollection.find({}).toArray();

    if(!blogsInfo || blogsInfo === null) throw "blogs collection is empty";

    return blogsInfo;
}

async function getBlogById(blogId){

    let parsedId;
    if (typeof blogId !== 'object'){
        parsedId = await convertToObject(blogId);
    }else {
        parsedId = blogId;
    }

    const blogsCollection = await blogsData();

    const blogsInfo = await blogsCollection.findOne({_id:parsedId});

    if(!blogsInfo || blogsInfo === null) throw "blog can not be found";

    blogsInfo._id = blogsInfo._id.toString();
    blogsInfo.userThatPosted._id = blogsInfo.userThatPosted._id.toString();

    return blogsInfo;
}

async function createBlogPost(blogPost){
    if(!blogPost) throw "Blog data is not provided."

    if(!blogPost.title) throw "title should be provided.";

    if(typeof blogPost.title !== "string") throw "title is not a string";

    if(blogPost.title === "") throw "title cannot be empty";

    if(!blogPost.body) throw "body should be provided.";

    if(typeof blogPost.body !== "string") throw "body is not a string";

    if(blogPost.body === "") throw "body cannot be empty";

    //console.log("in data");
    blogPost.userThatPosted._id = await convertToObject(blogPost.userThatPosted._id);
    //console.log(blogPost.userThatPosted._id);
    //console.log(blogPost);

    const blogsCollection = await blogsData();

    const blogPostInserted = await blogsCollection.insertOne(blogPost);

    if (blogPostInserted.insertedCount === 0) throw "could not insert blog";

    return await getBlogById(blogPostInserted.insertedId);
}

async function updateBlogPostByPut(blogId, updatedPost){
    // console.log("in data");
    // console.log(blogId);
    // console.log(updatedPost);
    let temp;
        if (ObjectId.isValid(blogId)){
            try{
                temp = ObjectId(blogId).toString();
            }catch(error){
               throw "id is not valid";   
            }
    
            if (temp !== blogId){
                throw "id is not valid";     
            }
        }else{
            throw "id is not valid"; 
        } 
    if(!updatedPost) throw "Blog data is not provided."

    if(!updatedPost.title) throw "title should be provided.";

    if(typeof updatedPost.title !== "string") throw "title is not a string";

    if(updatedPost.title === "") throw "title cannot be empty";

    if(!updatedPost.body) throw "body should be provided.";

    if(typeof updatedPost.body !== "string") throw "body is not a string";

    if(updatedPost.body === "") throw "body cannot be empty";

    let parsedBlogId = await convertToObject(blogId);
    const blogsCollection = await blogsData();
    const updatedBlogPost = await blogsCollection.updateOne({_id:parsedBlogId}, {$set: updatedPost});
    if (updatedBlogPost.matchedCount === 0 && updatedBlogPost.modifiedCount === 0)  throw 'Could not update blog post';
    return await getBlogById(blogId);
    //return { user: "valid"};
}

async function updateBlogPostByPatch(blogId, updatedPost){

    //console.log("in patch - data");

    let temp;
    if (ObjectId.isValid(blogId)){
        try{
            temp = ObjectId(blogId).toString();
        }catch(error){
           throw "id is not valid";   
        }

        if (temp !== blogId){
            throw "id is not valid";     
        }
    }else{
        throw "id is not valid"; 
    } 
    
    if(!updatedPost) throw "Blog data is not provided."

    if(updatedPost.title){
        if(typeof updatedPost.title !== "string") throw "title is not a string";

        if(updatedPost.title === "") throw "title cannot be empty";
    
    }
    
    if(updatedPost.body){
        if(typeof updatedPost.body !== "string") throw "body is not a string";

        if(updatedPost.body === "") throw "body cannot be empty";
    }
   
    let parsedBlogId = await convertToObject(blogId);

    let oldBlogPostData = await getBlogById(parsedBlogId);
    let modifiedBlogPost = {};

    modifiedBlogPost.comments = oldBlogPostData.comments;
    modifiedBlogPost.userThatPosted = oldBlogPostData.userThatPosted;

    if (updatedPost.title && oldBlogPostData.title !== updatedPost.title)
        modifiedBlogPost.title = updatedPost.title;
    else    
        modifiedBlogPost.title = oldBlogPostData.title; 
        
    if (updatedPost.body && oldBlogPostData.body !== updatedPost.body)
        modifiedBlogPost.body = updatedPost.body;
    else    
        modifiedBlogPost.body = oldBlogPostData.body;

    // console.log("updated post");    
    // console.log(modifiedBlogPost);

    const blogsCollection = await blogsData();
    const updatedBlogPost = await blogsCollection.updateOne({_id:parsedBlogId}, {$set: modifiedBlogPost});
    if (updatedBlogPost.matchedCount === 0 && updatedBlogPost.modifiedCount === 0)  throw 'Could not update blog post';
    return await getBlogById(blogId);

}

async function addCommentToBlog(blogId, comment){

    let temp;
    if (ObjectId.isValid(blogId)){
        try{
            temp = ObjectId(blogId).toString();
        }catch(error){
           throw "id is not valid";   
        }

        if (temp !== blogId){
            throw "id is not valid";     
        }
    }else{
        throw "id is not valid"; 
    }

    if(!comment) throw " comment should be provided.";
    if(typeof comment.comment !== "string") throw "comment should be a string";
    if(comment.comment.trim() === "") throw "comment can not be empty";

    const blogsCollection = await blogsData();
    let parsedId = await convertToObject(blogId);
    const _id = ObjectId();
 
   //console.log(comment);
    const updateInfo = await blogsCollection.updateOne( {_id:parsedId}, {$addToSet: {comments: { _id, userThatPostedComment: comment.userThatPostedComment, comment: comment.comment, }}});
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Could not add review';
      
    return await getBlogById(blogId);
}

async function deleteCommentFromBlog(blogId, commentId){

    let temp;
    if (ObjectId.isValid(blogId)){
        try{
            temp = ObjectId(blogId).toString();
        }catch(error){
           throw "blogid is not valid";   
        }

        if (temp !== blogId){
            throw "blogid is not valid";     
        }
    }else{
        throw "blogid is not valid"; 
    }
    let temp2;
    if (ObjectId.isValid(commentId)){
        try{
            temp2 = ObjectId(commentId).toString();
        }catch(error){
           throw "commentId is not valid";   
        }

        if (temp2 !== commentId){
            throw "commentId is not valid";     
        }
    }else{
        throw "commentId is not valid"; 
    }

    let parsedBlogId = await convertToObject(blogId);
    let parsedCommentId = await convertToObject(commentId);
    console.log(parsedBlogId);
    console.log(parsedCommentId);
    const blogsCollection = await blogsData();
    //const commentsList = await blogsData.findOne({"comments._id": parsedCommentId}, {_id: 1});

    //if(commentsList === null) throw "no comment found.";

    const updateBlogInfo = await blogsCollection.updateOne({_id: parsedBlogId}, {$pull: {comments: {_id: parsedCommentId}}});
    //console.log(updateBlogInfo.matchedCount);
    if (updateBlogInfo.matchedCount === 0 && updateBlogInfo.modifiedCount === 0) throw 'Could not delete comment'; 
    
    return await getBlogById(blogId);
}

async function getCommentByCommentId(commentId){
    //console.log("in data");
    const blogsCollection = await blogsData();
    let parsedCommentId = await convertToObject(commentId);
    console.log(parsedCommentId);
    const blogWithCommentInfo = await blogsCollection.findOne({"comments._id": parsedCommentId}, {projection:  {_id:0, comments:1}});
    let commentObj;
    if(!blogWithCommentInfo || blogWithCommentInfo == null){
        throw "comment not found";
    }
    //console.log(blogWithCommentInfo.comments.length);

    // for (let index = 0; index < blogWithCommentInfo.comments.length; index++){
    //     console.log(blogWithCommentInfo.comments[index]._id);

       
    // }

    for (let index = 0; index < blogWithCommentInfo.comments.length; index++){
        //console.log(blogWithCommentInfo.comments[index]._id.toString() === parsedCommentId.toString());

        if (blogWithCommentInfo.comments[index]._id.toString() === parsedCommentId.toString()){
            commentObj = blogWithCommentInfo.comments[index];
            break;
        }
    }
    //console.log(commentObj);
    return commentObj;
}

module.exports = {
    addUser,
    validateUser,
    getBlogs,
    getBlogById,
    getUserByUserName,
    createBlogPost,
    updateBlogPostByPut,
    updateBlogPostByPatch,
    addCommentToBlog,
    deleteCommentFromBlog,
    getCommentByCommentId
};