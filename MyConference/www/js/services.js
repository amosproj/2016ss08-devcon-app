/**
 * Created by Murad Isayev on 08.05.2016.
 */

var services = angular.module('services', []);
services.factory('backendService', function () {
  var backend = {};
  backend.connect = function () { //this function connects the app to the backend, returns a promise
    BaasBox.setEndPoint("http://faui2o2a.cs.fau.de:30485");
    BaasBox.appcode = "1234567890";
    return backend.login("default", "123456") //default means "not registered" user
  }
  backend.getEvents = function () { //this function gets all events stored in the database, returns a promise
    return BaasBox.loadCollection("events")
      .done(function (res) {
        console.log("res ", res);
      })
      .fail(function (error) {
        console.log("error ", error);
      })
  };
  backend.fetchCurrentUser = function () { //function for getting current logged user, returns a promise
    return BaasBox.fetchCurrentUser();
  }
  backend.createAccount = function (user) { // function for creatig an user account
    BaasBox.signup(user.username, user.pass)
      .done(function (res) {
        console.log("signup ", res);
        backend.login(user.username, user.pass);
        backend.updateUserProfile({"visibleByTheUser": {"email": user.email}}); // adding email for new created user
        backend.updateUserProfile({"visibleByRegisteredUsers": {"name": user.name, "gName": user.gName}}); // adding Name and Given Name
      })
      .fail(function (error) {
        console.log("SIgnup error ", error);
      })
  }
  backend.login = function (username, pass) { //function to login to the system, returns a promise
    return BaasBox.login(username, pass)
      .done(function (user) {
        console.log("Logged in ", user);
      })
      .fail(function (err) {
        console.log(" Login error ", err);
      });
  }
  backend.logout = function (username, pass) {//logout function, returns a promise
    return BaasBox.logout()
      .done(function (res) {
        console.log(res);
      })
      .fail(function (error) {
        console.log("error ", error);
      })
  }
  // function to update user information,
  // requires 2 parameters: field to update and object with data that should be updated. See Baasbox API documentation
  backend.updateUserProfile = function (params) {
    return BaasBox.updateUserProfile(params)
      .done(function (res) {
        console.log("Updated ", res['data']);
      })
      .fail(function (error) {
        console.log("Update error ", error);
      })
  }
   
  backend.createEvent = function (ev) {
    var newEvent = new Object();
    newEvent.title = ev.title;
    newEvent.location = ev.location;
    newEvent.date = ev.date;
    newEvent.descr = ev.descr;
    BaasBox.save(newEvent, "events")
      .done(function (res) {
        console.log("res ", res);
        BaasBox.grantUserAccessToObject("events", res.id, BaasBox.READ_PERMISSION, "default") // grant permission to see this event by not registered users
        BaasBox.grantRoleAccessToObject("events", res.id, BaasBox.READ_PERMISSION, BaasBox.REGISTERED_ROLE) // grant permission to see this event by registered users
      })
      .fail(function (error) {
        console.log("error ", error);
      })
  }
  backend.getEventById = function (id) { // function for getting a event by its id, returns a promise
    return BaasBox.loadObject("events", id)
  }
  return backend;
});
