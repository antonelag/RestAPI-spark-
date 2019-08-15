const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/users')
const jwt = require('jsonwebtoken');
router.post('/signup', (req, res, next) => {

    User.find({
        email: req.body.email
    })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({ message: 'Mail already exists' })
            }
            else {
                var user = new User({
                    imeIPrezime: req.body.imeIPrezime,
                    email: req.body.email,
                    lozinka: req.body.lozinka,
                    ponovljenaLozinka: req.body.ponovljenaLozinka,
                    prihvaceniUvjetiKoristenja: req.body.prihvaceniUvjetiKoristenja
                })
                if(user.lozinka.length<8)
                res.json({message:'Lozinka mora imati minimalno 8 karaktera.'})
                if (user.lozinka == user.ponovljenaLozinka && user.prihvaceniUvjetiKoristenja == true) {
                    try {
                        var nUser = user.save();
                        res.status(201).json({ message: 'User created' })
                    } catch (error) {
                        res.status(500).json({ message: error.message });
                    }
                }
                else
                    res.json({ message: 'Neispravno uneseni podaci!' });
            }
        })
        .catch()


})
router.post('/login', (req, res, next) => {



    User.find({ email: req.body.email }, function (err, obj) {
        if (err) {
            return res.status(401).json({ message: 'Auth failed' })
        }
        if(obj[0]!=undefined){

            var obj=obj[0].toObject();
            var lozinka = obj.lozinka;
            var email = obj.email;
            var id = obj._id;
            if (lozinka !== req.body.lozinka) {
              
    
                return res.status(401).json({ message: 'Auth failed2' })
            }
            else {
                const token= jwt.sign({
                    email: email,
                    userId:id
                }, process.env.JWT_KEY,{
                    expiresIn:"1h"
                }
                );
                return res.status(200).json({ message: 'Auth successful',token:token })
            }
        }
        else{
            return res.status(401).json({ message: 'Auth failed' })

        }

    })


})
router.delete('/:id', async (req, res) => {

    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted!' })
    } catch (error) {
        res.json({ message: error.message })
    }

})

module.exports = router;