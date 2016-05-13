/**
 * Created by Murad Isayev on 08.05.2016.
 */

var services = angular.module('services', []);

services.factory('backendService', function () {

        BaasBox.setEndPoint("http://faui2o2a.cs.fau.de:30485");
        BaasBox.appcode = "1234567890";
        BaasBox.login("admin", "admin") // delete this function when log-in form is done

    var backend = {};

  backend.getEvents = function () {
    return BaasBox.loadCollection("events")
  };

      backend.fetchCurrentUser = function () {
       return BaasBox.fetchCurrentUser();
      }

    backend.createAccount = function (user) {
      BaasBox.signup(user.username, user.pass)
        .done(function (res) {
          console.log("signup ", res);
          backend.login(user.username, user.pass);
          backend.updateUserProfile({"visibleByTheUser" : {"email" : user.email}});
          backend.updateUserProfile({"visibleByRegisteredUsers" : {"name" : user.name, "gName" : user.gName}});
        })
        .fail(function (error) {
          console.log("SIgnup error ", error);
        })


    }

  backend.login = function (username, pass) {
    BaasBox.login(username, pass)
      .done(function (user) {
        console.log("Logged in ", user);
      })
      .fail(function (err) {
        console.log(" Login error ", err);
      });
  }

  backend.logout = function (username, pass) {
    BaasBox.logout()
      .done(function (res) {
        console.log(res);
      })
      .fail(function (error) {
        console.log("error ", error);
      })
  }

  backend.updateUserProfile = function (params) {
    BaasBox.updateUserProfile(params)
      .done(function(res) {
        console.log("Updated ", res['data']);
      })
      .fail(function(error) {
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
        .done(function(res) {
          console.log("res ", res);
        })
        .fail(function(error) {
          console.log("error ", error);
        })
    }

  backend.getEventById = function (id) {
    return BaasBox.loadObject("events", id)
  }


  return backend;
});
