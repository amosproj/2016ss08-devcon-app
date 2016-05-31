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
  };
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
  };
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
        console.log("Signup error ", error);
      })
  };
  /*
   Function for logging in using login credentials
   returns a promise
   */
  backend.login = function (username, pass) {
    return BaasBox.login(username, pass)
      .done(function (user) {
        if (username != defaultUsername) {
          backend.loginStatus = true;
          $rootScope.$broadcast('user:loginState', backend.loginStatus); //trigger menu refresh
        }
        console.log("Logged in ", username);
      })
      .fail(function (err) {
        console.log(" Login error ", err);
      });
  };
  /*
   Function for logout
   returns a promise
   */
  backend.logout = function () {
    return BaasBox.logout()
      .done(function (res) {
        backend.loginStatus = false;
        $rootScope.$broadcast('user:loginState', backend.loginStatus); //trigger menu refresh
        console.log(res);
      })
      .fail(function (error) {
        console.log("error ", error);
      })
  };
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
  };
  /*
   Function for deleting an account.
   Gets the user as parameter.
   Calls the BaasBox function for deleting a user.
   Returns a promise.
   */
  backend.deleteAccount = function (user) {
    return BaasBox.deleteAccount(user)
      .done(function (res) {
        console.log(res);
      })
      .fail(function (err) {
        console.log("Delete error ", err);
      });
  };
  /*
   Function for creating a new event
   First saves a new document in "events" collection
   Then grants read permission to registered and not registered users
   */
  backend.createEvent = function (ev) {
    BaasBox.save(ev, "events")
      .done(function (res) {
        console.log("res ", res);
        BaasBox.grantUserAccessToObject("events", res.id, BaasBox.ALL_PERMISSION, "default");
        BaasBox.grantRoleAccessToObject("events", res.id, BaasBox.ALL_PERMISSION, BaasBox.REGISTERED_ROLE)
      })
      .fail(function (error) {
        console.log("error ", error);
      })
  };
  /*
   Function for getting an event by id
   returns a promise
   */
  backend.getEventById = function (id) {
    return BaasBox.loadObject("events", id)
  };
  /*
   Function for updating an event
   Requires two parameters: attribute name to update and corresponding value for this attribute
   */
  backend.updateEvent = function (eventId, fieldToUpdate, value) {
    BaasBox.updateField(eventId, "events", fieldToUpdate, value)
      .done(function (res) {
        console.log("Event updated ", res);
      })
      .fail(function (error) {
        console.log("Event update error ", error);
      })
  }
  /*
   Function for uploading a file to the backend
   Gets a form with input file and ID of the event that it belongs to
   First uploads a file, then grants access permission to all users,
   after adds id of new uploaded file to the event that it belongs to
   Returns a promise
   */
  backend.uploadFile = function (uploadForm, eventId) {
    return BaasBox.uploadFile(uploadForm)
      .done(function (res) {
        console.log("res ", res);
        res = jQuery.parseJSON(res);
        BaasBox.grantUserAccessToFile(res['data'].id, BaasBox.ALL_PERMISSION, "default");
        BaasBox.grantRoleAccessToFile(res['data'].id, BaasBox.ALL_PERMISSION, BaasBox.REGISTERED_ROLE);
        backend.updateEvent(eventId, "fileId", res['data'].id)
      })
      .fail(function (error) {
        console.log("UPLOAD error ", error);
      })
  };
  /*
   Function for getting a download url for the file
   returns a string with url
   */
  backend.getFileUrl = function (fileId) {
    return BaasBox.getFileUrl(fileId)
  }
  /*
   Function for getting details about file
   returns a promise
   */
  backend.getFileDetails = function (fileId) {
    return BaasBox.fetchFileDetails(fileId)
  }
  /*
  Function for deleting a file
   */
  backend.deleteFile = function (fileId) {
    BaasBox.deleteFile(fileId)
      .done(function(res) {
        console.log("res ", res);
      })
      .fail(function(error) {
        console.log("error ", error);
      })
  }
  return backend;
});
