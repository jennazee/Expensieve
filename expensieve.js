var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db,
  ObjectID = mongo.ObjectID;

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
app.use(express.bodyParser());

//request to the home page
app.get('/', function(req, res){
	res.sendfile('index.html');
});

//request to READ a specific receipt
app.get('/receipts/:id', function(req, res){
	db.collection('expensieve').find({'_id': new ObjectID(req.params.id)}).toArray(function(err, docs){
		res.json(docs)
	});
});

//request to READ the entire receipts collection
app.get('/receipts', function(req, res){
	db.collection('expensieve').find().toArray(function(err, docs){
		res.json(docs)
	});
});

//request to CREATE a new entry
app.post('/receipts', function(req, res){
	db.collection('expensieve').save(req.body);
	res.send(req.body);
});

//request to UPDATE an existing entry
app.put('/receipts/:id', function(req, res){
	req.body.amount = parseFloat(req.body.amount)
	req.body._id = new ObjectID(req.body._id)
	db.collection('expensieve').update({'_id': new ObjectID(req.params.id)}, req.body);
	res.send(req.body);
});

//request to DELETE an existing entry
app.delete('/receipts/:id', function(req, res){
	db.collection('expensieve').remove({_id: new ObjectID(req.params.id)});
	res.send(req.body)
});

