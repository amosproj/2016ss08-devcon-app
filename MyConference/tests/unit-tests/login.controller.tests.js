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

describe('LoginCtrl:', function() {
  var scope,
    backendServiceMock,
    q,
    ctrl,
    credentials,
    ionicPopupMock,
    translateMock,
    dfd;

  beforeEach(module('starter'));

  beforeEach(module(function($provide, $urlRouterProvider) {
    $provide.value('$ionicTemplateCache', function(){} );
    $urlRouterProvider.deferIntercept();
  }));

  beforeEach(inject(function ($rootScope, $controller, $q) {
    credentials = {
      username: 'blabla',
      password: 'blabla'
    }
    dfd = $q.defer();
    backendServiceMock = {
      login: function (username, password) {
        return dfd.promise;
      },
      logout: function () {
        return dfd.promise;
      }
    }
    ionicPopupMock = jasmine.createSpyObj('$ionicPopup spy', ['alert']);
    translateMock = function () {
      return dfd.promise()
    }
    spyOn(backendServiceMock, 'login').and.callThrough();
    scope = $rootScope.$new();
    ctrl = $controller('LoginCtrl', {
      $scope: scope,
      $ionicPopup: ionicPopupMock,
      $translate: translateMock,
      backendService: backendServiceMock
    });
    scope.login(credentials);
  }));

  // tests
  describe('login function', function () {
    it('should call backendService.login function', function () {

      //expect backendService.login function to be called with the credentials that was inputted by user
      expect(backendServiceMock.login).toHaveBeenCalledWith('blabla', 'blabla');
    })

    it('if executed successfully, should call alert about successful login', function () {
      //simulate successful login

    })

  })

})
