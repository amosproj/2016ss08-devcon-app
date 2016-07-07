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
describe('RegisterCtrl: ', function () {
  var scope,
    backendServiceMock,
    translateMock,
    ionicPopupMock,
    stateMock,
    user,
    signupDfd,
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
    user = { name: 'blabla'}
    scope = $rootScope.$new();
    signupDfd = $q.defer();
    translateDfd = $q.defer();
    alertDfd = $q.defer();
    backendServiceMock = {
      createAccount: jasmine.createSpy('createAccount spy').and.returnValue(signupDfd.promise),

      logout: function () {}
    }
    translateMock = jasmine.createSpy('$translate spy').and.returnValue(translateDfd.promise)
    ionicPopupMock = jasmine.createSpyObj('$ionicPopup spy', ['alert'])
    ionicPopupMock.alert.and.returnValue(alertDfd.promise)
    stateMock = jasmine.createSpyObj('$state spy', ['go'])
    ctrl = $controller('RegisterCtrl', {
      $scope: scope,
      backendService: backendServiceMock,
      $state: stateMock,
      $ionicPopup: ionicPopupMock,
      $translate: translateMock,
    })
    scope.createAccount(user)
  }))
  // tests
  it('should call backendService.createAccount function with the information typed by user in registration form', function () {
    expect(backendServiceMock.createAccount).toHaveBeenCalledWith(user);
  })
  describe('if executed successfully, ', function () {
    beforeEach(function () {
      //simulate successful registration
      signupDfd.resolve([]);
      scope.$digest();
    })
    it('should call $translate service with "Done!" message', function () {
      expect(translateMock).toHaveBeenCalledWith('Done!');
    })
    it('should call alert with greeting new registered user', function () {
      translateDfd.resolve('Done!');
      scope.$digest();
      expect(ionicPopupMock.alert).toHaveBeenCalledWith({
        title: 'Done!',
        template: "{{'Welcome' | translate}}, blabla"
      })
    })
    it('should redirect to the main page', function () {
      translateDfd.resolve('Done!');
      scope.$digest();
      alertDfd.resolve();
      scope.$digest();
      expect(stateMock.go).toHaveBeenCalledWith('app.main');
    })
  })
  describe('if executed unsuccessfully, ', function () {
    beforeEach(function () {
      //simulate unsuccessful registration
      signupDfd.reject();
      scope.$digest();
    })
    it('should call $translate service with "Error!" message', function () {
      expect(translateMock).toHaveBeenCalledWith('Error!');
    })
    it('should call alert about unsuccessful registration', function () {
      translateDfd.resolve('Error!');
      scope.$digest();
      expect(ionicPopupMock.alert).toHaveBeenCalledWith({
        title: 'Error!',
        template: "{{'This mail address is already in use.' | translate}}"
      })
    })
  })
})
