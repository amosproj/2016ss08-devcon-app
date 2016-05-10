/**
 * Created by Murad Isayev on 08.05.2016.
 */

var services = angular.module('services', []);

services.factory('backendService', function () {

        BaasBox.setEndPoint("http://10.21.19.118:9000");
        BaasBox.appcode = "1234567890";
        BaasBox.signup("admin", "admin")
          .done(function (res) {
            console.log("signup ", res);
          })
          .fail(function (error) {
            console.log("error ", error);
          });
        BaasBox.login("admin", "admin")
          .done(function (user) {
            console.log("Logged in ", user);
          })
          .fail(function (err) {
            console.log("error ", err);
          });
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


  return backend;
});
