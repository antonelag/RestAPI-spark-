const express = require('express');
const router = express.Router();
const Topic = require('../models/topics')
const checkAuth = require('../middleware/check-auth')
//get sve teme
router.get('/', checkAuth, async (req, res) => {
    try {
        const topics = await Topic.find();
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//get jedne teme
router.get('/:id', checkAuth, async (req, res) => {
    try {
        topic = await Topic.findById(req.params.id);
        res.send(topic);
    } catch (error) {
        res.json({ message: error.message });
    }
})


//kreiranje teme
router.post('/', checkAuth, async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    var id=req.userData.userId;
    const nTopic = new Topic({
        title: req.body.title,
        text: req.body.text,
        userID: id
    })
    try {
        const newTopic = await nTopic.save();
        res.status(201).json(newTopic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

//izmjena teksta teme
router.patch('/:id', checkAuth, async (req, res) => {
    var id = req.userData.userId;

    var topic = await Topic.findById(req.params.id);
    if (topic.userID != id) {
        res.json({ message: 'Mozete izmijeniti samo svoju temu.' });
    }
    if (req.body.text != null) {
        topic.text = req.body.text;
    }
    try {
        var nTopic = await topic.save();
        res.json(nTopic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

//brisanje teme
router.delete('/:id', checkAuth, async (req, res) => {
    var id = req.userData.userId;
    var topic = await Topic.findById(req.params.id);
    if (topic.userID != id) {
        res.json({ message: 'Mozete obrisati samo svoju temu.' })
    }
    
        try {
            await Topic.findByIdAndDelete(req.params.id)
            res.json({ message: 'Deleted!' })
        } catch (error) {
            res.json({ message: error.message })
        }
    
})
//search po nazivu teme
router.get('/title/:naziv',checkAuth,async(req,res)=>{
    var titleT=req.params.naziv.toLowerCase();
    
    Topic.find({$or: [
        { title: titleT }
    ]}, function (err, data) {
        if(err)
        res.json({message:err.message});
        res.json(data);
    });
})
module.exports = router;