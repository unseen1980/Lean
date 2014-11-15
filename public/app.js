var app = angular.module('app', []);

function mainController($scope, $http) {
	$scope.formData = {};
	$scope.readonly = {};
	$scope.selectedContact = {};
	$scope.onlyIfChanged = {};


	// when landing on the page, get all contacts and show them
	$scope.getContacts = function(){
		$http.get('/api/contacts')
		.success(function(data) {
			$scope.formData = {};
			$scope.contacts = data;
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
	}

	// when submitting the add form, send the text to the node API
	$scope.createContact = function() {
		$http.post('/api/contacts', $scope.formData)
			.success(function(data) {
				$scope.formData = {}; // clear the form so our user is ready to enter another
				$scope.contacts = data;
				$scope.getContacts();
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// delete a contact after checking it
	$scope.deleteContact = function(id) {
		$http.delete('/api/contacts/' + id)
			.success(function(data) {
				$scope.contacts = data;
				$scope.getContacts();
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};
	
	//update a contact after checking it
	$scope.editContact = function(id,idx,cntName){
		$scope.onlyIfChanged.name = cntName;
		if($scope.selectedContact[idx] == false){
			$http.put('/api/contacts/' + id, $scope.onlyIfChanged)
			.success(function(data) {
				$scope.contacts = data;
				$scope.getContacts();
				$scope.onlyIfChanged = {};
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
		}

	}

}