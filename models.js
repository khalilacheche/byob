module.exports = {
    Database: class{
        terminals;
        cards;
        transactions;
        constructor (terminals,cards,transactions){
            this.terminals = terminals;
            this.cards = cards;
            this.transactions = transactions;
        }
    },
    Terminal: class {
        name;
        id;
        price_per_liter;
        remaining_volume;
        image_url;
    },
    
    Card: class {
        id;
        balance;
    
    },
    Transaction: class {
        id;
        amount;
        card_id;
        constructor(id,amount,card_id){
            this.id = id;
            this.amount = amount;
            this.card_id =card_id;
        }
    },
    OpenTerminalConnection : class{
        socket;
        terminal;
        constructor(socket,terminal){
            this.socket = socket;
            this.terminal = terminal;
        }
    }
}
