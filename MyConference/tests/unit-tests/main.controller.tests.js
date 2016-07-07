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
describe('MainCtrl: ', function () {
  var scope,
    backendServiceMock,
    stateParamsMock,
    checkOrganizerWithParamsDfd,
    isCurrentUserOrganizerDfd,
    fetchCurrentUserDfd,
    getEventsDfd,
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
    checkOrganizerWithParamsDfd = $q.defer();
    isCurrentUserOrganizerDfd = $q.defer();
    fetchCurrentUserDfd = $q.defer();
    getEventsDfd = $q.defer();
    backendServiceMock = {
      checkOrganizerWithParams: jasmine.createSpy('checkOrganizerWithParams spy').and.returnValue(checkOrganizerWithParamsDfd.promise),
      isCurrentUserOrganizer: jasmine.createSpy('isCurrentUserOrganizer spy').and.returnValue(isCurrentUserOrganizerDfd.valueOf()),
      fetchCurrentUser: jasmine.createSpy('fetchCurrentUser spy').and.returnValue(fetchCurrentUserDfd.promise),
      getEvents: jasmine.createSpy('getEvents spy').and.returnValue(getEventsDfd.promise)
    }
    ctrl = $controller('MainCtrl', {
      $scope: scope,
      backendService: backendServiceMock,
      $stateParams: stateParamsMock
    })
  }))
  // tests
  it('should call backendService.checkOrganizerWithParams function', function () {
    expect(backendServiceMock.checkOrganizerWithParams).toHaveBeenCalled();
  })
  it('should call backendService.fetchCurrentUser function', function () {
    expect(backendServiceMock.fetchCurrentUser).toHaveBeenCalled();
  })
  it('should call backendService.getEvents function', function () {
    expect(backendServiceMock.getEvents).toHaveBeenCalled();
  })

  describe('after backendService.checkOrganizerWithParams function call, ', function () {
    beforeEach(function () {
      checkOrganizerWithParamsDfd.resolve([]);
      scope.$digest();
    })
    it('should call backendService.isCurrentUserOrganizer function', function () {
      expect(backendServiceMock.isCurrentUserOrganizer).toHaveBeenCalledWith(0);
    })
  })
  describe('after backendService.checkOrganizerWithParams function call wit list of none organizer, ', function () {
    beforeEach(function () {
      checkOrganizerWithParamsDfd.resolve(['organizer 1']);
      scope.$digest();
    })
    it('should call backendService.isCurrentUserOrganizer function with list of more than 0 organizer', function () {
      expect(backendServiceMock.isCurrentUserOrganizer).toHaveBeenCalledWith(1);
    })
  })
})
