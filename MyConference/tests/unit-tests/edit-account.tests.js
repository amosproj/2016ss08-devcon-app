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
describe('Edit Account: ', function () {
  var scope,
    backendServiceMock,
    ctrl,
    ionicPopupMock,
    translateMock,
    mockAccount,
    alertDfd,
    fetchCurrentUserDfd,
    updateUserProfileDfd,
    translateDfd;
  beforeEach(module('starter'));
  beforeEach(module(function ($provide, $urlRouterProvider) {
    $provide.value('$ionicTemplateCache', function () {
    });
    $urlRouterProvider.deferIntercept();
  }));
  beforeEach(inject(function ($rootScope, $controller, $q, $httpBackend) {
    $httpBackend.whenGET('locales/de.json').respond(200, '');
    mockAccount = {
      "visibleByRegisteredUsers": {
      "name": "ABC",
      "gName": "DEF"
    }
    };
    translateDfd = $q.defer();
    alertDfd = $q.defer();
    fetchCurrentUserDfd = $q.defer();
    updateUserProfileDfd = $q.defer();
    backendServiceMock = {
      fetchCurrentUser: jasmine.createSpy('fetchCurrentUser spy').and.returnValue(fetchCurrentUserDfd.promise),
      updateUserProfile: jasmine.createSpy('updateUserProfile spy').and.returnValue(updateUserProfileDfd.promise)
    };
    ionicPopupMock = jasmine.createSpyObj('$ionicPopup spy', ['alert']);
    translateMock = jasmine.createSpy('$translate spy').and.returnValue(translateDfd.promise);
    scope = $rootScope.$new();
    ctrl = $controller('EditAccountCtrl', {
      $scope: scope,
      $ionicPopup: ionicPopupMock,
      $translate: translateMock,
      backendService: backendServiceMock
    });
    scope.updateAccount(mockAccount.visibleByRegisteredUsers);
  }));
  // tests
  describe('updateUserProfile function ', function () {
    it('should call backendService.updateUserProfile function with the mock account', function () {
      expect(backendServiceMock.updateUserProfile).toHaveBeenCalledWith(mockAccount);
    });
    describe('if executed successfully ', function () {
      beforeEach(function () {
        updateUserProfileDfd.resolve([]);
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
          template: "{{'Account updated.' | translate}}"
        })
      })
    })
  })
});
