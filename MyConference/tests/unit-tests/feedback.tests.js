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
describe('Feedback', function () {
  var scope,
    backendServiceMock,
    ctrl,
    ionicPopupMock,
    attendedDeferred,
    resolveDeferred,
    eventDeferred,
    checkOrganizerWithParamsDeferred,
    isCurrentUserAdminDeferred,
    alreadyFeedbackedDeferred;

  beforeEach(module('starter'));
  beforeEach(module(function ($provide, $urlRouterProvider) {
    $provide.value('$ionicTemplateCache', function () {
    });
    $urlRouterProvider.deferIntercept();
  }));
  beforeEach(inject(function ($rootScope, $controller, $q, $httpBackend) {
    $httpBackend.whenGET('locales/de.json').respond(200, '');
    checkOrganizerWithParamsDeferred = $q.defer();
    attendedDeferred = $q.defer();
    alreadyFeedbackedDeferred = $q.defer();
    eventDeferred = $q.defer();
    resolveDeferred = $q.defer();
    resolveDeferred.resolve([]);
    isCurrentUserAdminDeferred = $q.defer();
    backendServiceMock = {
      isCurrentUserAdmin: jasmine.createSpy("isCurrentUserAdmin").and.returnValue(isCurrentUserAdminDeferred.promise),
      checkOrganizerWithParams: jasmine.createSpy("checkOrganizerWithParams").and.returnValue(checkOrganizerWithParamsDeferred.promise),
      isCurrentUserOrganizer: jasmine.createSpy("isCurrentUserOrganizer").and.returnValue(resolveDeferred.promise),
      getEventById: jasmine.createSpy("getEventById").and.returnValue(eventDeferred.promise),
      isCurrentUserRegisteredForEvent: jasmine.createSpy("isCurrentUserRegisteredForEvent").and.returnValue(resolveDeferred.promise),
      isCurrentUserAttendedForEvent: jasmine.createSpy("isCurrentUserAttendedForEvent").and.returnValue(attendedDeferred.promise),
      getFileDetails: jasmine.createSpy("getFileDetails").and.returnValue(resolveDeferred),
      loadAgendaWithParams: jasmine.createSpy("loadAgendaWithParams").and.returnValue(resolveDeferred.promise),
      uploadFile: jasmine.createSpy("uploadFile").and.returnValue(resolveDeferred.promise),
      deleteFile: jasmine.createSpy("deleteFile").and.returnValue(resolveDeferred.promise),
      addCurrentUserToEvent: jasmine.createSpy("addCurrentUserToEvent").and.returnValue(resolveDeferred.promise),
      getOrganisers: jasmine.createSpy("getOrganisers").and.returnValue(resolveDeferred.promise),
      currentUser: jasmine.createSpy("currentUser").and.returnValue(resolveDeferred.promise),
      sendPushNotificationToUsers: jasmine.createSpy("sendPushNotificationToUsers").and.returnValue(resolveDeferred.promise),
      removeCurrentUserFromEvent: jasmine.createSpy("removeCurrentUserFromEvent").and.returnValue(resolveDeferred.promise),
      deleteAgenda: jasmine.createSpy("deleteAgenda").and.returnValue(resolveDeferred.promise),
      deleteEvent: jasmine.createSpy("deleteEvent").and.returnValue(resolveDeferred.promise),
      hasCurrentUserAlreadyGivenFeedback: jasmine.createSpy("hasCurrentUserAlreadyGivenFeedback").and.returnValue(alreadyFeedbackedDeferred.promise),
      getUser: jasmine.createSpy("getUser").and.returnValue(resolveDeferred.promise),
      fetchCurrentUser: jasmine.createSpy("fetchCurrentUser").and.returnValue(resolveDeferred.promise),
      addingAgenda: jasmine.createSpy("addingAgenda").and.returnValue(resolveDeferred.promise)
    };

    ionicPopupMock = jasmine.createSpyObj('$ionicPopup spy', ['alert']);
    scope = $rootScope.$new();
    ctrl = $controller('EventCtrl', {
      $scope: scope,
      $ionicPopup: ionicPopupMock,
      backendService: backendServiceMock,
      $stateParams: {eventId: 1}
    });

    now = new Date(2016, 6, 4, 13, 22, 9);
    jasmine.clock().mockDate(now);
    twoDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 0, 0, 0);
    today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    inThreeDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 0, 0, 0);
    threeHoursBefore = new Date(0, 0, 0, now.getHours() - 3, now.getMinutes(), now.getSeconds());
    oneHourBefore = new Date(0, 0, 0, now.getHours() - 1, now.getMinutes(), now.getSeconds());
    fiveMinutesAfter = new Date(0, 0, 0, now.getHours(), now.getMinutes() + 5, now.getSeconds());
    fourHoursAfter = new Date(0, 0, 0, now.getHours() + 4, now.getMinutes(), now.getSeconds());
  }));

  describe("isFeedbackAllowed", function () {
    describe("with attended user who did not feedbacked", function () {
      beforeEach(function () {
        attendedDeferred.resolve(true);
        alreadyFeedbackedDeferred.resolve(false);
      });
      it("should not display the Feedback button for future event", function () {
        eventDeferred.resolve(
          {
            'data': {
              "title": "test",
              "date": inThreeDays.toISOString(),
              "begin": oneHourBefore,
              "end": fourHoursAfter
            }
          }
        );
        scope.$digest();
        expect(scope.isFeedbackAllowed).toBe(false);
      });

      it("should display the Feedback button for current event", function () {
        eventDeferred.resolve({
          'data': {
            "title": "test",
            "date": today.toISOString(),
            "begin": oneHourBefore,
            "end": fiveMinutesAfter
          }
        });
        scope.$digest();
        expect(scope.isFeedbackAllowed).toBe(true);
      });

      it("should display the Feedback button for event that ended less than 48h ago", function () {
        eventDeferred.resolve({
          'data': {
            "title": "test",
            "date": twoDaysAgo.toISOString(),
            "begin": oneHourBefore,
            "end": fourHoursAfter
          }
        });
        scope.$digest();
        expect(scope.isFeedbackAllowed).toBe(true);
      });

      it("should not display the Feedback button for event that ended more than 48h ago", function () {
        eventDeferred.resolve({
          'data': {
            "title": "test",
            "date": twoDaysAgo.toISOString(),
            "begin": threeHoursBefore,
            "end": oneHourBefore
          }
        });
        scope.$digest();
        expect(scope.isFeedbackAllowed).toBe(false);
      });
    });

    describe("with attended user who already feedbacked", function () {
      beforeEach(function () {
        attendedDeferred.resolve(true);
        alreadyFeedbackedDeferred.resolve(true);
      });
      it("should not display the Feedback button for attended user who already feedbacked", function () {
        eventDeferred.resolve(
          {
            'data': {
              "title": "test",
              "date": inThreeDays.toISOString(),
              "begin": oneHourBefore,
              "end": fourHoursAfter
            }
          }
        );
        scope.$digest();
        expect(scope.isFeedbackAllowed).toBe(false);
      });
    });

    describe("with not attended user", function () {
      beforeEach(function () {
        attendedDeferred.resolve(false);
        alreadyFeedbackedDeferred.resolve(false);
      });
      it("should not display the Feedback button for unattended user", function () {
        eventDeferred.resolve(
          {
            'data': {
              "title": "test",
              "date": inThreeDays.toISOString(),
              "begin": oneHourBefore,
              "end": fourHoursAfter
            }
          }
        );
        scope.$digest();
        expect(scope.isFeedbackAllowed).toBe(false);
      });
    });
  })

  describe("areFeedbackResultsVisible", function () {
    beforeEach(function () {
      attendedDeferred.resolve(true);
      alreadyFeedbackedDeferred.resolve(false);
    });
    it("should not display the Feedback results button for future event", function () {
      eventDeferred.resolve(
        {
          'data': {
            "title": "test",
            "date": inThreeDays.toISOString(),
            "begin": oneHourBefore,
            "end": fourHoursAfter
          }
        }
      );
      scope.$digest();
      expect(scope.areFeedbackResultsVisible).toBe(false);
    });

    it("should not display the Feedback results button for current event", function () {
      eventDeferred.resolve({
        'data': {
          "title": "test",
          "date": today.toISOString(),
          "begin": oneHourBefore,
          "end": fiveMinutesAfter
        }
      });
      scope.$digest();
      expect(scope.areFeedbackResultsVisible).toBe(false);
    });

    it("should display the Feedback results button for event that ended", function () {
      eventDeferred.resolve({
        'data': {
          "title": "test",
          "date": today.toISOString(),
          "begin": threeHoursBefore,
          "end": oneHourBefore
        }
      });
      scope.$digest();
      expect(scope.areFeedbackResultsVisible).toBe(true);
    });
  })
});
