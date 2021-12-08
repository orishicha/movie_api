const express = require('express'); //modules
const morgan = require('morgan');

const app = express(); //instantiate app

app.use(morgan('common')); //invoke logger

let movies = [
    {
        title: 'Shrek',
        year: '2001'
    },
    {
        title: 'Shrek 2',
        year: '2004'
    },
    {
        title: 'Shrek the Third',
        year: '2007'
    },
    {
        title: 'Shrek the Halls',
        year: '2007'
    },
    {
        title: 'Shrek Forever After',
        year: '2010'
    },
    {
        title: 'Donkey\'s Christmas Shrektacular',
        year: '2010'
    },
    {
        title: 'Shrek\'s Yule Log ',
        year: '2010'
    },
    {
        title: 'Scared Shrekless',
        year: '2010'
    },
    {
        title: 'Puss in Boots',
        year: '2011'
    },
    {
        title: 'Thriller Night',
        year: '2011'
    },
    {
        title: 'The Pig Who Cried Werewolf',
        year: '2011'
    },
    {
        title: 'Puss in Boots: The Three Diablos',
        year: '2012'
    },
    {
        title: 'Puss in Book: Trapped in an Epic Tale',
        year: '2017'
    },
    {
        title: 'The Adventures of Puss in Boots',
        year: '2015-2018'
    },
];

// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to my myFlix App!');
});

app.get('/movies', (req, res) => {
    res.json(movies);
});

app.get('/movies/:title', (req, res) => {
    res.send('Movie by title');
});

app.get('/genres/:title', (req, res) => {
    res.send('Genre by name/title');
});

app.get('/directors/:name', (req, res) => {
    res.send('Data about director by name');
});

app.post('/users', (req, res) => {
    res.send('Registration completed');
});

app.put('/users/:username', (req, res) => {
    res.send('Information updated');
});

app.post('/users/:username/movies/:movieID', (req, res) => {
    res.send('Movie was added to favorites');
});

app.delete('/users/:username/movies/:movieID', (req, res) => {
    res.send('Movie was deleted');
});

app.delete('/users/:username', (req, res) => {
    res.send('Your account was successfully deleted');
});

app.use(express.static('public', {
    extensions: ['html'],
}));

app.use((err, req, res, next) => { //error handling
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});