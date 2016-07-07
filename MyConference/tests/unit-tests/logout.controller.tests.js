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
describe('LogoutCtrl: ', function () {
  var scope,
    backendServiceMock,
    translateMock,
    ionicPopupMock,
    stateMock,
    logoutDfd,
    translateDfd,
    alertDfd,
    ctrl;
  beforeEach(module('starter'));
  beforeEach(module(function ($provide, $urlRouterProvider) {
    $provide.value('$ionicTemplateCache', function () {
    });
    $urlRouterProvider.deferIntercept();
  }));
  beforeEach(inject(function ($rootScope, $controller, $q, $httpBackend) {
    $httpBackend.whenGET('locales/de.json').respond(200, '');
    scope = $rootScope.$new();
    logoutDfd = $q.defer();
    translateDfd = $q.defer();
    alertDfd = $q.defer();
    backendServiceMock = {
      logout: jasmine.createSpy('logout spy').and.returnValue(logoutDfd.promise)
    }
    translateMock = jasmine.createSpy('$translate spy').and.returnValue(translateDfd.promise)
    ionicPopupMock = jasmine.createSpyObj('$ionicPopup spy', ['alert'])
    ionicPopupMock.alert.and.returnValue(alertDfd.promise)
    stateMock = jasmine.createSpyObj('$state spy', ['go'])
    ctrl = $controller('LogoutCtrl', {
      $scope: scope,
      backendService: backendServiceMock,
      $state: stateMock,
      $ionicPopup: ionicPopupMock,
      $translate: translateMock,
    })
  }))
  // tests
  it('should call backendService.logout function', function () {
    expect(backendServiceMock.logout).toHaveBeenCalled();
  })
  describe('after logout, ', function () {
    beforeEach(function () {
      //simulate logout
      logoutDfd.resolve([]);
      scope.$digest();
    })
    it('should call $translate service with "Done!" message', function () {
      expect(translateMock).toHaveBeenCalledWith('Done!');
    })
    it('should call alert about successful logout', function () {
      translateDfd.resolve('Done!');
      scope.$digest();
      expect(ionicPopupMock.alert).toHaveBeenCalledWith({
        title: 'Done!',
        template: "{{'You are logged out' | translate}}"
      })
    })
    it('should redirect to the start page', function () {
      translateDfd.resolve('Done!');
      scope.$digest();
      alertDfd.resolve();
      scope.$digest();
      expect(stateMock.go).toHaveBeenCalledWith('app.start');
    })
  })
})
