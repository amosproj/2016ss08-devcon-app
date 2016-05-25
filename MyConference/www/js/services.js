/*
 This file is part of MyConference.

 MyConference is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License version 3
 as published by the Free Software Foundation.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should find a copy of the GNU Affero General Public License in the
 root directory along with this program.
 If not, see http://www.gnu.org/licenses/agpl-3.0.html.
 */

var services = angular.module('services', []);
services.factory('backendService', function ($rootScope) {
  // credentials for actions when user is not logged in
  var defaultUsername = "default";
  var defaultPassword = "123456";

  var backend = {};
  backend.loginStatus = false;

  /*
   Function for establishing connection to the backend
   After getting a connection logs in as a default user
   "default" means "not registered" user
   returns a promise
   */
  backend.connect = function () {
    BaasBox.setEndPoint("http://faui2o2a.cs.fau.de:30485");
    BaasBox.appcode = "1234567890";
    return backend.login(defaultUsername, defaultPassword);
  }
  /*
   Function for getting list of events from backend
   Loads a collection where events are stored
   returns a promise
   */
  backend.getEvents = function () {
    return BaasBox.loadCollection("events")
      .done(function (res) {
        console.log("res ", res);
      })
      .fail(function (error) {
        console.log("error ", error);
      })
  };
  /*
   Function for fetching a current logged user
   returns a promise
   */
  backend.fetchCurrentUser = function () {
    return BaasBox.fetchCurrentUser();
  }
  /*
   Function for creating new user account
   First signs up using username and password credentials,
   then logs in as a new user and updates "visibleByTheUser" field adding email information
   and "visibleByRegisteredUsers" field saving name and given name
   */
  backend.createAccount = function (user) {
    BaasBox.signup(user.username, user.pass)
      .done(function (res) {
        console.log("signup ", res);
        backend.login(user.username, user.pass);
        backend.updateUserProfile({"visibleByTheUser": {"email": user.email}});
        backend.updateUserProfile({"visibleByRegisteredUsers": {"name": user.name, "gName": user.gName}});
      })
      .fail(function (error) {
        console.log("SIgnup error ", error);
      })
  }
  /*
   Function for logging in using login credentials
   returns a promise
   */
  backend.login = function (username, pass) {
    return BaasBox.login(username, pass)
      .done(function (user) {
        if(username != defaultUsername){
          backend.loginStatus = true;
          $rootScope.$broadcast('user:loginState',backend.loginStatus); //trigger menu refresh
        }
        console.log("Logged in ", username);
      })
      .fail(function (err) {
        console.log(" Login error ", err);
      });
  }
  /*
   Function for logout
   returns a promise
   */
  backend.logout = function (username, pass) {
    return BaasBox.logout()
      .done(function (res) {
        backend.loginStatus = false;
        $rootScope.$broadcast('user:loginState',backend.loginStatus); //trigger menu refresh
        console.log(res);
      })
      .fail(function (error) {
        console.log("error ", error);
      })
  }
  /*
   Function for updating user account
   requires 2 parameters: field to update and object with data that should be updated. See Baasbox API documentation
   returns a promise
   */
  backend.updateUserProfile = function (params) {
    return BaasBox.updateUserProfile(params)
      .done(function (res) {
        console.log("Updated ", res['data']);
      })
      .fail(function (error) {
        console.log("Update error ", error);
      })
  }

  backend.deleteAccount = function (user) { //function to delete account
    return BaasBox.deleteAccount(user)
      .done(function (res) {
        console.log(res);
      })
      .fail(function (err) {
        console.log("Delete error ", err);
      });

  }

  /*
   Function for creating a new event
   First saves a new document in "events" collection
   Then grants read permission to registered and not registered users
   */
  backend.createEvent = function (ev) {
    BaasBox.save(ev, "events")
      .done(function (res) {
        console.log("res ", res);
        BaasBox.grantUserAccessToObject("events", res.id, BaasBox.READ_PERMISSION, "default")
        BaasBox.grantRoleAccessToObject("events", res.id, BaasBox.READ_PERMISSION, BaasBox.REGISTERED_ROLE)
      })
      .fail(function (error) {
        console.log("error ", error);
      })
  }
  /*
   Function for getting an event by id
   returns a promise
   */
  backend.getEventById = function (id) {
    return BaasBox.loadObject("events", id)
  }
  return backend;
});
