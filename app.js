const express = require('express');
const mongoose = require('mongoose');
const bParse = require('body-parser');
const path = require('path');

const cardSchema = mongoose.Schema({
    title: String,
    tasks: [{}],
    id: String,
    inputId: String,
    // // remember to mark modified: card.markModified('addCard')
    // // card.save();
    // addCard: {},
    // deletCard: {}

});

const Card = mongoose.model('Card', cardSchema);

mongoose.connect('mongodb://localhost/cards');

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => console.log('connected to mongo!'));

let app = express();
app.use(bParse.json());
app.use(bParse.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, resp) => {
    resp.sendFile('index.html', {root: __dirname + '/views'});
});

app.get('/cards', (req, resp) => {
    // res.json
    Card.find({}, (err, cards) => {
        if(err) resp.send(err);
        resp.json(cards);
    })

});

app.get('/delete', (req, resp) => {
    Card.deleteMany({});
});

app.post('/add', (req, resp) => {
    // ;)
    Card.deleteMany({}).then(() => {
       let cards = JSON.parse(req.body.cards);
       let dbCards = [];
       for(let i = 0; i < cards.length; i++){

           let card = new Card({
               title: cards[i].title,
               tasks: cards[i].tasks,
               id: cards[i].id,
               inputId: cards[i].inputId
           });
           card.markModified('tasks');
           dbCards.push(card);
       }
       saveAllCards(dbCards, 0);
    })
});

app.listen(3000, () => console.log('server listening on port 3000'));

function saveAllCards(cards, index){
    if(!(cards.length === index - 1)){
        try{
            cards[index].save()
                .then(saveAllCards(cards, index + 1))
                .catch(() => {console.log('card not saved')});
        }
        catch(err){
            console.log('');
        }
    }
}