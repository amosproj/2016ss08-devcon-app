/**
 * Created by Murad Isayev on 08.05.2016.
 */

var services = angular.module('services', []);

services.factory('backendService', function () {

        BaasBox.setEndPoint("http://faui2o2a.cs.fau.de:30485"); //we will change it later to address of the chair server
        BaasBox.appcode = "1234567890";
        /*BaasBox.login("admin", "admin")
          .done(function (user) {
            console.log("Logged in ", user);
          })
          .fail(function (err) {
            console.log("error ", err);
          });*/
    var backend = {};

  backend.getEvents = function () {
    return BaasBox.loadCollection("events")
  };


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
