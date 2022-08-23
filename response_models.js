module.exports = {
    Commit: class {
        done;
        reason;
        constructor(done, reason) {
            this.done = done;
            this.reason = reason;
        }
        static Success(){
            return new this(true,undefined)
        }
        static Fail(reason){
            return new this(false,reason)
        }
    },
    Acquire: class{
        lock_acquired;
        reason;
        balance;
        transaction_id;
        constructor (lock_acquired,reason,balance,transaction_id){
            this.lock_acquired = lock_acquired;
            this.reason = reason;
            this.balance = balance;
            this.transaction_id = transaction_id;
        }
        static Success(balance, transaction_id){
            return new this(true,undefined,balance,transaction_id)
        }
        
        static Fail(reason){
            return new this(false,reason,undefined,undefined)
        }
    }
}