var express = require('express'); 		
var app = express(); 				
var bodyParser = require('body-parser');
var lokijs = require('lokijs');
var fs = require('fs');
var DB_FILE = 'data.json';
var db = new lokijs(DB_FILE);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 8080; 

fs.exists(DB_FILE, function (exists) {
	if (exists) {
		console.log('data.json exists');
		return exists
	}
	else{
		var db2 = new lokijs(DB_FILE);
		var contacts = db2.addCollection('contacts')
		contacts.insert({name:'demo'});
		db2.saveToDisk();          	          	
		console.log('Initial contact added!');
	}
});

var checkForContact = function(id){
	var c = db.getCollection('contacts')
	if(c.get(parseInt(id)) == null){
		return false;
	}
	else {
		return true
	}
}

var noFound = 'No contact found';

app.post('/api/contacts',function(req, res) {
		var cntName = req.body.name;  // set the contacts name (comes from the request)		
		db.loadDatabase(function () {
			var contacts = db.getCollection('contacts');
			contacts.insert({name:cntName});
			db.saveToDisk();
		});
		res.json(cntName + ' added');
	});

app.get('/api/contacts',function(req, res) {          
		db.loadDatabase(function () {
			var c = db.getCollection('contacts')
			if (typeof c.data != 'undefined') {
				res.json(c.data);
			}
			else{
				res.json('No contacts');
			}
		});
	});

app.get('/api/contacts/:contact_id',function(req, res) {		
		db.loadDatabase(function () {
			if(!checkForContact(parseInt(req.params.contact_id))){
				res.json(noFound);								
			}
			else{
				var c = db.getCollection('contacts')
				res.json(c.get(parseInt(req.params.contact_id)))
			}
		}); 
	});

app.put('/api/contacts/:contact_id',function(req, res) {
		db.loadDatabase(function () {
			if(!checkForContact(parseInt(req.params.contact_id))){
				res.json(noFound);								
			}
			else{
				var c = db.getCollection('contacts')
				var cntUpd = c.get(parseInt(req.params.contact_id));
				cntUpd.name = req.body.name;
				db.saveToDisk();  
				res.json('Contact updated');
			}
		});        
	});

app.delete('/api/contacts/:contact_id',function(req, res) {
		db.loadDatabase(function () {			
			if(!checkForContact(parseInt(req.params.contact_id))){
				res.json(noFound);								
			}
			else{
				var c = db.getCollection('contacts')
				var cntDel = c.get(parseInt(req.params.contact_id));
				c.remove(cntDel)
				db.saveToDisk();  
				res.json('Contact deleted');
			}
		});            
	});	

// REGISTER OUR ROUTES -------------------------------
app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server runs on port ' + port);