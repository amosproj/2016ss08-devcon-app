angular.module('starter.controllers', ['services'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('MainCtrl', function($scope, $state, $location, backendService) {
  backendService.getEvents().then(function (res) {
    $scope.events = res;
  }, function (reason) {
    console.log("Error detected because of "+reason);
  })
})


.controller('CreateEventCtrl', function($scope, $location, $ionicPopup, backendService) {
  $scope.createEvent = function (ev) {
    backendService.createEvent(ev);
    var alertPopup = $ionicPopup.alert({
      title: 'Done!',
      template: 'Event "'+ev.title+'" created.'
    });
    alertPopup.then(function (res) {
      $location.path('#app/main');
    })
  }
})

  .controller('EventCtrl', function($scope, $location, backendService) {
    $scope.location = $location;
    $scope.$watch('location.search()', function() {
      var id = ($location.search()).id;
      backendService.getEventById(id).then(function (res) {
        $scope.event = res.data;
      }, function (reason) {
        console.log("Error detected because of "+reason);
      })
    }, true);

  })

.controller('RegisterCtrl', function($scope, $location, $ionicPopup, backendService) {
  backendService.fetchCurrentUser().then(function (res) {
    var alertPopup = $ionicPopup.alert({
      title: 'Done!',
      template: 'You are already logged in'
    });
    alertPopup.then(function (res) {
      $location.path('#app/main');
    })
    });
  $scope.createAccount = function (user) {
    backendService.createAccount(user)
    var alertPopup = $ionicPopup.alert({
      title: 'Done!',
      template: 'Welcome, '+user.name
    });
  }
});

