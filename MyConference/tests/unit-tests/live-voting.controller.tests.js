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
describe('LiveVotingCtrl: ', function () {
  var scope,
    backendServiceMock,
    stateParamsMock,
    eventWithQuestionVotedMock,
    eventWithoutQuestionVotedMock,
    eventWithoutCurrentQuestionMock,
    eventDfd,
    updateDfd,
    ctrl;
  beforeEach(module('starter'));
  beforeEach(module(function ($provide, $urlRouterProvider) {
    $provide.value('$ionicTemplateCache', function () {
    });
    $urlRouterProvider.deferIntercept();
  }));
  beforeEach(inject(function ($rootScope, $controller, $q, $httpBackend, $interval) {
    $httpBackend.whenGET('locales/de.json').respond(200, '');
    eventWithQuestionVotedMock = {
      data: {
        questions: [{
          current: true,
          yes: 1,
          voted: ['blabla']
        }]
      }
    }
    eventWithoutQuestionVotedMock = {
      data: {
        id: 666,
        questions: [{
          current: true,
          yes: 0,
          voted: []
        }]
      }
    }
    eventWithoutCurrentQuestionMock = {
      data: {
        questions: [{
          current: false
        }]
      }
    }
    stateParamsMock = {
      eventId: 666
    }
    scope = $rootScope.$new();
    updateDfd = $q.defer();
    eventDfd = $q.defer();
    backendServiceMock = {
      getEventById: jasmine.createSpy('getEventById mock').and.returnValue(eventDfd.promise),
      updateEvent: jasmine.createSpy('getEventById mock').and.returnValue(updateDfd.promise),
      currentUser: {
        username: 'blabla'
      }
    }
    ctrl = $controller('LiveVotingCtrl', {
      $scope: scope,
      backendService: backendServiceMock,
      $stateParams: stateParamsMock
    })
    $interval.flush(1000)
  }))
  // tests
  it('current event should be requested from backend', function () {
    expect(backendServiceMock.getEventById).toHaveBeenCalledWith(666)
  })

  describe('if there is no current question to vote, ', function () {
    beforeEach(function () {
      eventDfd.resolve(eventWithoutCurrentQuestionMock)
      scope.$digest();
    })
    it('radio button for choosing an answer, submit button and vote results should be unavailable for the user', function () {
      expect(scope.beforeSubmit).toEqual(false);
      expect(scope.afterSubmit).toEqual(false);
    })
  })
  describe('if user already voted for the current question, ', function () {
    beforeEach(function () {
      eventDfd.resolve(eventWithQuestionVotedMock)
      scope.$digest();
    })
   it('radio button for choosing an answer and submit button should be unavailable for the user', function () {
      expect(scope.beforeSubmit).toEqual(false);
      expect(scope.afterSubmit).toEqual(true);
    })
  })

  describe('if user have not voted for the current question, ', function () {
    beforeEach(function () {
      eventDfd.resolve(eventWithoutQuestionVotedMock)
      scope.$digest();
    })
    it('radio button for choosing an answer and submit button should be available for the user', function () {
      expect(scope.beforeSubmit).toEqual(true);
      expect(scope.afterSubmit).toEqual(false);
    })
    describe('submit function: ', function () {
      beforeEach(function () {
        scope.submit('yes');
      })
      it('should increase value of the quantity of the particular answer', function () {
        question = eventWithoutQuestionVotedMock.data.questions[0]
        expect(question.yes).toEqual(1)
      })
      it('username of the user who voted for the question should be stored in question object', function () {
        question = eventWithoutQuestionVotedMock.data.questions[0]
        expect(question.voted.indexOf(backendServiceMock.currentUser.username)).not.toBe(-1);
      })
      it('should call backendService.update function with right parameters', function () {
        questions = eventWithoutQuestionVotedMock.data.questions
        expect(backendServiceMock.updateEvent).toHaveBeenCalledWith(666, "questions", questions)
      })
      describe('after backendService.update function call, ', function () {
        beforeEach(function () {
          updateDfd.resolve([]);
          scope.$digest();
        })
        it('radio for choosing the answer and submit button should be unavailable for the user, voting result should be seen on the page', function () {
          expect(scope.beforeSubmit).toEqual(false);
          expect(scope.afterSubmit).toEqual(true);
        })
      })
    })
  })

})
