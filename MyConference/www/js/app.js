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

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives', 'pascalprecht.translate', 'ngCordova', 'ionic-ratings'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: 'locales/',
      suffix: '.json'
    });
    $translateProvider.determinePreferredLanguage(function () {
      return 'de';
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider


      .state('app', {
        cache: false,
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })

      .state('app.start', {
        cache: false,
        url: '/start',
        views: {
          'menuContent': {
            templateUrl: 'templates/start.html',
            controller: 'StartCtrl'
          }
        }
      })

      .state('app.main', {
        cache: false,
        url: '/main',
        views: {
          'menuContent': {
            templateUrl: 'templates/main.html',
            controller: 'MainCtrl'
          }
        }
      })

      .state('app.event', {
        cache: false,
        url: '/event/:eventId/:agenda',
        views: {
          'menuContent': {
            templateUrl: 'templates/event.html',
            controller: 'EventCtrl'
          }
        }
      })

      .state('app.feedback', {
        cache: false,
        url: '/event/:eventId/feedback',
        views: {
          'menuContent': {
            templateUrl: 'templates/feedback.html',
            controller: 'FeedbackCtrl'
          }
        }
      })
      //
      .state('app.agenda', {
        cache: false,
        url: '/agenda/:agendaId',
        views: {
          'menuContent': {
            templateUrl: 'templates/agenda.html',
            controller: 'AgendaCtrl'
          }
        }
      })

      .state('app.edit-agenda', {
        cache: false,
        url: '/edit-agenda/:agendaId',
        views: {
          'menuContent': {
            templateUrl: 'templates/edit-agenda.html',
            controller: 'EditAgendaCtrl'
          }
        }
      })
 
      .state('app.edit-event', {
        url: '/edit-event/:eventId',
        views: {
          'menuContent': {
            templateUrl: 'templates/edit-event.html',
            controller: 'EditEventCtrl'
          }
        }
      })





      .state('app.login', {
        url: '/login',
        views: {
          'menuContent': {
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl'
          }
        }
      })

      .state('app.logout', {
        cache: false,
        url: '/logout',
        views: {
          'menuContent': {
            controller: 'LogoutCtrl'
          }
        }
      })

      .state('app.new_event', {
        url: '/new_event',
        views: {
          'menuContent': {
            templateUrl: 'templates/new_event.html',
            controller: 'CreateEventCtrl'
          }
        }
      })

      .state('app.register', {
        url: '/register',
        views: {
          'menuContent': {
            templateUrl: 'templates/register.html',
            controller: 'RegisterCtrl'
          }
        }
      })

      .state('app.my-account', {
        cache: false,
        url: '/my-account',
        views: {
          'menuContent': {
            templateUrl: 'templates/my-account.html',
            controller: 'MyAccountCtrl'
          }
        }
      })

      .state('app.forgotPassword', {
        url: '/forgotPassword',
        views: {
          'menuContent': {
            templateUrl: 'templates/forgotPassword.html',
            controller: 'ForgotCtrl'
          }
        }
      })

      .state('app.edit-account', {
        url: '/edit-account',
        views: {
          'menuContent': {
            templateUrl: 'templates/edit-account.html',
            controller: 'EditAccountCtrl'
          }
        }
      })

      .state('app.transition', {
        url: '/transition/:to/',
        views: {
          'menuContent': {
            templateUrl: 'templates/transition.html',
            controller: 'TransitionCtrl'
          },
        },
        params: {data: null}
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/start');
  });
