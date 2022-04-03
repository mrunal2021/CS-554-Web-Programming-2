const blogRoute = require('./blog');

const indexConstructorMethod = (app) => {
    app.use("/blog", blogRoute);

    app.use("*", (req,res)=>{
        res.status(404).json({error: 'The requested resource is not found'});
    });
};

module.exports = indexConstructorMethod;