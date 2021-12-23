const express = require('express'); //modules
const bodyParser = require('body-parser');

const morgan = require('morgan');
const app = express(); //instantiate app

const mongoose = require('mongoose');
const Models = require('./models.js');

const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;


mongoose.connect('mongodb://localhost:27017/myFlixDB',
    { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS //
const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
const {param} = require("express-validator/src/middlewares/validation-chain-builders");

app.use(morgan('common')); //invoke logger

// GET requests
app.get('/', passport.authenticate('jwt', { session: false }),
    (req, res) => {
    res.send('Welcome to my myFlix App!');
});

// Get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }),
    (req, res) => {
    Movies.find()
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get a movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }),
    (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            if (movie === null){
                res.status(404).send("No movie found")
            } else {
                res.json(movie);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get a genre by name
app.get('/genres/:Name', passport.authenticate('jwt', { session: false }),
    (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Name })
        .then((movie) => {
            if (movie === null){
                res.status(404).send("No genre found")
            } else {
                res.json(movie.Genre);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get information about a director by name
app.get('/directors/:Name', passport.authenticate('jwt', { session: false }),
    (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
        .then((movie) => {
            if (movie === null){
                res.status(404).send("No director found")
            } else {
                res.json(movie.Director);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users',
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ],
    (req, res) => {
        // check the validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

     let hashedPassword = Users.hashPassword(req.body.Password);
     Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => {
                        res.status(201).json(user);
                    })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }),
    (req, res) => {
    Users.find()
        .then((users) => {
            res.json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }),
    (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            if (user === null){
                res.status(404).send("No user found")
            } else {
                res.json(user);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String, (required)
  Password: String, (required)
  Email: String, (required)
  Birthday: Date
}*/
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ],
    (req,res) => {
        // check the validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);

        Users.findOneAndUpdate(
            { Username: req.params.Username },
            { $set: {
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }},
            { new: true }, // This line makes sure that the updated document is returned
        )
            .then((user) => {
                if (user === null){
                    res.status(404).send("No user found")
                } else {
                    res.json(user);
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID',
    passport.authenticate('jwt', { session: false }),
    [
        param('MovieID', 'MovieId must be valid ObjectId').custom(value => {
            return mongoose.Types.ObjectId.isValid(value);
        })
    ],
    (req, res) => {

        // check the validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        Users.findOneAndUpdate(
            { Username: req.params.Username },
            {
                $push: { FavoriteMovies: req.params.MovieID }
            },
            { new: true }, // This line makes sure that the updated document is returned
        )
            .then((user) => {
                if (user === null){
                    res.status(404).send("No user found")
                } else {
                    res.json(user);
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });

// Remove a movie to a user's list of favorites
app.delete('/users/:Username/movies/:MovieID',
    passport.authenticate('jwt', { session: false }),
    [
        param('MovieID', 'MovieId must be valid ObjectId').custom(value => {
            return mongoose.Types.ObjectId.isValid(value);
        })
    ],
    (req, res) => {

        // check the validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        Users.findOneAndUpdate(
            { Username: req.params.Username },
            {
                $pull: { FavoriteMovies: req.params.MovieID }
            },
            { new: true }, // This line makes sure that the updated document is returned
        )
            .then((user) => {
                if (user === null){
                    res.status(404).send("No user found")
                } else {
                    res.json(user);
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });

// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }),
    (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


app.use(express.static('public', {
    extensions: ['html'],
}));

app.use((err, req, res, next) => { //error handling
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
    console.log('Listening on Port ' + port);
});