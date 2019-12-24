const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const historySchema = new mongoose.Schema({
    author: String, 
    productName: String,
    operation:String,
    balanceOper:Number,
    balance:Number,
    reviewText: String,
    target : String,
    createdOn: { type: Date, default: Date.now }
});
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique : true,
        dropDups: true
    },
    balance : Number,
    status : {
        type :String,
        required:true
    }
});
const targetSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique : true,
        dropDups: true
    },
    author: String, 
    reviewText: String,
    createdOn: { type: Date, default: Date.now }
});

const targetOperationSchema = new mongoose.Schema({
    name:String,
    product:String,
    balance:Number,
    author: String, 
    reviewText: String,
    createdOn: { type: Date, default: Date.now }
});

productSchema.plugin(uniqueValidator);
mongoose.model('product', productSchema);
mongoose.model('historyProduct',historySchema);
mongoose.model('target',targetSchema);
mongoose.model('targetOperation',targetOperationSchema);
