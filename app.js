const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const cardSchema = mongoose.Schema({
    title: String,
    tasks: Array,
    id: String,
    inputId: String,
    // remember to mark modified: card.markModified('addCard')
    // card.save();
    addCard: {},
    deletCard: {}

});

const Card = mongoose.model('User', cardSchema);

mongoose.connect('mongodb://localhost/users');

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => console.log('connected to mongo!'));

let app = express();
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, resp) => {
    resp.sendFile('index.html', {root: __dirname + '/views'});
});

app.post('/:cards', (req, resp) => {
   console.log(req.params.cards);
});

app.listen(3000, () => console.log('server listening on port 3000'));