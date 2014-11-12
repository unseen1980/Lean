var express    = require('express'); 		
var app        = express(); 				
var bodyParser = require('body-parser');
var lokijs = require('lokijs');
var fs = require('fs');
var DB_FILE = 'data.json';
var db = new lokijs(DB_FILE);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; 		

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				

// middleware to use for all requests
router.use(function(req, res, next) {
	console.log('Middleware called.');
	next(); // make sure we go to the next routes and don't stop here
});

router.get('/', function(req, res) {
	res.json({ message: 'Welcome to contacts api!' });	
});


router.route('/contacts')
	// create a new contact (accessed at POST http://localhost:8080/api/contacts)
	.post(function(req, res) {
		var cntName = req.body.name;  // set the contacts name (comes from the request)		

		fs.exists(DB_FILE, function (exists) {
          if (exists) {
          		db.loadDatabase(function () {
          			var contacts = db.getCollection('contacts');
          			contacts.insert({name:cntName});
					db.saveToDisk();
				});
				res.json(cntName + ' added');
          }
          else{
          		var db2 = new lokijs(DB_FILE);
 				var contacts = db2.addCollection('contacts')
          		contacts.insert({name:cntName});
          		db2.saveToDisk();          	          	
			res.json(cntName + ' added!');
          }
      });		
	})
	// get all the contacts (accessed at GET http://localhost:8080/api/contacts)
	.get(function(req, res) {
		fs.exists(DB_FILE, function (exists) {
          if (exists) {
          	db.loadDatabase(function () {
          		var c = db.getCollection('contacts')
				res.json(c.data);
          	});          	
          }
          else{          	          	
			res.json('No contacts');
          }
      });		
	});

router.route('/contacts/:contact_id')
	// get the contact with that id (accessed at GET http://localhost:8080/api/contacts/:contact_id)
	.get(function(req, res) {		
		fs.exists(DB_FILE, function (exists) {
          if (exists && typeof req.params.contact_id !='undefined') {
          	db.loadDatabase(function () {
          		var c = db.getCollection('contacts')
	          	if(c.get(parseInt(req.params.contact_id)) == null){
					res.json('No contact found');
				}
				else{
					res.json(c.get(parseInt(req.params.contact_id)));
				}
          	});  
          }
          else{
          	res.json('No Db yet');
          }
      });
	})
	// update the contact with this id (accessed at PUT http://localhost:8080/api/contacts/:contact_id)
	.put(function(req, res) {
		fs.exists(DB_FILE, function (exists) {
          if (exists && typeof req.params.contact_id !='undefined') {
          	db.loadDatabase(function () {
          		var c = db.getCollection('contacts')
	          	if(c.get(parseInt(req.params.contact_id)) == null){
					res.json('No contact found');
				}
				else{
					var cntUpd = c.get(parseInt(req.params.contact_id));
					cntUpd.name = req.body.name;
					db.saveToDisk();  
					res.json('Contact updated');
				}
          	});  
          }
          else{
          	res.json('No Db yet');
          }
      })
	})
	// delete the contact with this id (accessed at DELETE http://localhost:8080/api/contacts/:contact_id)
	.delete(function(req, res) {
		fs.exists(DB_FILE, function (exists) {
          if (exists && typeof req.params.contact_id !='undefined') {
          	db.loadDatabase(function () {
          		var c = db.getCollection('contacts')
	          	if(c.get(parseInt(req.params.contact_id)) == null){
					res.json('No contact found');
				}
				else{
					var cntDel = c.get(parseInt(req.params.contact_id));
					c.remove(cntDel)
					db.saveToDisk();  
					res.json('Contact deleted');
				}
          	});  
          }
          else{
          	res.json('No Db yet');
          }
      });
	});	

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server runs on port ' + port);