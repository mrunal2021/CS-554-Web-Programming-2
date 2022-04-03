const portfolioRoute = require('./portfolio');

const indexConstructorMethod = (app) => {
    app.use("/", portfolioRoute);

    app.use("*", (req,res)=>{
        res.status(404).json({error: 'The requested resource is not found'});
    });
};

module.exports = indexConstructorMethod;