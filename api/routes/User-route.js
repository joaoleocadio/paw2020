var express = require('express');
var router = express.Router();
var User = require("../controllers/UserController")

//List users
router.get('/userList',function(req, res){
    User.listUsers(req,res)
})

//get specific user by ID
router.get('/:id',function(req, res){
    User.findOneUser(req,res)
})

//Create user
router.post('/create', function(req,res){
    User.createUser(req,res)
})

//delete user
router.delete('/:id', function(req, res) {
    User.deleteUser(req, res)
})

//update user
router.put('/:id', function(req, res) {
    User.UserController.updateUser(req, res)
})

// this will set the product on req.product - for any route that contains
router.param('id',User.setRole)



module.exports = router;