angular.module('starter.services', [])

  .factory("AgendaService", function ($filter, $q) {
    var talks;
    // var talks = [
    //   {title: 'The Ionic Framework', nr: 1},
    //   {title: 'SPA with AngularJS', nr: 2},
    //   {title: 'Unit tests for Cordova', nr: 3},
    //   {title: 'BaasBox - a good backend?', nr: 4},
    //   {title: 'Good bye relational: Hello NoSQL', nr: 5}
    // ];

    return {
      getAllTalks: function () {
        return talks;
      },

      getTalkByNr: function (talkNr) {
        return $filter('filter')(talks, {nr: talkNr})[0];
      },

      loginAsAdmin: function () {
        var login = $q.defer();
        BaasBox.setEndPoint("http://192.168.178.23:9000");
        BaasBox.appcode = "1234567890";
        BaasBox.login("admin", "admin")
          .done(function (user) {
            login.resolve(user);
          })
          .fail(function (err) {
            login.reject(err);
          })
        return login.promise;
      },

      getAllTalksFromServer: function() {
        var getIt = $q.defer();
        BaasBox.loadCollection("testCollection")
          .done(function(res) {
            talks = res;
            getIt.resolve(res);
          })
          .fail(function(error) {
            getIt.reject(error);
          })
        return getIt.promise;
      }
    };
  });
