/**
 * Created by QuangTrung on 18.05.16.
 */

angular.module('starter.directives', [])

.directive('validateMatch', function () {
  return {
    require: 'ngModel',
    scope: {
      validateMatch: '='
    },
    link: function($scope, $element, attrs, ngModel) {

      $scope.$watch('validateMatch', function() {
        ngModel.$validate();
      });

      ngModel.$validators.match = function(modelValue) {
        if (!modelValue || !$scope.validateMatch) {
          return true;
        }
        return modelValue === $scope.validateMatch;
      };
    }
  };
});
;
