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
describe('LoginCtrl: ', function () {
  var scope,
    backendServiceMock,
    ctrl,
    credentials,
    ionicPopupMock,
    translateMock,
    loginDfd,
    logoutDfd,
    userDfd,
    eventDfd,
    assureDfd,
    translateDfd,
    alertDfd;
  beforeEach(module('starter'));
  beforeEach(module(function ($provide, $urlRouterProvider) {
    $provide.value('$ionicTemplateCache', function () {
    });
    $urlRouterProvider.deferIntercept();
  }));
  beforeEach(inject(function ($rootScope, $controller, $q, $httpBackend) {
    $httpBackend.whenGET('locales/de.json').respond(200, '');
    credentials = {
      username: 'blabla',
      password: 'blabla'
    }
    loginDfd = $q.defer();
    logoutDfd = $q.defer();
    userDfd = $q.defer();
    eventDfd = $q.defer();
    assureDfd = $q.defer();
    translateDfd = $q.defer();
    alertDfd = $q.defer();
    backendServiceMock = {
      login: jasmine.createSpy('login spy').and.returnValue(loginDfd.promise),
      logout: jasmine.createSpy('logout spy').and.returnValue(logoutDfd.promise),
      applySettingsForCurrentUser: function () {},
      getUser: jasmine.createSpy('getUser spy').and.returnValue(userDfd.promise),
      assureConnection: jasmine.createSpy('assureConnection spy').and.returnValue(assureDfd.promise),
      getEvents: jasmine.createSpy('getEvents spy').and.returnValue(eventDfd.promise)
    }
    ionicPopupMock = jasmine.createSpyObj('$ionicPopup spy', ['alert'])
    translateMock = jasmine.createSpy('$translate spy').and.returnValue(translateDfd.promise)
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
  describe('login function ', function () {
    beforeEach(function () {
      //simulate successful login
      assureDfd.resolve();
      scope.$digest();
      userDfd.resolve({
        data: {
          user: {
            status: "blabla"
          }
        }
      });
      scope.$digest();
      logoutDfd.resolve([]);
      scope.$digest();
    })
    it('should call backendService.login function with the credentials that was inputted by user', function () {
      expect(backendServiceMock.login).toHaveBeenCalledWith('blabla', 'blabla');
    })
    describe('if executed successfully, ', function () {
      beforeEach(function () {
        //simulate successful login
        loginDfd.resolve([]);
        scope.$digest();
      })
      it('should call backenService.getEvents function', function () {
        expect(backendServiceMock.getEvents).toHaveBeenCalled();
      })
      it('should call $translate service with "Done!" message', function () {
        eventDfd.resolve([]);
        scope.$digest();
        expect(translateMock).toHaveBeenCalledWith('Done!');
      })
      it('should call alert about successful login', function () {
        ionicPopupMock.alert.and.returnValue(alertDfd.promise)
        eventDfd.resolve([]);
        scope.$digest();
        translateDfd.resolve('Done!');
        scope.$digest();
        expect(ionicPopupMock.alert).toHaveBeenCalledWith({
          title: 'Done!',
          template: "{{'Login successful.' | translate}}"
        })
      })
    })
    describe('if executed unsuccessfully, ', function () {
      beforeEach(function () {
        //simulate unsuccessful login
        loginDfd.reject([]);
        scope.$digest();
      })
      it('should call $translate service with "Error!" message', function () {
        expect(translateMock).toHaveBeenCalledWith('Error!');
      })
      it('should call alert about unsuccessful login', function () {
        translateDfd.resolve('Error!');
        scope.$digest();
        expect(ionicPopupMock.alert).toHaveBeenCalledWith({
          title: 'Error!',
          template: "{{'Username and password did not match.' | translate}}"
        })
      })
    })
  })
})
