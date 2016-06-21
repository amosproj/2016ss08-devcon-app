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
services.factory('backendService', function ($rootScope, $q, $filter) {
    // credentials for actions when user is not logged in
    var defaultUsername = "default";
    var defaultPassword = "123456";
    var backend = {};
    backend.currentUser;
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
      BaasBox.signup(user.email, user.pass)
        .done(function (res) {
          console.log("signup ", res);
          backend.login(user.email, user.pass);
          backend.updateUserProfile({"visibleByTheUser": {"email": user.email, "settings": {"pushNotification": "yes"}}});
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
            backend.currentUser = user;
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
     Function for Reset
     returns a promise
     */
    backend.resetPassword = function (user) {
      BaasBox.resetPasswordForUser(user);
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
      ev.participants = [];
      ev.questions = [];
      creator = {};
      creator.name = BaasBox.getCurrentUser().username;
      creator.status = "joined";
      ev.participants.push(creator);
      console.log(creator);
      console.log(ev.participants);
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
     Function for adding an agenda talk to an event
     */

    backend.addingAgenda = function (ag, evId) {
      BaasBox.save(ag, "agenda")
        .done(function (res) {
          console.log("res ", res);
          BaasBox.updateEventAgenda(res, evId);
          BaasBox.grantUserAccessToObject("events", res.id, BaasBox.READ_PERMISSION, "default");
          BaasBox.grantRoleAccessToObject("events", res.id, BaasBox.READ_PERMISSION, BaasBox.REGISTERED_ROLE)
        })
        .fail(function (error) {
          console.log("error ", error);
        })
    };

    /*
     Function for deleting a talk.
     */
    backend.deleteAgenda = function (agendaId) {
      //return
      BaasBox.deleteObject(agendaId, "agenda")
        .done(function (res) {
          console.log(res);
        })
        .fail(function (err) {
          console.log("Delete error ", err);
        });
    };


    /*
     Function for getting an event by id
     returns a promise
     */
    backend.getEventById = function (id) {
      return BaasBox.loadObject("events", id)
    };

    /*
     Function for adding a question to an event
     */

    backend.addingQuestion = function (que, eventId) {
      backend.getEventById(eventId).then(function (res) {
        event = res['data'];
        question = {};
        question = que;
        if(event.questions.length == 0){
          questionId = 0;
        }
        else{
          questionId = event.questions[event.questions.length - 1].id + 1;
        }
        question.id = questionId;
        question.yes = 0;
        question.no = 0;
        question.dontKnow = 0;
        question.current = false;
        event.questions.push(question);
        BaasBox.updateField(eventId, "events", "questions", event.questions);
      })
    };

    /*
     Function for updating an event
     Requires two parameters: attribute name to update and corresponding value for this attribute
     Returns a promise.
     */
    backend.updateEvent = function (eventId, fieldToUpdate, value) {
      return BaasBox.updateField(eventId, "events", fieldToUpdate, value)
        .done(function (res) {
          console.log("Event updated ", res);
        })
        .fail(function (error) {
          console.log("Event update error ", error);
        })
    };
    /*
     Function for updating an agenda
     */
    backend.updateAgenda = function (agendaId, fieldToUpdate, value) {
      BaasBox.updateField(agendaId, "agenda", fieldToUpdate, value) //
        .done(function (res) {
          console.log("Agenda updated ", res);
        })
        .fail(function (error) {
          console.log("Agenda update error ", error);
        })
    };


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
     Function for uploading a file to the backend
     Gets a form with input file and ID of the agenda that it belongs to
     First uploads a file, then grants access permission to all users,
     after adds id of new uploaded file to the agenda that it belongs to
     Returns a promise
     */

    backend.uploadFileAgenda = function (uploadForm, agendaId) {
      return BaasBox.uploadFile(uploadForm)
        .done(function (res) {
          console.log("res ", res);
          res = jQuery.parseJSON(res);
          BaasBox.grantUserAccessToFile(res['data'].id, BaasBox.ALL_PERMISSION, "default");
          BaasBox.grantRoleAccessToFile(res['data'].id, BaasBox.ALL_PERMISSION, BaasBox.REGISTERED_ROLE);
          backend.updateAgenda(agendaId, "fileId", res['data'].id)
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
    };
    /*
     Function for getting details about file
     returns a promise
     */
    backend.getFileDetails = function (fileId) {
      return BaasBox.fetchFileDetails(fileId)
    };
    /*
     Function for deleting a file
     */
    backend.deleteFile = function (fileId) {
      BaasBox.deleteFile(fileId)
        .done(function (res) {
          console.log("res ", res);
        })
        .fail(function (error) {
          console.log("error ", error);
        })
    };
    /*
     Function for adding a user to an event.
     Checks if user is already participant for avoiding double entries.
     Returns a promise.
     */
    backend.addUserToEvent = function (user, eventId) {
      var deferred = $q.defer();
      backend.getEventById(eventId).then(function (res) {
        event = res['data'];
        searchResult = $filter('filter')(event.participants, {"name": user.username});
        if (searchResult.length == 0) {
          // user never registered, insert into list
          participant = {};
          participant.name = user.username;
          participant.status = "joined";
          event.participants.push(participant);
        } else {
          //user already in participants list, so just change status
          searchResult[0].status = "joined";
        }

        BaasBox.updateField(eventId, "events", "participants", event.participants).then(
          function (res) {
            deferred.resolve(res);
          }, function (err) {
            deferred.reject(err)
          }
        )
      }, function (err) {
        deferred.reject(err)
      });
      return deferred.promise;
    };
    /*
     Function for adding the current user to an event.
     Calls addUserToEvent().
     Returns a promise.
     */
    backend.addCurrentUserToEvent = function (eventId) {
      return backend.addUserToEvent(BaasBox.getCurrentUser(), eventId)
    };

    /*
     Function for getting an agenda by eventID
     returns a collection
     */
    backend.loadAgendaWithParams = function (evId) {
      return BaasBox.loadAgendaWithParams("agenda", evId, {where: "eventID=?"});
    };

    /*
     Function for adding rating to an talk.
     Calls the abstract function addFeedbackToItem.
     Returns a promise.
     */
    backend.addFeedbackToTalk = function (talkId, rating, comment) {
      feedbackEntry = {rating: rating, comment: comment};
      return addFeedbackToItem(talkId, "agenda", feedbackEntry);
    };

    /*
     Function for adding rating to an event.
     Excepts rating array of arbitrary length of the form:
     [
     { title: "CategoryName", rating: "ratingValue", comment: "comment" },
     { title: "CategoryName", rating: "ratingValue", comment: "comment" },
     (...)
     ]
     Calls the abstract function addFeedbackToItem.
     Returns a promise.
     */
    backend.addFeedbackToEvent = function (eventId, ratingArray) {
      return addFeedbackToItem(eventId, "events", ratingArray);
    };

    /*
     Abstract function for adding feedback to an item.
     Returns a promise.
     */
    addFeedbackToItem = function (itemId, collection, feedBackEntry) {
      var deferred = $q.defer();
      BaasBox.loadObject(collection, itemId).then(
        function (res) {
          item = res['data'];
          if (item.hasOwnProperty("feedback")) {
            item.feedback.push(feedBackEntry);
          } else {
            item.feedback = [feedBackEntry];
          }
          BaasBox.updateField(itemId, collection, "feedback", item.feedback).then(
            function (res) {
              deferred.resolve(res);
            }, function (err) {
              deferred.reject(err)
            }
          )
        }, function (err) {
          deferred.reject(err)
        });
      return deferred.promise;
    };

    /*
     Fucntion for removing a user from an event.
     Returns a promise.
     */
    backend.removeUserFromEvent = function (user, eventId) {
      var deferred = $q.defer();
      backend.getEventById(eventId).then(function (res) {
        event = res['data'];
        searchResult = $filter('filter')(event.participants, {"name": user.username});
        searchResult[0].status = "left";
        BaasBox.updateField(eventId, "events", "participants", event.participants).then(
          function (res) {
            deferred.resolve(res);
          }, function (err) {
            deferred.reject(err)
          }
        )
      }, function (err) {
        deferred.reject(err)
      });
      return deferred.promise;
    };
    /*
     Function for removing the current user from an event.
     Returns a promise.
     */
    backend.removeCurrentUserFromEvent = function (eventId) {
      return backend.removeUserFromEvent(BaasBox.getCurrentUser(), eventId)
    };
    /*
     Function for checking if a user is participant of an event.
     Returns a promise.
     */
    backend.isUserRegisteredForEvent = function (user, eventId) {
      var deferred = $q.defer();
      backend.getEventById(eventId).then(function (res) {
        event = res['data'];
        searchResult = $filter('filter')(event.participants, {"name": user.username});
        console.log(searchResult);
        if (searchResult.length == 0) {
          //user not in participants list, so he's not registred
          deferred.resolve(false);
        } else {
          //user is in participants list, but is he still registred?
          deferred.resolve(searchResult[0].status == "joined")
        }
      }), function (err) {
        deferred.reject(err)
      };
      return deferred.promise
    };
    /*
     Function for checking if the current user is user is participant of an event.
     Returns a promise.
     */
    backend.isCurrentUserRegisteredForEvent = function (eventId) {
      return backend.isUserRegisteredForEvent(BaasBox.getCurrentUser(), eventId)
    };

    /*
     Function for getting a user by his username
     returns a promise
     */
    backend.getUser = function (user) {
      return BaasBox.fetchUserProfile(user)
        .done(function (res) {
          console.log("res ", res['data']);
        })
        .fail(function (error) {
          console.log("error ", error);
        })
    };

    /*
     Function for getting a speaker talk by agendId
     returns a promise
     */
    backend.getAgendaById = function (id) {
      return BaasBox.loadObject("agenda", id)
    };

    /*
     Function for enabling push notifications for the current user.
     Returns a promise.
     */
    backend.enablePushNotificationsForCurrentUser = function () {
      operatingSystem = "android";
      return BaasBox.enableNotifications(operatingSystem, localStorage.getItem('registrationId'));
    };

    /*
     Function for disabling push notifications for the current user.
     Returns a promise.
     */
    backend.disablePushNotificationsForCurrentUser = function () {
      return BaasBox.disableNotifications(localStorage.getItem('registrationId'));
    };

    /*
     Function for applying the given settings to the user
     */
    backend.applySettings = function (settings) {
      if(settings.pushNotificationEnabled){
        backend.enablePushNotificationsForCurrentUser();
      } else {
        backend.disablePushNotificationsForCurrentUser();
      }
    }

      return backend;
    }
);
