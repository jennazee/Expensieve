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


// *************** ACCOUNT STUFF ****************

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
            db.collection('expensieve-users').save({'email': req.body.email, 'pastiche': bcrypt.hashSync(req.body.pword, salt), 'fname': req.body.fname})
            db.collection('expensieve-users').find({'email': req.body.email}, {'_id': true}).toArray(function(err, docs){ console.log(docs)} )
            var id = 0
            res.redirect('/users/'+ id)
        }
        else {
            res.send('you already have an account')
        }
    })
})

// app.get('/users', function(req, res){
//     db.collection('expensieve-users').find().toArray(function(err, docs){
//         res.json(docs)
//     });
// })

app.get('/users/:id', function(req, res){
    res.send('this is my user page yayayayay')
})




//********* SHEET OPERATIONS *****************

//go to a sheet page
app.get('/sheet/:sheetid', function(){
    res.sendfile('index.html')
})

//get which sheets a person is involved with
app.get('/users/:id/sheets', function(req, res){
    db.collection.find({'_id': new ObjectID(req.params.id)}).toArray(function(err, docs){
        res.send(docs[0].sheets)
    })
})

app.post('/sheets', function(err, docs){
    var sheetid = '';
    var chars = "0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ";
    for (var i=0; i<50; i++){id=id+chars[Math.floor(Math.random() * chars.length)]};
    Collection(db, sheetid)
    res.redirect('/sheet/'+sheetid)
})

//get which people are involved in a sheet
app.get('/users/:sheetid', function(req, res){
    db.collection.find({ 'sheets': req.params.sheetid).toArray(function(err, docs){
        var people = []
        for (person in docs){
            people.append({'name': person.name, 'email': person.email})
        }
        req.send(people)
    })
})

//add a person to be involved in the sheet
app.post('/users/:id/sheets/:sheetid', function(req, res){
    db.collection.find({'_id': new ObjectID(req.params.id)}).toArray(function(err, docs){
        var sheet_list = docs[0].sheets
        db.collection.update({'_id': new ObjectID(req.params.id)}, {$set:{'sheets': sheet_list.append(req.params.sheetid)}})
    })
})




//********** UPDATING RECEIPT FIELDS ******************

//request to READ a specific receipt
app.get('/receipts/:sheetid/:id', function(req, res){
	db.collection('expensieve-'+req.params.sheetid).find({'_id': new ObjectID(req.params.id)}).toArray(function(err, docs){
		res.json(docs)
	});
});

//request to READ the entire receipts collection
app.get('/receipts/:sheetid', function(req, res){
	db.collection('expensieve-'+sheetid).find().toArray(function(err, docs){
		res.json(docs)
	});
});

//request to CREATE a new entry
app.post('/receipts/:sheetid', function(req, res){
	db.collection('expensieve-'+sheetid).save(req.body);
	res.send(req.body);
});

//request to UPDATE an existing entry
app.put('/receipts/:sheetid/:id', function(req, res){
	req.body.amount = parseFloat(req.body.amount)
	req.body._id = new ObjectID(req.body._id)
	db.collection('expensieve-'+sheetid).update({'_id': new ObjectID(req.params.id)}, req.body);
	res.send(req.body);
});

//request to DELETE an existing entry
app.delete('/receipts/:sheetid/:id', function(req, res){
	db.collection('expensieve-'+sheetid).remove({_id: new ObjectID(req.params.id)});
	res.send(req.body)
});

