const express = require('express');
const router = express.Router();
const store = require('../controllers/robStore'); 

// locations
router 
.route('/products') 
.get(store.getProducts)
.post(store.productCreate)
.put(store.productUpdate) 

router 
.route('/products/:productId') 
.get(store.getProduct) 
.put(store.productUpdate) 
.post(store.productCreate)
.delete(store.productDelete);

router 
.route('/products/history/:productId')
.get(store.getHistoryForProduct) 

router 
.route('/targets')
.get(store.getTargets)
.post(store.targetCreate)


router 
.route('/targets/:targetId')
.delete(store.targetDelete)
.post(store.targetOperationCreate)
.get(store.getTargetOperations)
// reviews
module.exports = router;