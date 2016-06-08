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


angular.module('starter.directives', [])



  .directive('feedbackGroup', function() {
    return {
      restrict: 'E',
      scope: {
        ratingObject: "="
      },
      templateUrl: 'templates/directives/feedbackGroup.html',

    };
  })


//directive to check password match

  .directive('validateMatch', function () {
    return {
      require: 'ngModel',
      scope: {
        validateMatch: '='
      },
      link: function (scope, element, attrs, ngModel) {

        scope.$watch('validateMatch', function () {
          ngModel.$validate();
        });

        ngModel.$validators.match = function (modelValue) {
          if (!modelValue || !scope.validateMatch) {
            return true;
          }
          return modelValue === scope.validateMatch;
        };
      }
    };
  });
