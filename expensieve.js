var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db,
  ObjectID = mongo.ObjectID;

var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

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
	res.sendfile('login.html');
});

//login
app.post('/', function(req, res){
    var passcramble;
    db.collection('expensieve-users').find({'email': req.body.email}, {'pastiche': true}).toArray(function(err, docs){
        console.log(docs)
        passcramble = docs[0].pastiche
        console.log('passcramble', passcramble)
        if (bcrypt.compareSync(req.body.pword, passcramble)){
            db.collection('expensieve-users').find({'email': req.body.email}, {'_id': true}).toArray(function(err, docs){
                res.redirect('/users/'+ docs[0]._id)
            })
        }   
        else {
            res.sendfile('login.html')
        }
    });
});

//new user
app.post('/newbie', function(req,res){
    db.collection('expensieve-users').find({'email': req.body.email}).toArray(function(err, docs){
        if (docs.length === 0){
            db.collection('expensieve-users').save({'email': req.body.email, 'pastiche': bcrypt.hashSync(req.body.pword, salt)})
            db.collection('expensieve-users').find({'email': req.body.email}, {'_id': true}).toArray(function(err, docs){ console.log(docs)} )
            var id = 0
            res.redirect('/users/'+ id)
        }
        else {
            res.send('you already have an account')
        }
    })
})

app.get('/users', function(req, res){
    db.collection('expensieve-users').find().toArray(function(err, docs){
        res.json(docs)
    });
})

app.get('/users/:id', function(req, res){
    res.send('this is my user page yayayayay')
})

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

