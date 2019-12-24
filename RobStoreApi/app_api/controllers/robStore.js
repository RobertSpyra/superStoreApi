
const mongoose = require('mongoose');

const STORE = mongoose.model('product');
const HISTORY = mongoose.model('historyProduct');
const TARGET  = mongoose.model('target');
const TARGET_OPER  = mongoose.model('targetOperation');
const productCreate = (req, res) => {
    
    console.debug("Create product "+ req.body.name + " " + req.body.status);
    STORE.create({name : req.body.name,
        balance : req.body.balance,
        status : req.body.status},(err,product)=>{
        if(err){
            if(JSON.stringify(err).includes("`name` to be unique")){
                return res.status(400).json({name:'Name Unique'}); 
            }
            return res.status(400).json(err);
        }
        createHistory("CR",product,0);
        res.status(201).json(product);
    });
};

const targetCreate = (req, res) => {
    
    console.debug("Create target "+ req.body.name);
    TARGET.create({name : req.body.name
        },(err,product)=>{
        if(err){
            console.log(err);
            return res.status(400).json({name:'Name Unique'});
        }
        res.status(201).json(product);
    });
};


const targetOperationCreate = (req, res) => {
    
    console.debug("Create target operation "+ req.body.name);
    TARGET_OPER.create({name : req.body.name,
        product:req.body.productName,
        balance:req.body.balance ? req.body.balance:0
        },(err,product)=>{
        if(err){
            return res.status(400).json(err);
        }
        res.status(201).json(product);
    });
};


async function createHistory(action,product,balanceOperation,targetValue){
   
   console.debug("Start creating history..." + action);
    var historyObject = {productName : product.name,
                         operation : action,
                         balanceOper : balanceOperation,
                         balance : product.balance,
                        target : targetValue}
    HISTORY.create(historyObject,(err,product)=>{
        if(err){
            throw err;
        }
        console.debug("History created..." + product.balanceOper + " for product " + product.productName);    
});

   console.debug("End history creating..." + action);
   return historyObject;

}


const productDelete = (req, res) => {
    debugger;
    const {productId} = req.params;
    console.debug("Removing " + productId);
    let promise = STORE.findOneAndDelete({name : productId});
    promise.exec((err,product) =>{
        if(err){
            return res.status(404).json("Not Found product " + product);
        }
        if(!product){
            console.debug("Not Removed " + productId); 
            return res.status(404).json("Not Found product " + productId)
        }
        console.debug("Removed " + product);
        createHistory("D",product,0);
        res.status(200).json(product);
    });
};


const targetDelete = (req, res) => {
    
    const {targetId} = req.params;
    console.debug("Removing target " + targetId);
    let promise = TARGET.findOneAndDelete({name : targetId});
    promise.exec((err,product) =>{
        if(err){
            return res.status(404).json("Not Found target " + product);
        }
        if(!product){
            console.debug("Not Removed target " + targetId); 
            return res.status(404).json("Not Found target " + targetId)
        }
        console.debug("Removed target " + product);
        res.status(200).json(product);
    });
};

const productUpdate = async (req, res) => {
    
    const oper = req.body.operation;
    console.debug("Got update request " + req.body.operation);
    const productName = req.body.name;
    const volumne = parseInt(req.body.balance);
    const target = req.body.target;
    console.debug("Got update request for " + productName);
    let returnValue;
        switch(oper){
            case 'A':
                console.debug("Increasing volumne ");
                returnValue = await increaseVolumne(volumne,productName,target);
                console.log("Result " + returnValue);
                break;
            case 'R':
                console.debug("Decreasing volumne ");
                returnValue = await increaseVolumne(-1*volumne,productName,target);
                console.log("Result " + returnValue);
                break;
            case 'N':
                break;
        }

        res
        .status(200)
        .json(returnValue);   
};

async function increaseVolumne(volumne,product,target){
    console.debug("Start updating...");
    const session = await mongoose.startSession();
    session.startTransaction();
    let result;
    try{
        result = await STORE.findOneAndUpdate({name : product},{$inc:{balance : volumne}},{new: true});
        createHistory(volumne < 0 ? "M":"A",result,volumne,target);
        console.debug("After Balance " + result.balance);
    }catch(error){
        console.error(error);
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
   await session.commitTransaction();
   session.endSession();
   console.debug("End updating...");
   return result;
}

const getProduct = (req, res) => {

    console.debug("Start getting product ");

    console.debug(req.params.productId);
    let prom = STORE.find({'name' : req.params.productId});
    prom.exec((err,product) => {
        if(err){
            return res.status(404).json(err);
        }
        if(product.length > 0){
            console.debug("Found product " + product[0].name);
        }
    res
        .status(200)
        .json(product);
    });
};


const  getHistoryForProduct = (req, res) => {

    console.debug("Start getting history");
    console.debug(req.params.productId);
    let prom = HISTORY.find({'productName' : req.params.productId}).lean();
    prom.exec((err,product) => {
        if(err){
            return res.status(404).json(err);
        }
        if(product.length > 0){
            console.debug("Found product " + product[0].productName);
        }else{
            console.debug("Product not found product " + req.params.productId); 
        }
    res
        .status(200)
        .json(product);
    });
};


const  getTargetOperations = (req, res) => {

    console.debug("Start getting target operation");
    console.debug(req.params.targetId);
    let prom = TARGET_OPER.find({'name' : req.params.targetId}).lean();
    prom.exec((err,product) => {
        if(err){
            return res.status(404).json(err);
        }
        if(product.length > 0){
            console.debug("Found target " + product[0].name);
        }else{
            console.debug("Targets not found " + req.params.targetId); 
        }
    res
        .status(200)
        .json(product);
    });
};


const getProducts = async (req, res) => {
    console.debug("Get Products invoked ");
    try{
        let products = await STORE.find({}).lean();
        console.debug("Get Products found " + products.length);
        // for(var product of products){
        //    var historObjects = await getProductHistory(product);
        //    console.debug("History objects found length " + historObjects.length + " " +
        //    product.name);
        //    if(historObjects.length > 0){
        //        product.history = {...historObjects};
        //        console.log(product);
        //    }
           
        // }
        res.status(200)
            .json(products);
    }catch(error){
        return res.status(404).json(err);
    }
};


const getTargets = async (req, res) => {
    console.debug("Get Targets invoked ");
    try{
        let targets = await TARGET.find({}).lean();
        console.debug("Get Targets found " + targets.length);
        res.status(200)
            .json(targets);
    }catch(error){
        return res.status(404).json(err);
    }
};

async function getProductHistory(product){
    console.debug("Get History started for " +product.name);
    let productName = product.name;
    try{
        let results = await HISTORY.find({'productName' : productName});
        console.debug("Found history " + results.length);
        return results;
    }catch(error){
        console.debug(error);
        throw error;
    }
}

module.exports = {
    productDelete,
    productCreate,
    productUpdate,
    getProduct,
    getProducts,
    getHistoryForProduct,
    targetCreate,
    getTargets,
    targetOperationCreate,
    targetDelete,
    getTargetOperations
};