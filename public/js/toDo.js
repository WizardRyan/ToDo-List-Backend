import Card from './cardClass.js';

let row = document.getElementById('card-row');
let globalCardId = Math.ceil(Math.random() * 10000000);
let globalInputIdNum = Math.ceil(Math.random() * 1000000);
let globalInputId = "input-id-";
$('#add-new-btn').bind('click', addCard);
$('#clear-completed-btn').bind('click', deletCompleted);
$('#delete-all-btn').bind('click', deletAll);
$('#save-all-btn').bind('click', saveAll);
let local = window.localStorage;
let cards = [];

function getInputId() {
    return 'input-id-' + Math.ceil(Math.random() * 10000000);
}

// if (!local.getItem("cardArray")){
//     local.setItem("cardArray", JSON.stringify(cards));
//     addCard();
// }
//
// else{
//     cards = JSON.parse(local.getItem("cardArray"));
//     for(let i = 0; i < cards.length; i++){
//         addCard(null, cards[i]);
//     }
//
//     if(row.childNodes.length < 2){
//         addCard();
//     }
// }

$.get('http://localhost:27017/users')
    .then(resp => {
        return resp.json();
    })
    .then(myJson => {
       console.log(myJson);
    });


function saveAll(e){
    cards = [];
    let card;
    let title;
    let cardId;
    let inputId;

    for(let i = 0; i < row.childNodes.length; i++){
            card = row.childNodes[i];

        if(card.nodeType === Node.TEXT_NODE){
                //console.log("check success");
            }

            else{
                cardId = card.id;
                inputId = card.childNodes[1].childNodes[0].id;
                title = card.childNodes[0].childNodes[0].value;
                 let tasks = [];

            for(let j = 0; j < card.childNodes[1].childNodes.length; j++){
                let box = card.childNodes[1].childNodes[j];
                let checked = box.childNodes[0].childNodes[0].checked;
                let text= box.childNodes[1].value;
                tasks.push({text, checked});
            }

            let savedCard = new Card (title, tasks, cardId, inputId, addCard,  deletCard);
            cards.push(savedCard);

        }

        local.removeItem("cardArray");
        local.setItem("cardArray", JSON.stringify(cards));
    }

    toastr.success("All Cards Saved");
}

function saveCard(e){
    let cardId = e.target.parentElement.parentElement.parentElement.id;
    let inputId = e.target.parentElement.parentElement.parentElement.childNodes[1].childNodes[0].id;
    let title = e.target.parentElement.parentElement.parentElement.childNodes[0].childNodes[0].value;
    let items = [];
    for(let i = 0; i < e.target.parentElement.parentElement.parentElement.childNodes[1].childNodes.length; i++){
        let box = e.target.parentElement.parentElement.parentElement.childNodes[1].childNodes[i];
        let checked = box.childNodes[0].childNodes[0].checked;
        let text = box.childNodes[1].value;
        items.push({text, checked});
    }

    let savedCard = new Card(title, items, cardId, inputId, addCard, deletCard);

    let first = true;

    for(let i = 0; i < cards.length; i++){
        if(cards[i].id === savedCard.id){
            cards.splice(i, 1, savedCard);
            first = false;
        }
    }

    if(first){
        cards.push(savedCard);
    }


    local.removeItem("cardArray");
    local.setItem("cardArray", JSON.stringify(cards));

    toastr.success(`"${title}" Saved`);
}


function newRow(e) {
    let inputRow = e.target.parentElement;
    let newInputRow = inputRow.cloneNode(true);
    globalInputId = 'input-id-';
    //newInputRow.id = globalInputId + (globalInputIdNum++);
    newInputRow.id = getInputId();
    newInputRow.childNodes[1].value = "";
    inputRow.parentElement.appendChild(newInputRow);
    newInputRow.childNodes[1].focus();

    $(".form-control").unbind();
    $(".form-control").bind("keypress", function(e){
        if (e.keyCode === 13){
            newRow(e);
        }
    });

    $(".task-item-delete").bind("click", function(e){
        deletItem(e);
    });

}

function addCard(e, card){
    let newCardNode;

    if(typeof card !== 'undefined'){

         let newCard = new Card(card.title, card.tasks, card.id, card.inputId, addCard, deletCard);
         newCardNode = newCard.createNode();
    }

    else {
        globalCardId++;
        globalInputId = 'input-id-';
        globalInputIdNum++;
        globalInputId += globalInputIdNum;
        let newCard = new Card('', [{text: '', checked: false}], globalCardId, getInputId(), addCard, deletCard);
        newCardNode = newCard.createNode();
    }

        newCardNode.style.maxWidth = '150px';
        newCardNode.style.maxHeight = '209px';

        row.appendChild(newCardNode);
        let jVar = $(`#${newCardNode.id}`);

        $('.form-control').unbind();

        $(`.form-control`).bind("keypress", function (e) {
            if (e.keyCode === 13) {
                newRow(e);
            }
        });

        $(".card-delete").unbind();
        $(".card-delete").bind("click", function (e) {
            deletCard(e);
        });

        $('.card-save').unbind();
        $(`.card-save`).bind("click", function (e) {
            saveCard(e);
        });

        $(".task-item-delete").bind("click", function (e) {
            deletItem(e);
        });

        jVar.animate({maxWidth: '500px', maxHeight: '400px'}, 300);
}

function deletCard(e){
    let cardId = e.target.parentElement.parentElement.parentElement.id;
    let deletedCard = document.getElementById(cardId);
    let jVar = $(`#${cardId}`);
    jVar.animate({width: '0px', height: '40px'}, 200, () => {

        for(let i = 0; i < cards.length; i++) {
            if (cards[i].id === cardId) {
                cards.splice(i, 1);
            }
        }
        local.removeItem("cardArray");
        local.setItem('cardArray', JSON.stringify(cards));

        deletedCard.outerHTML = "";
    });

    toastr.error(`${e.target.parentElement.parentElement.parentElement.childNodes[0].childNodes[0].value} Deleted`)
}

function deletItem(e){
    let cardId = e.target.parentElement.parentElement.parentElement.id;
    let tasks = [];

    let item = e.target.parentElement;
    let deletedItem = document.getElementById(item.id);
    let jVar = $(`#${item.id}`);
    jVar.animate({width: '0'}, 300, () => {
        for(let i = 0; i < cards.length; i++){
            if(cards[i].id === cardId){
                for(let j = 0; j < cards[i].tasks.length; j++){
                    if(cards[i].tasks[j].text === item.value){
                        cards[i].tasks.splice(j, 1);
                    }
                }
            }
        }
        deletedItem.outerHTML = "";
    });
}

function deletCompleted(e){
    let all = document.querySelectorAll('.checkbox-class');

    //I'm sorry
    for(let i = 0; i < all.length; i++){
        if (all[i].checked === true){
            let cardId = all[i].parentElement.parentElement.parentElement.parentElement.id;
            for(let j = 0; j < cards.length; j++){
                if(cards[j].id === cardId){
                    let card = cards[j];
                    for(let k = 0; k < card.tasks.length; k++){
                        if(card.tasks[k].text === all[i].parentElement.parentElement.childNodes[1].value){
                            cards[j].tasks.splice(k, 1);
                        }
                    }
                }
            }
            let jVar = $(`#${all[i].parentElement.parentElement.id}`);
             jVar.animate({width: '0'}, "slow", () => {
                all[i].parentElement.parentElement.outerHTML = "";
            });
        }
    }
}

function deletAll(e){
    $('.card').animate({height: '0'}, 500, () => {
        row.innerHTML = "";
        cards = [];
        globalCardId = -1;
        globalInputIdNum = -1;
        addCard();
    });
    cards = [];
    localStorage.removeItem('cardArray');

    toastr.error("All Cards Deleted");

}