

const express = require('express');
const reportController  = require('../controller/reportController');
 
const route = express.Router();
route.use(express.json());
route.use(express.urlencoded({extended:true}));
route.post('/addreport',reportController.addReport);
route.post('/getallreport',reportController.getAllReport);
route.post('/detailreport',reportController.detailReport);
route.post('/violatereport',reportController.violateReport);
route.post('/noviolatereport',reportController.noviolateReport);
module.exports = route;