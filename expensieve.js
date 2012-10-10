var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('test', server);

db.open(function(err, db) {
  if(!err) {
    console.log('Connected to DB')
  }
});



var http = require('http');
var fs = require('fs');
var path = require('path');
var express = require('express')

var app = express();
app.listen(1337);

app.use("/static", express.static(__dirname+'/static'));

app.get('/', function(req, res){
	res.sendfile('index.html');
});

app.get('/receipts/:id', function(req, res){
	db.collection('expensieve').find({'_id': req.params.id}).toArray(function(err, docs){
		res.json(docs)
	});
});

app.post('/receipts', function(req, res){
	db.collection('expensieve').save().toArray(function(err, docs){
		res.json(docs)
	});
});

