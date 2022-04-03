const dbConnection = require('../config/mongoConnection');
const mongoCollections = require('../config/mongoCollections');
const data = require('../data/');
const { ObjectId } = require('mongodb');
// const bcrypt = require('bcrypt');
// const saltRounts = 16;
const blog = data.blog;

const blogs = mongoCollections.blogs;
//const users = mongoCollections.users;

const main = async() => {

    const db = await dbConnection();
    await db.dropDatabase();

    const blogsCollection = await blogs();
    //const usersCollection = await users();

    // const plainTextPassword = 'Password';
    // const hash = await bcrypt.hash(plainTextPassword, saltRounts);

    // let userData = {
    //     name : "mrunal salunke",
    //     username : "msalunk3",
    //     password : hash
    // }
    // let blogData = {
    //     title: "My experience Teaching JavaScript", 
    //     body : "This is the blog post body.. here is the actually blog post content.. blah blah blah.....", 
    //     userThatPosted: {_id: "6136729ec8aa205d14e32fc0", username: "msalunk3"}, 
    //     comments: [
    //         {
    //             _id: ObjectId(),
    //             userThatPostedComment: {_id: "6136729ec8aa205d14e32fc0", username: "msalunk3"},
    //             comment: "Thank you for all your wonderful comments on my blog post!"
    //         }
    //     ]
    // }

    for (let index = 0; index < 100; index++){
        let blogData = {
            title: index+" My experience Teaching JavaScript", 
            body : "This is the blog post body.. here is the actually blog post content.. blah blah blah.....", 
            userThatPosted: {_id: "6136729ec8aa205d14e32fc0", username: "msalunk3"}, 
            comments: [
                {
                    _id: ObjectId(),
                    userThatPostedComment: {_id: "6136729ec8aa205d14e32fc0", username: "msalunk3"},
                    comment: "Thank you for all your wonderful comments on my blog post!"
                }
            ]
        }
        const insertInfoBlog = await blogsCollection.insertOne(blogData);

        if(insertInfoBlog.insertedCount === 0) throw "Could not insert blog data";
    }
    
    // const insertInfo = await usersCollection.insertOne(userData);

    // if(insertInfo.insertedCount === 0) throw "Could not insert user data";

    //const insertInfoBlog = await blogsCollection.insertOne(blogData);

    await blog.addUser({
        name : "mrunal salunke",
        username : "msalunk3",
        password : "abcd"
    });

    await blog.addUser({
        name : "mrunal patil",
        username : "mpatil",
        password : "abcd"
    });

    console.log("Done seeding Database");
    
    await db.serverConfig.close();

};

main();