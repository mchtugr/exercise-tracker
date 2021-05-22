require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({ extended : false }));

mongoose
    .connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false} )
    .then(() => console.log('connected to MongoDB'))
    .catch(err => console.log(err));

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    count: Number,
    logs: [{
            description : String,
            duration: Number,
            date: Date
        }]
})

const User = new mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.post('/api/users', (req, res) => {
    User.findOne({username: req.body.username})
        .then(foundUsername => {
            if(foundUsername){
                res.json({
                    _id: foundUsername._id,
                    username: foundUsername.username
                })
            } else {
                const newUser = new User({
                    username: req.body.username
                })
                newUser
                    .save()
                    .then(newUser => {
                        res.json({
                            _id: newUser._id,
                            username: newUser.username
                        })
                    })
                    .catch(err => console.log(err))
            }
        })    
})

app.post('/api/users/:_id/exercises', (req, res) => {
    const id = req.body.id
    let date = req.body.date;
    if(req.body.date === ''){
        date = new Date().toISOString().split('T')[0];
    }
    let newLog = {
        description: req.body.description,
        duration: req.body.duration,
        date
        }
    User.findByIdAndUpdate(id, {$addToSet: { logs: newLog}})
        .then(updatedUser => {
            res.json(updatedUser)
        })
        .catch(err => {
            res.json({err})
        })
})

// app.post('/api/users/:_id/exercises', (req, res) => {
//     User.findOne({ _id: req.body.id })
//         .then(foundUser => {
//             if(!foundUser){
//                 res.status(400).json({ error: "User not found"})
//             } else {
//                 let date = req.body.date;
//                 if(req.body.date === ''){
//                     date = new Date();
//                 }
//                     let newLog = {
//                         description: req.body.description,
//                         duration: req.body.duration,
//                         date
//                     }
//                     foundUser.logs.push(newLog);
//                     foundUser
//                         .save()
//                         .then(updatedUser => {
//                             res.json(updatedUser)
//                         })
//                         .catch(err => console.log(err))                
//             }
//         })
// })

app.get('/api/users/:_id/logs', (req, res) => {
    const id = req.params._id;
    const limit = req.query.limit
    User.findOne({_id: id}, {username:1, logs:{$slice: -limit}})
        .then(foundUser => {
            res.json(foundUser)
        })
})
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port: ${port}`));