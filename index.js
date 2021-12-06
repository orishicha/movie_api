const express = require('express'); //modules
const morgan = require('morgan');

const app = express(); //instantiate app

app.use(morgan('common')); //invoke logger

let topMovies = [
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
    res.send('Welcome to my Shrek Movies Club!');
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.use(express.static('public'));

app.use((err, req, res, next) => { //error handling
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});