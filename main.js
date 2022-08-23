const express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io")(server),
    router = express.Router();
    
const tools = require('./tools'),
    models = require("./models"),
    response_models =  require("./response_models");

const port = process.env.PORT || 3000 
const DB_PATH = "dummy_db.json"

app.set("view engine", "ejs") 
app.set("views", __dirname + "/views") 
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
) 
app.use(express.static("public")) 
app.use("/", router) 
app.use(bodyParser.json()) 
var db = tools.serializeDatabase(DB_PATH)

const ID_LENGTH = 10

var open_terminal_connections=[]

io.on("connection", function (socket) {
    //Realtime Communication handler
    socket.on("login", function (params) {
        var terminal //terminal fetch from terminals list and params
        if(terminal == undefined){
            return
        }
        otc= new models.OpenTerminalConnection(socket,terminal)
        open_terminal_connections.push(otc)
        socket.emit("login_granted",JSON.stringify(terminal)) 
    })
    socket.on("disconnect", function (params) {
        open_terminal_connections = open_terminal_connections.filter(otp=>otp.socket == socket)
    })
     
}) 

router.get("/", function (req, res) {
    res.render("index") 
})
router.get('/terminal', function(req, res) {
    res.render("terminal"); 
}); 
router.post("/acquire",(req, res) => {
    var card_id = req.body.card_id 
    var terminal_id = req.body.terminal_id 
    var transaction_id = tools.makeid(ID_LENGTH) 
    tools.pushToJournal("acquire",{
        card_id: card_id,
        terminal_id: terminal_id,
        transaction_id: transaction_id
    })
    card = db["cards"].find(card => card.card_id === card_id) 
    if (card == undefined){
        res.send(JSON.stringify(response_models.Acquire.Fail("card not found")))    
    }else{
        if(card.locked){
            res.send(JSON.stringify(response_models.Acquire.Fail("card is already locked")))
        }else{
            //update database to say that the card is now locked
            card.locked = true
            tools.saveDatabase(db,DB_PATH)
            res.send(JSON.stringify(response_models.Acquire.Success(card.balance,transaction_id)))
        }
    }
}) 


/* Commits a transaction to the database, the given parameters are the terminal id, 
*  the card id to update and the amount to add (can be either positive, for loading the card, or negative for paying)
*  Returns if the transaction was successfully commited, and the reason if the failure, if any
*  Performing this command automatically releases the lock of the card 
*/
router.post("/commit",(req, res) => {
    var card_id = req.body.card_id 
    var terminal_id = req.body.terminal_id 
    var amount = req.body.amount 
    var transaction_id = req.body.transaction_id 
    tools.pushToJournal("commit",{
        card_id: card_id,
        terminal_id: terminal_id,
        amount: amount,
        transaction_id: transaction_id
    })
    amount = parseFloat(amount)
    card = db["cards"].find(card => card.card_id == card_id) 
    if (card == undefined){
        res.send(JSON.stringify(response_models.Commit.Fail("card not found"))) 
        return 
    }
    if(amount == NaN){
        res.send(JSON.stringify(response_models.Commit.Fail("incorrect amount format "))) 
        return 
    }
    /*
    if(db.transactions.map(t=>t.id).contains(transaction_id)){
        res.send(JSON.stringify(response_models.Commit.Fail("transaction already processed")))  
        return 
    }*/
    card.balance = card.balance + amount
    card.locked = false
    var transaction = new models.Transaction(transaction_id,amount,card_id)
    db.transactions.push(JSON.stringify(transaction)) 
    tools.saveDatabase(db,DB_PATH)
    res.send(JSON.stringify(response_models.Commit.Success())) 
    
}) 

server.listen(port, function () {
    console.log("Server Started!") 
}) 



