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
    mockEvent,
    ionicPopupMock,
    translateMock,
    loginDfd,
    eventDfd,
    translateDfd;
  beforeEach(module('starter'));
  beforeEach(module(function ($provide, $urlRouterProvider) {
    $provide.value('$ionicTemplateCache', function () {
    });
    $urlRouterProvider.deferIntercept();
  }));
  beforeEach(inject(function ($rootScope, $controller, $q, $httpBackend) {
    $httpBackend.whenGET('locales/de.json').respond(200, '');
    mockEvent = {
      "title": "mockTitle",
      "date": "2016-07-02T22:00:00.000Z",
      "begin": "1970-01-01T18:52:00.000Z",
      "end": "1970-01-01T19:52:00.000Z",
      "participants": [
        {
          "name": "default",
          "status": "joined",
          "updated": "false"
        }
      ],
      "questions": []
    }

    eventDfd = $q.defer();
    translateDfd = $q.defer();
    loginDfd = $q.defer();
    alertDfd = $q.defer();
    backendServiceMock = {
      login: jasmine.createSpy('login spy').and.returnValue(loginDfd.promise),
      logout: jasmine.createSpy('logout spy').and.returnValue(loginDfd.promise),
      createEvent: jasmine.createSpy('createEvent spy').and.returnValue(eventDfd.promise)
    }
    ionicPopupMock = jasmine.createSpyObj('$ionicPopup spy', ['alert'])
    translateMock = jasmine.createSpy('$translate spy').and.returnValue(translateDfd.promise)
    scope = $rootScope.$new();
    ctrl = $controller('CreateEventCtrl', {
      $scope: scope,
      $ionicPopup: ionicPopupMock,
      $translate: translateMock,
      backendService: backendServiceMock
    });
    scope.createEvent(mockEvent);
  }));
  // tests
  describe('createEvent function ', function () {
    it('should call backendService.createEvent function with the mock event', function () {
      expect(backendServiceMock.createEvent).toHaveBeenCalledWith(mockEvent);
    })
    describe('if executed successfully ', function () {
      beforeEach(function () {
        //simulate successful login
        loginDfd.resolve([]);
        scope.$digest();
      })
      it('should call $translate service with "Done!" message', function () {
        eventDfd.resolve([]);
        scope.$digest();
        expect(translateMock).toHaveBeenCalledWith('Done!');
      })
      it('should call alert about successful creation', function () {
        ionicPopupMock.alert.and.returnValue(alertDfd.promise)
        eventDfd.resolve([]);
        scope.$digest();
        translateDfd.resolve('Done!');
        scope.$digest();
        expect(ionicPopupMock.alert).toHaveBeenCalledWith({
          title: 'Done!',
          template: "{{'Event' | translate}}" + ' "' + mockEvent.title + '" ' + "{{'created' | translate}}" + "."
        })
      })
    })
    describe('if an error occurs ', function () {
      beforeEach(function () {
        //simulate unsuccessful login
        loginDfd.reject([]);
        scope.$digest();
      })
      it('should call $translate service with "Error!" message', function () {
        expect(translateMock).toHaveBeenCalledWith('Error!');
      })
      it('should call alert about unsuccessful creation', function () {
        translateDfd.resolve('Error!');
        scope.$digest();
        expect(ionicPopupMock.alert).toHaveBeenCalledWith({
          title: 'Error!',
          template: "{{'An error occurred, please check your internet connection and try again' | translate}}"
        })
      })
    })
  })
})
