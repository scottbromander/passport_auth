var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.json(req.isAuthenticated());
});

router.get('/name', function(req, res, next){
    console.log("HI CLASS: ", req.isAuthenticated());

    res.json(req.user.username);
});

module.exports = router;