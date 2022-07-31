const express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io")(server),
    router = express.Router();

const port = process.env.PORT || 3000;
const DB_PATH = "dummy_db.json"

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));
app.use("/", router);
app.use(bodyParser.json());
const fs = require("fs");
var journal = []
var db = JSON.parse(fs.readFileSync(DB_PATH)) 


io.on("connection", function (socket) {
    //Realtime Communication handler
    socket.on("get_history", function (params) {
        socket.emit("checking");
    });
});

router.get("/", function (req, res) {
    res.render("index");
});
router.post("/acquire",(req, res) => {
    var card_id = req.body.card_id;
    var terminal_id = req.body.terminal_id;
    pushToJournal("acquire",{
        card_id: card_id,
        terminal_id: terminal_id
    })
    card = db["cards"].find(card => card.card_id === card_id);
    if (card == undefined){
        res.send({
            lock_acquired: false
        });
    }else{
        if(card.locked){
            res.send({
                lock_acquired: false
            });    
        }else{
            //update database to say that the card is now locked
            card.locked = true
            saveDatabase()
            res.send({
                lock_acquired: true,
                balance: card.balance
            });
        }
    }
});


/* Commits a transaction to the database, the given parameters are the terminal id, 
*  the card id to update and the amount to add (can be either positive, for loading the card, or negative for paying)
*  Returns if the transaction was successfully commited, and the reason if the failure, if any
*  Performing this command automatically releases the lock of the card 
*/
router.post("/commit",(req, res) => {
    var card_id = req.body.card_id;
    var terminal_id = req.body.terminal_id;
    var amount = req.body.amount;
    pushToJournal("commit",{
        card_id: card_id,
        terminal_id: terminal_id,
        amount: amount
    })
    amount = parseFloat(amount)
    card = db["cards"].find(card => card.card_id == card_id);
    if (card == undefined){
        res.send({
            done: false,
            reason: "card not found"
        });
        return;
    }
    if(amount == NaN){
        res.send({
            done: false,
            reason: "incorrect amount format "
        });
        return;
    }
    card.balance = card.balance + amount
    card.locked = false
    db.transactions.push({
        card_id: card_id,
        amount: amount
    })
    saveDatabase()
    res.send({
        done: true,
        reason: undefined
    })
    
});

server.listen(port, function () {
    console.log("Server Started!");
});


function saveDatabase(){
    let data = JSON.stringify(db);
    fs.writeFileSync(DB_PATH, data);
}
function pushToJournal(command , values ){
    obj = {
        command: command,
        timestamp : Date.now(),
        values: values
    }
    console.log(obj)
    journal.push(obj)
}