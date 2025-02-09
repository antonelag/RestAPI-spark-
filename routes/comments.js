const express = require('express');
const router = express.Router();
const Comment = require('../models/comments')
const Topic = require('../models/topics');
var mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
var checkAuth = require('../middleware/check-auth');


//svi komentari
router.get('/', checkAuth, async (req, res) => {
    try {
        const comments = await Comment.find();
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//komentari za poslani id teme
router.get('/:id', checkAuth, async (req, res) => {
    try {
        var collection = await Comment.find();
        console.log(collection.length);
        var list = Array();
        collection.forEach(element => {
            console.log(element);
            if (element.topicID == req.params.id) {
                list.push(element);
            }
        });
        res.send(list);
    } catch (error) {
        res.json({ message: error.message });
    }
})

//kreiranje komentara
router.post('/', checkAuth, async (req, res) => {
    var id=req.userData.userId;

    var topic = Topic.findById(req.body.topicID);
    console.log(topic);
    if (topic !== null) {
        const nComment = new Comment({
            text: req.body.text,
            topicID: req.body.topicID,
            userID: id
        })
        try {
            const newComment = await nComment.save();
            res.status(201).json(newComment);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    else {
        res.json({ message: 'Topic does not exist' });
    }
})

//izmjena teksta komentara
router.patch('/:id', checkAuth, async (req, res) => {
    var id = req.userData.userId;
    try {
        var comment = await Comment.findById(req.params.id);
    } catch (error) {
        res.json({ message: error.message })
    }

    if (comment.userID != id) {
        res.json({ message: 'Mozete izmijeniti samo svoj komentar!' });
    }
    if (req.body.text != null) {
        comment.text = req.body.text;
    }
    try {
        var nComment = await comment.save();
        res.json(nComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

//brisanje komentara
router.delete('/:id', checkAuth, async (req, res) => {
    var id = req.userData.userId;
        var comment = await Comment.findById(req.params.id);
    if(comment !=null){

        if (comment.userID != id) {
            res.json({ message: 'Mozete izbrisati samo svoj komentar!' });
        }
        else
        {
    
            try {
                await Comment.findByIdAndDelete(req.params.id)
                res.json({ message: 'Deleted!' })
            } catch (error) {
                res.json({ message: error.message })
        
            }
        }
    }
    else{
        res.json({ message: 'Komentar nije pronađen' });
        
    }
})




//pretraga po tekstu u komentarima
router.get('/text/:text',checkAuth,async(req,res)=>{
    var textT=req.params.text.toLowerCase();
    console.log(textT)
    Comment.find({$or: [
        { text: { "$regex": textT, "$options": "i" } }
    ]}, function (err, data) {
        if(err)
        res.json({message:err.message});
        res.json(data);
    });
})

module.exports = router;