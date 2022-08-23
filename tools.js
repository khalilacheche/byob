models = require("./models")
const fs = require("fs");
module.exports = {
    makeid: function (length) {
        var result           = '' 
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' 
        var charactersLength = characters.length 
        for ( var i = 0;  i < length;  i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
            charactersLength)) 
       }
       return result 
    },
    saveDatabase : function (db,db_path){
        let data = JSON.stringify(db) 
        fs.writeFileSync(db_path, data) 
    },
    pushToJournal: function (command , values ){
        obj = {
            command: command,
            timestamp : Date.now(),
            values: values
        }
        console.log(obj)
        //journal.push(obj)
    },
    serializeDatabase: function(db_path){
        return JSON.parse(fs.readFileSync(db_path))
    }
}
