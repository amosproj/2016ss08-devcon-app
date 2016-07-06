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
describe('New event: ', function () {
  var scope,
    backendServiceMock,
    ctrl,
    mockEvent,
    ionicPopupMock,
    translateMock,
    alertDfd,
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
      "title": "mockTitle"
    };

    eventDfd = $q.defer();
    translateDfd = $q.defer();
    alertDfd = $q.defer();
    backendServiceMock = {
      createEvent: jasmine.createSpy('createEvent spy').and.returnValue(eventDfd.promise)
    };
    ionicPopupMock = jasmine.createSpyObj('$ionicPopup spy', ['alert']);
    translateMock = jasmine.createSpy('$translate spy').and.returnValue(translateDfd.promise);
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
    });
    describe('if executed successfully ', function () {
      beforeEach(function () {
        eventDfd.resolve([]);
        scope.$digest();
      });
      it('should call $translate service with "Done!" message', function () {
        expect(translateMock).toHaveBeenCalledWith('Done!');
      });
      it('should call alert about successful creation', function () {
        ionicPopupMock.alert.and.returnValue(alertDfd.promise);
        scope.$digest();
        translateDfd.resolve('Done!');
        scope.$digest();
        expect(ionicPopupMock.alert).toHaveBeenCalledWith({
          title: 'Done!',
          template: "{{'Event' | translate}}" + ' "' + mockEvent.title + '" ' + "{{'created' | translate}}" + "."
        })
      })
    })
  })
});
