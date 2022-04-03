const express = require('express');
const router = express.Router();

router.get('/', async(req,res)=>{
    // console.log("in Routes");
    try{
        res.render('layouts/main', { portfolioContent: "The office.", title: "The Office"});
    }catch(e){
        res.status(500).json({error: "Internal server error"});
    }
});

module.exports = router;