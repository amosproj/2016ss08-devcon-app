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
angular.module('starter.controllers', ['services', 'ngCordova'])
  .controller('AppCtrl', function ($scope, $ionicModal, $timeout, backendService, $translate) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    // Form data for the login modal
    $scope.loginData = {};
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });
    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };
    // Open the login modal
    $scope.login = function () {
      $scope.modal.show();
    };
    $scope.languageSwitched = false;
    $scope.changeLanguage = function () {
      if ($scope.languageSwitched) {
        $translate.use("de");
      } else {
        $translate.use("en");
      }
      $scope.languageSwitched = !$scope.languageSwitched;
      console.log($scope.languageSwitched);
    };
    $scope.isLoggedIn = false;
    $scope.$on('user:loginState', function (event, data) {
      // you could inspect the data to see if what you care about changed, or just update your own scope
      $scope.isLoggedIn = backendService.loginStatus;
      console.log("Login event processed: " + backendService.loginStatus)
    });
  })

  /*
   Controller for starter view
   Shows loading while establishing connection to the backend
   If connection successfully establishes redirects to main view,
   if no shows an error alert and reloads controller
   */
  .controller('StartCtrl', function ($scope, $state, $ionicHistory, $ionicPopup, $ionicLoading, backendService, $translate) {
    console.log("Start contorller");
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    backendService.connect().then(function (res) {
      $ionicLoading.hide();
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('app.main')
    }, function (err) {
      $translate("Error!").then(
        function (res) {
          $ionicPopup.alert({
            title: res,
            template: "{{'Check your internet connection and try again' | translate}}"
          });
          credentials.password = "";
        }
      );
    })
  })
  /*
   Controller for forgot password page
   Calls resetPassword service, shows a popup alert about successful  reset of a password
   and redirects to login view

   */
  .controller('ForgotCtrl', function ($scope, $state, backendService, $ionicPopup, $translate) {
    $scope.resetPassword = function (user) {
      backendService.resetPassword(user);
      $translate("Done!").then(
        function (res) {
          $ionicPopup.alert({
            title: res,
            template: "{{'An email has been sent to you with instructions on resetting your password.' | translate}}"
          }).then(function (res) {
            $state.reload();
          });
        }
      );
    }
  })

  /*
   Controller for getting Map view with current position
   and the difference between current position and event position using coordinates
   */

  .controller('MapCtrl', function ($scope, $state, $stateParams, $timeout, backendService, $cordovaGeolocation,
                                   $translate, $ionicLoading, $ionicPlatform, $ionicPopup) {

    backendService.getEventById($stateParams.eventId).then(function (res) {
        $scope.event = res['data'];
        var event = $scope.event;
        var cord = event.coordinates;
        var evlat = cord.lat;
        var evlong = cord.long;


        $ionicPlatform.ready(function () {

          var posOptions = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          };
          $translate('Permission to use GPS').then(
            function (res) {
              var confirmPopup = $ionicPopup.confirm({
                title: res,
                template: "{{'please make sure that your GPS is activated' | translate }}"
              });
              confirmPopup.then(function (res) {
                if (res) {
                  $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
                  });
                  $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                    var lat = position.coords.latitude;
                    var long = position.coords.longitude;
                    var dst = 'Distance: ' + calcTheDistance(lat, long) + ' Metres';

                    var myLatlng = new google.maps.LatLng(lat, long);


                    var mapOptions = {
                      center: myLatlng,
                      zoom: 16,
                      mapTypeId: google.maps.MapTypeId.ROADMAP
                    };

                    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
                    var marker = new google.maps.Marker({
                      map: map, position: myLatlng,
                      draggable: true,
                      animation: google.maps.Animation.DROP
                    });
                    marker.addListener('click', toggleBounce);

                    function toggleBounce() {
                      if (marker.getAnimation() !== null) {
                        marker.setAnimation(null);
                      } else {
                        marker.setAnimation(google.maps.Animation.BOUNCE);
                      }
                    }


                    function toRadians(num) {
                      return num * Math.PI / 180;
                    }


                    function calcTheDistance(lati1, long1) {
                      var r = 6371000; //metres
                      var eventLat = evlat;
                      var eventLon = evlong;
                      var la1 = lati1;
                      var la2 = eventLat;
                      var lat1 = toRadians(lati1);
                      var lat2 = toRadians(eventLat);
                      var lo1 = long1;
                      var lo2 = eventLon;
                      var la2minla1 = toRadians(la2 - la1);
                      var lo2minlo1 = toRadians(lo2 - lo1);

                      var cal = Math.sin(la2minla1 / 2) * Math.sin(la2minla1 / 2) +
                        Math.cos(lat1) * Math.cos(lat2) *
                        Math.sin(lo2minlo1 / 2) * Math.sin(lo2minlo1 / 2);
                      var c = 2 * Math.atan2(Math.sqrt(cal), Math.sqrt(1 - cal));

                      var d = r * c;

                      return Math.round(d);

                    }

                    var x = calcTheDistance(lat, long);
                    var y = 300;
                    var id = event.id;
                    if (x < y) {

                      console.log('---Participant attended');
                      backendService.changeUserStatus(id);
                      $translate('Attended!').then(
                        function (res) {
                          $ionicPopup.alert({
                            title: res,
                            template: "{{'Great! you have attended this Event. Your position is' | translate}}" + ' "' + x + '" ' + "{{'meter far from the Event' | translate}}" + "."
                          });
                        });

                    } else {
                      console.log('---Participant not attended');
                      $translate('Not Attended!').then(
                        function (res1) {
                          $ionicPopup.alert({
                            title: res1,
                            template: "{{'Oops! You have not attended this Event. Your position is' | translate}}" + ' "' + x + '" ' + "{{'meter far from the Event' | translate}}" + "."
                          });
                        });
                    }

                    console.log('latitude:', lat);
                    console.log('longitude:', long);
                    console.log('****distance****', x);
                    $scope.map = map;
                    $ionicLoading.hide();
                  }, function (error) {

                    console.log("Could not get location");
                    $translate('Enable GPS').then(
                      function (res) {
                        $ionicPopup.alert({
                          title: res,
                          template: "{{'please make sure that your GPS is activated and try again later' | translate}}"
                        });
                      });
                    $ionicLoading.hide();
                    $state.go('app.main')
                  });

                }
                else {
                  $state.go('app.main')
                }
              })
            });
          console.log('coordinates  : ', cord);

        });

      },
      function (err) {
        $ionicLoading.hide();
        console.log(err);
      }
    )
  })



  /*
   Controller for transition handling
   redirects to the defined as a parameter state
   */
  .controller('TransitionCtrl', function ($scope, $state, $ionicHistory, $stateParams) {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go($stateParams.to, $stateParams.data)
  })

  /*
   Controller for the Main Page (overview page).
   Gets the events out of the backend by calling the service function.
   Provides the filter methods for previous and next events.
   */
  .controller('MainCtrl', function ($scope, $state, $ionicPopup, backendService) {
    var today = new Date();
    /*
     This method is used for filter after prevoius events in the main view
     */
    $scope.previousEvents = function (item) {
      var itemDate = new Date(item.date);
      return today < itemDate;
    };
    /* 
     This method is used for filter after today's events in the main view 
     */
    $scope.todaysEvents = function (item) {
      var itemDate = new Date(item.date);
      return itemDate.getDay() == today.getDay() &&
        itemDate.getMonth() == today.getMonth() &&
        itemDate.getFullYear() == today.getFullYear();
    };
    /*
     This method is used for filter after next events in the main view
     */
    $scope.nextEvents = function (item) {
      return !$scope.todaysEvents(item) && !$scope.previousEvents(item);
    };
    backendService.fetchCurrentUser().then(function (res) {
    }, function (error) {
      $state.go('app.start')
    });
    backendService.getEvents().then(function (res) {
      $scope.events = res;
    }, function (reason) {
      console.log("Error detected because of " + reason);
    })
  })

  /*
   Controller for creating an event
   Calls createEvent service, shows a popup alert about successful creation of an event
   and redirects to main view
   */
  .controller('CreateEventCtrl', function ($scope, $state, $ionicPopup, backendService, $translate) {
    $scope.createEvent = function (ev) {
      backendService.createEvent(ev);
      $translate('Done!').then(
        function (res) {
          $ionicPopup.alert({
            title: res,
            template: "{{'Event' | translate}}" + ' "' + ev.title + '" ' + "{{'created' | translate}}" + "."
          }).then(function (res) {
            $state.go('app.main')
          });
        }
      );
    }
  })

  /*
   Controller for showing event information
   Gets event by its id rom backend, gets agenda file name and download url if it exist
   Contains functions for uploading and downloading a file
   */
  .controller('EventCtrl', function ($scope, $state, $stateParams, backendService, $ionicPlatform, $ionicLoading, $ionicPopup, $cordovaInAppBrowser, $translate, $cordovaEmailComposer, $cordovaFile, $filter) {
    $scope.agenda = (typeof $stateParams.agenda !== 'undefined' && $stateParams.agenda != "");
    $scope.upload = false;
    $scope.showButton = false;
    //Attribute for determing if feedback is allowed (which is the case while the event and 48h afterwards)
    // Is set later after loading the agenda
    $scope.isFeedbackAllowed = false;
    $scope.areFeedbackResultsVisible = false;
    backendService.getEventById($stateParams.eventId).then(function (res) {
      $scope.event = res['data'];
      if (typeof backendService.currentUser !== 'undefined'
        && (backendService.currentUser.roles.indexOf('administrator') != -1 || backendService.currentUser.username == res['data']._author))
        $scope.showButton = true;
      backendService.isCurrentUserRegisteredForEvent($scope.event.id).then(
        function (res) {
          $scope.isCurrentUserRegistered = res;
        }
      );
      if ($scope.agenda) {
        backendService.getFileDetails(res['data'].fileId).then(function (file) {
          $scope.filename = file['data'].fileName;
          $scope.downloadUrl = backendService.getFileUrl(res['data'].fileId)
        }, function (fileError) {
          console.log("Error by getting file details")
        })
      }
    }, function (error) {
      console.log("Error by retrieving the event", error)
    });
    $(document).on("submit", "#uploadForm", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
      var formData = new FormData();
      formData.append('file', $('input[type=file]')[0].files[0]);
      backendService.uploadFile(formData, $stateParams.eventId).then(function (res) {
        // if there was already an agenda file then delete it
        if ($scope.agenda) {
          backendService.deleteFile($stateParams.agenda);
        }
        $ionicLoading.hide();
        $translate('Done!').then(
          function (res2) {
            $ionicPopup.alert({
              title: res2,
              template: "{{'File successfully uploaded' | translate}}"
            }).then(function (res3) {
              res = jQuery.parseJSON(res);
              $state.go('app.transition', {
                to: 'app.event',
                data: {eventId: $stateParams.eventId, agenda: res['data'].id}
              })
            });
          }
        );
      }, function (error) {
        $ionicLoading.hide();
        $translate('Error!').then(
          function (res) {
            $ionicPopup.alert({
              title: res,
              template: "{{'Error occurred by uploading a file' | translate}}"
            });
          }
        );
      })
    });
    $scope.download = function (url) {
      $ionicPlatform.ready(function () {
        $cordovaInAppBrowser.open(url, '_system')
          .then(function (event) {
            console.log("url successfully opened")
          })
          .catch(function (event) {
            console.log("error by opening url")
          });
      });
    };
    //function for the Join-Event-Button
    $scope.joinEvent = function () {
      backendService.addCurrentUserToEvent($scope.event.id).then(
        function (res) {
          $translate('Done!').then(
            function (res2) {
              $scope.isCurrentUserRegistered = true;
              $ionicPopup.alert({
                title: res2,
                template: "{{'We are happy to see you at' | translate}}" + " " + $scope.event.title + "!"
              });
            }
          );
        }, function (err) {
          $translate('Error!').then(
            function (res2) {
              $ionicPopup.alert({
                title: res2,
                template: "{{'Error while registration.' | translate}}"
              });
            }
          );
        });
    };
    //function for the Leave-Event-Button
    $scope.leaveEvent = function () {
      backendService.removeCurrentUserFromEvent($scope.event.id).then(
        function (res) {
          $translate('Done!').then(
            function (res2) {
              $scope.isCurrentUserRegistered = false;
              $ionicPopup.alert({
                title: res2,
                template: "{{'We are sad not seeing you at' | translate}}" + " " + $scope.event.title + "!"
              });
            }
          );
        }, function (err) {
          $translate('Error!').then(
            function (res2) {
              $ionicPopup.alert({
                title: res2,
                template: "{{'Error while undoing registration.' | translate}}"
              });
            }
          );
        });
    };
    /*
     Function that returns the first begin time of all talks and the last end time of all talks.
     Should be simplified once we store the start time of the event itself.
     */
    getBorderTimesOfTalks = function () {
      firstBeginTime = new Date("1970-01-01T22:59:00.000Z");
      lastEndTime = new Date("1969-12-31T23:00:00.000Z");
      for (agendaNr in $scope.agendaList) {
        beginTime = new Date($scope.agendaList[agendaNr].begin);
        endTime = new Date($scope.agendaList[agendaNr].end);
        if (beginTime < firstBeginTime) {
          firstBeginTime = beginTime;
        }
        if (endTime > lastEndTime) {
          lastEndTime = endTime;
        }
      }
      return {firstBeginTime: firstBeginTime, lastEndTime: lastEndTime};
    }

    /*
     Function that determines if now is between the first agenda talk and not more than 48h after the last.
     Finds the first beginnig and the last ending time of the talks first.
     */
    isFeedbackAllowed = function () {
      borderTimes = getBorderTimesOfTalks();
      firstBeginTime = borderTimes.firstBeginTime;
      lastEndTime = borderTimes.lastEndTime;

      eventDateSplitted = $scope.event.date.split("-");
      eventDateSplitted[2] = eventDateSplitted[2].split("T")[0];
      beginDate = new Date(eventDateSplitted[0], eventDateSplitted[1] - 1, eventDateSplitted[2], firstBeginTime.getHours(), firstBeginTime.getMinutes(), 0, 0);
      endDatePlus48h = new Date(eventDateSplitted[0], eventDateSplitted[1] - 1, eventDateSplitted[2], lastEndTime.getHours() + 48, lastEndTime.getMinutes(), 0, 0);
      now = new Date();
      if (now >= beginDate && now <= endDatePlus48h) {
        return true;
      } else {
        return false;
      }
    }
    /*
     Function that determines if now is after the last talk (what means the results of the feedback can be seen).
     */
    areFeedbackResultsVisible = function () {
      if ($scope.agendaList.length == 0) {
        return true;
      }
      borderTimes = getBorderTimesOfTalks();
      lastEndTime = borderTimes.lastEndTime;

      eventDateSplitted = $scope.event.date.split("-");
      eventDateSplitted[2] = eventDateSplitted[2].split("T")[0];
      endDate = new Date(eventDateSplitted[0], eventDateSplitted[1] - 1, eventDateSplitted[2], lastEndTime.getHours(), lastEndTime.getMinutes(), 0, 0);
      now = new Date();

      if (now >= endDate) {
        return true;
      } else {
        return false;
      }
    };

    // function to get an alert with 3 possible actions to choose
    $scope.showAlert = function () {
      $translate('Send Email').then(function (send) {
        $translate('Download').then(function (down) {
          $translate('Cancel').then(function (cancel) {
            $ionicPopup.show({
              scope: $scope,
              buttons: [
                {
                  text: send,
                  type: 'button-positive',
                  onTap: function (e) {
                    e.preventDefault();
                    createCSV($scope.event.participants.length - 1, 'email')
                  }
                },
                {
                  text: down,
                  type: 'button-positive',
                  onTap: function (e) {
                    e.preventDefault();
                    createCSV($scope.event.participants.length - 1, 'download')
                  }
                },
                {
                  text: cancel,
                  type: 'button-assertive'
                }
              ]
            });
          })
        })
      })
    }
    $scope.arr = [];
    /*
     Recursive function for creating CSV file with event participants data
     gets integer for iterations and String object action as a parameter
     if action is 'download' new created CSV file is downloaded to the users device
     otherwise it is sent by email to the users email address
     */
    function createCSV(i, action) {
      if (i < 0) {
        $scope.arr = $filter('orderBy')($scope.arr, 'name');
        $translate('Name').then(function (name) {
          $translate('Given name').then(function (gName) {
            csv = name + ',' + gName + ',E-mail,Status\n';
            for (var i = 0; i < $scope.arr.length; i++) {
              var line = '';
              for (var ind in $scope.arr[i]) {
                if (typeof $scope.arr[i][ind] !== 'object') {
                  if (line != '') line += ','
                  line += $scope.arr[i][ind];
                }
              }
              csv += line + '\n';
            }
            $cordovaFile.writeFile(cordova.file.externalRootDirectory, $scope.event.title + "-participants-list.csv", csv, true)
              .then(function (success) {
                console.log("File is created", success)
              }, function (error) {
                console.log("Error by writing a file", error);
              });
            if (action === 'download') {
              $scope.download(cordova.file.externalRootDirectory + $scope.event.title + "-participants-list.csv")
            } else {
              sendEmail(cordova.file.externalRootDirectory + $scope.event.title + "-participants-list.csv")
            }
            $scope.arr = [];
          })
        })
      } else {
        var user = $scope.event.participants[i];
        console.log("User is", user, "i is " + i)
        backendService.getUser(user.name).then(function (res) {
          var obj = res['data']['visibleByRegisteredUsers'];
          obj.email = res['data']['visibleByTheUser'].email;
          obj.status = user.status;
          $scope.arr.push(obj);
          createCSV(i - 1, action);
        })
      }
    }

    //Function for sending file to the users email address
    function sendEmail(file) {
      $ionicPlatform.ready(function () {
        backendService.fetchCurrentUser().then(function (res) {
          $translate('Participants list').then(function (list) {
            $translate('Participants list for the event').then(function (listForEvent) {
              $cordovaEmailComposer.isAvailable().then(function (available) {
                var email = {
                  to: res['data']['visibleByTheUser'].email,
                  attachments: [file],
                  subject: $scope.event.title + ' ' + list,
                  body: listForEvent + ': ' + $scope.event.title,
                  isHtml: true
                };
                $cordovaEmailComposer.open(email).then(null, function () {
                  // email is sent or cancelled
                });
              }, function (notAvailable) {
                $translate('Error!').then(
                  function (res2) {
                    $ionicPopup.alert({
                      title: res2,
                      template: "{{'You dont have an installed mail app on your device' | translate}}"
                    });
                  }
                );
              });
            })
          })
        }, false);
      })
    }

    /*
     function for adding a new agenda in agenda collection
     in the new agenda object, the ID of the event, in which this agenda has been created
     is stored
     */
    $scope.addingAgenda = function (ag) {
      backendService.addingAgenda(ag, $stateParams.eventId);
      $translate('Done!').then(
        function (res2) {
          var alertPopup = $ionicPopup.alert({
            title: res2,
            template: "{{'New Talk Session is added' | translate}}"
          });
          alertPopup.then(function (res) {
            $state.go('app.transition', {
              to: 'app.event',
              data: {eventId: $stateParams.eventId}
            })
          });
        }
      );
    };
    /*
     hide - show form after click on adding agenda 
     */
    $scope.addingAgendaForm = false;
    $scope.showAddingAgenda = function () {
      $scope.addingAgendaForm = $scope.addingAgendaForm ? false : true;
    };
    //retrieve agenda by condition
    backendService.loadAgendaWithParams($stateParams.eventId).then(function (res) {
      $scope.agendaList = res;
      $scope.isFeedbackAllowed = isFeedbackAllowed();
      $scope.areFeedbackResultsVisible = areFeedbackResultsVisible();
    }, function (error) {
      console.log("Error by retrieving the event", error)
    })

    $scope.showRoute = function () {
      if (typeof $scope.event.location === 'undefined' || $scope.event.location === "") {
        $translate('Error!').then(
          function (res) {
            $ionicPopup.alert({
              title: res,
              template: "{{'Address is not defined yet, please try it later' | translate}}"
            });
          }
        );
      } else {
        $scope.download('https://www.google.com/maps/place/' + $scope.event.location);
      }
    }
  })

  /*
   Controller for speaker / agenda page with more detail about the speaker, topic
   can delete talk, edit talk information
   */
  .controller('AgendaCtrl', function ($scope, $state, $stateParams, backendService, $ionicPlatform, $ionicLoading, $ionicPopup, $cordovaInAppBrowser, $translate) {
    $scope.upload = false;
    backendService.getAgendaById($stateParams.agendaId).then(function (res) {
      $scope.agenda = res['data'];
      backendService.getFileDetails(res['data'].fileId).then(function (file) {
        $scope.filename = file['data'].fileName;
        $scope.downloadUrl = backendService.getFileUrl(res['data'].fileId)
      }, function (fileError) {
        console.log("Error by getting file details")
      })
    }, function (error) {
      console.log("Error by retrieving the agenda", error)
    });
    $scope.download = function (url) {
      $ionicPlatform.ready(function () {
        $cordovaInAppBrowser.open(url, '_system')
          .then(function (event) {
            // success
          })
          .catch(function (event) {
            // error
          });
      });
    };
    //go to edit agenda page
    $scope.goToEdit = function (agendaId) {
      $state.go('app.edit-agenda', {agendaId: agendaId});
    };
  })
  /*
   Controller for Updating an  event:
   First get all event information by using getEventById(), then update all event fields by calling
   UpdateEvent() and shows a popup alert about successful updating of an event and redirects to main view.
   call SetStatusTrue to update all Participant in this Event set {updated = true}

   */

  .controller('EditEventCtrl', function ($scope, $state, $stateParams, $ionicPopup, backendService, $translate) {
    backendService.getEventById($stateParams.eventId).then(function (res) {
      $scope.event = res['data']
      var id = $scope.event.id;

      $scope.updateEvent = function (ev) {
        backendService.updateEvent(ev).then(function (re) {
          backendService.SetStatusTrue(id);
          console.log('user status {updated : true}');
          $translate('Done!').then(
            function (res) {
              $ionicPopup.alert({
                title: res,
                template: "{{'Event' | translate}}" + ' "' + ev.title + '" ' + "{{'updated' | translate}}" + "."
              }).then(function (res) {
                $state.go('app.main')
              });
            }
          )
        }, function (error) {
          $translate('Error!').then(
            function (res) {
              $ionicPopup.alert({
                title: res,
                template: "{{ 'Error is occurred, please try again later' | translate }}"
              }).then(function (res) {
                $state.go('app.main')
              });
            }
          )
        })
      }
    })
  })
  /*
   function for editting agenda page
   */
  .controller('EditAgendaCtrl', function ($scope, $state, $stateParams, backendService, $ionicPlatform, $ionicLoading, $ionicPopup, $cordovaInAppBrowser, $translate) {
    backendService.getAgendaById($stateParams.agendaId).then(function (res) {
      $scope.agenda = res['data'];
    })
    /*
     function to update a talk session / agenda
     */
    $scope.updateAgenda = function (ag) {
      backendService.getAgendaById($stateParams.agendaId).then(function (res) {
        $scope.agenda = res['data'];
        if (ag.end !== null) {
          backendService.updateAgenda($stateParams.agendaId, "end", ag.end);
        } else {
          backendService.updateAgenda($stateParams.agendaId, "end", agenda.end);
        }
      })
      backendService.getAgendaById($stateParams.agendaId).then(function (res) {
        $scope.agenda = res['data'];
        if (ag.begin !== null) {
          backendService.updateAgenda($stateParams.agendaId, "begin", ag.begin);
        } else {
          backendService.updateAgenda($stateParams.agendaId, "begin", agenda.begin);
        }
      })
      backendService.updateAgenda($stateParams.agendaId, "speaker", ag.speaker);
      backendService.updateAgenda($stateParams.agendaId, "topic", ag.topic);
      backendService.updateAgenda($stateParams.agendaId, "speakerInformation", ag.speakerInformation);
      backendService.updateAgenda($stateParams.agendaId, "talkSummary", ag.talkSummary);
      $translate('Done!').then(
        function (res) {
          $ionicPopup.alert({
            title: res,
            template: "{{'Talk Session updated.' | translate}}"
          }).then(function (res) {
            $state.go('app.agenda', {agendaId: $stateParams.agendaId})
          });
        }
      );
    }
    /*
     function to delete a talk session
     */
    $scope.deleteAgenda = function (eventId) {
      $translate('Confirmation needed').then(
        function (res3) {
          var confirmPopup = $ionicPopup.confirm({
            title: res3,
            template: "{{'Are you sure you want to delete this talk?' | translate}}"
          });
          confirmPopup.then(function (res) {
            if (res) {
              backendService.getAgendaById($stateParams.agendaId).then(function (res2) {
                backendService.deleteFile(res2['data'].fileId);
              });
              backendService.deleteAgenda($stateParams.agendaId);
              $translate('Done!').then(
                function (res4) {
                  var alertPopup = $ionicPopup.alert({
                    title: res4,
                    template: "{{'This Talk Has Been Deleted.' | translate}}"
                  });
                  alertPopup.then(function (re) {
                    $state.go('app.transition', {
                      to: 'app.event',
                      data: {eventId: eventId}
                    })
                  });

                })
            } else {
            }
          });
        })
    }
    $scope.uploadAgenda = function (agendaId) {
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
      var formDataSpeaker = new FormData();
      formDataSpeaker.append('file', $('input[type=file]')[0].files[0]);
      backendService.uploadFileAgenda(formDataSpeaker, agendaId).then(function (res) {
        // if there was already a speaker file then delete it
        if ($scope.agendaId) {
          backendService.deleteFile(agendaId);
        }
        $ionicLoading.hide();
        $translate('Done!').then(
          function (res2) {
            $ionicPopup.alert({
              title: res2,
              template: "{{'File successfully uploaded' | translate}}"
            }).then(function (res3) {
              res = jQuery.parseJSON(res);
              $state.go('app.transition', {
                to: 'app.agenda',
                data: {agendaId: agendaId}
              })
            });
          }
        );
      }, function (error) {
        $ionicLoading.hide();
        $translate('Error!').then(
          function (res) {
            $ionicPopup.alert({
              title: res,
              template: "{{'Error occurred by uploading a file' | translate}}"
            });
          }
        );
      })
    };
  })
  /*
   Controller for user registration
   First checks if user already logged in, if yes shows alert message and redirects to main view,
   if no calls createAccount service with user form as a parameter
   "default" user means "not registered" user
   */
  .controller('RegisterCtrl', function ($scope, $state, $ionicPopup, backendService, $translate) {
    backendService.fetchCurrentUser().then(function (res) {
      if (res['data']['user'].name == "default") {
        backendService.logout();
      } else {
        $translate('Error!').then(
          function (res2) {
            $ionicPopup.alert({
              title: res2,
              template: "{{'You are already logged in' | translate}}"
            }).then(function (res) {
              $state.go('app.main')
            });
          }
        );
      }
    });
    $scope.createAccount = function (user) {
      backendService.createAccount(user);
      $translate('Done!').then(
        function (res) {
          $ionicPopup.alert({
            title: res,
            template: "{{'Welcome' | translate}}" + ', ' + user.name
          }).then(function (res) {
            $state.go('app.main')
          });
        }
      );
    }
  })

  /* 
   Controller for the Login Page. 
   First logouts the logged in default user, then calls the backend login and shows success/error popup. 
   Goes to Main Page if success, stays on login form but deletes password if error. 
   */
  .controller('LoginCtrl', function ($scope, $state, backendService, $ionicPopup, $translate) {
    backendService.logout();
    $scope.login = function (credentials) {
      backendService.login(credentials.username, credentials.password).then(
        function (res) {
          backendService.getEvents().then(function (res) {
              $scope.event = res['data'];
              var me = credentials.username;
              console.log('current user is :', me);
              var length = res.length;
              console.log('--------------------we have:', length, 'events');
              var x = false;

              for (var i = 0; i < length; i++) {
                var participants = res[i].participants;
                const title = res[i].title;
                const id = res[i].id;
                var l = participants.length;

                console.log('------------------>Event number :', i);
                console.log('---There is', l, 'participants in this event : ', title, '---');
                console.log('---------------------------------------------------------');
                for (var j = 0; j < l; j++) {
                  var name = participants[j].name;
                  var status = participants[j].status;
                  var updated = participants[j].updated;
                  console.log('-participant name   :', name);
                  console.log('-participant status :', status);
                  console.log('-participant updated :', updated);

                  var sta = "joined";
                  var upd = "true";

                  if (updated == upd && name == me && status == sta) {
                    x = true;
                    /* updated the Current user in the Participant list of the Events set {updated = false} */
                    backendService.SetStatusFalse(id);
                    console.log('user status {updated : false}');
                    $translate('Done!').then(
                      function (result) {
                        $ionicPopup.alert({
                          title: result,
                          template: "{{'Event ' | translate}}" + ' "' + title + '" ' + "{{'updated' | translate}}" + "."
                        })
                      }
                    )
                  } else {
                    x = false
                  }
                  console.log(x);
                }
              }
              $translate('Done!').then(
                function (result) {
                  $ionicPopup.alert({
                    title: result,
                    template: "{{'Login successful.' | translate}}"
                  }).then(function (re) {
                    $state.go('app.main');
                  });
                }
              )
            }
          )
        },
        function (err) {
          $translate('Error!').then(
            function (res) {
              $ionicPopup.alert({
                title: res,
                template: "{{'Username and password did not match.' | translate}}"
              });
              credentials.password = "";
            }
          );
        }
      )
    };
  })
  /* 
   Controller for Logout 
   Logouts the user, shows a popup and then goes to main page. 
   */
  .controller('LogoutCtrl', function ($scope, $state, backendService, $ionicPopup, $translate) {
    backendService.logout().then(
      function (res) {
        $translate('Done!').then(
          function (result) {
            $ionicPopup.alert({
              title: result,
              template: "{{'You are logged out' | translate}}"
            }).then(function (res) {
              $state.go('app.start')
            });
          }
        );
      });
  })

  /*
   Controller for MyAccount view
   First checks if user is "not registered" user
   If yes redirects to login view,
   if no gets username, name, given name and email information about logged user
   */
  .controller('MyAccountCtrl', function ($scope, $state, backendService, $ionicPopup, $translate) {
    backendService.fetchCurrentUser().then(function (res) {
      if (res['data']['user'].name == "default") {
        $state.go('app.login')
      } else {
        $scope.user = res['data']['visibleByRegisteredUsers'];
        $scope.user.username = res['data']['user'].name;
        $scope.user.email = res['data']['visibleByTheUser'].email;
      }
    });
    /*
     Function that is called after clicking edit button on MyAccount view
     changes state to edit account view
     */
    $scope.goToEdit = function () {
      $state.go('app.edit-account');
    };
    //delete account function
    $scope.deleteAccount = function (user) {
      var susUser = user.username;
      $translate('Confirmation needed').then(
        function (res) {
          $ionicPopup.confirm({
            title: res,
            template: "{{'Are you sure you want to delete your account?' | translate}}"
          }).then(function (result) {
            if (result) {
              backendService.updateUserProfile({"visibleByRegisteredUsers": {"name": '', "gName": ''}});
              backendService.connect().then(function () {
                backendService.deleteAccount(susUser).then(function () {
                  backendService.logout();
                  $translate('Done!').then(
                    function (res2) {
                      $ionicPopup.alert({
                        title: res2,
                        template: "{{'Account deleted.' | translate}}"
                      }).then(function (res) {
                        $state.go('app.main')
                      });
                    }
                  );
                })
              });
              console.log('You are sure');
            } else {
              console.log('You are not sure');
            }
          });
        });
    }
  })

  /*
   Controller for feedback page.
   Loads agenda for talks specific feedback.
   Then creates the rating objects for every category.
   Last define the save function for storing the results in the backend.
   */
  .controller('FeedbackCtrl', function ($scope, $stateParams, backendService, $translate, $ionicPopup, $ionicHistory) {
    /*
     Function for creating a new crating object
     Used for avoid redundance.
     Gets name of the objecvt which defines where in the $scope.results array the rating has to be pushed.
     Returns a rating object.
     */
    addNewRatingObject = function (title) {
      initialRating = 3;
      $scope.ratingObjects[title] = {
        title: title,
        comment: "",
        iconOnColor: '#387ef5',
        iconOffColor: '#387ef5',
        rating: initialRating,
        callback: function (rating) {
          $scope.ratingObjects[title].rating = rating;
        }
      };
    };
    $scope.ratingObjects = {};
    $scope.generalCategories = ["Whole Event", "Foods and Drinks", "Location"];
    for (nr in $scope.generalCategories) {
      addNewRatingObject($scope.generalCategories[nr])
    }
    backendService.loadAgendaWithParams($stateParams.eventId).then(
      function (res) {
        $scope.talks = res;
        for (talkNr in $scope.talks) {
          addNewRatingObject($scope.talks[talkNr].topic)
        }
      }, function (err) {
        console.log(err)
      });
    $scope.saveFeedback = function () {
      for (talkNr in $scope.talks) {
        ratingObject = $scope.ratingObjects[$scope.talks[talkNr].topic];
        backendService.addFeedbackToTalk($scope.talks[talkNr].id, ratingObject.rating, ratingObject.comment)
      }
      ratingArray = [];
      for (nr in $scope.generalCategories) {
        ratingObject = $scope.ratingObjects[$scope.generalCategories[nr]];
        ratingArray.push({
          category: ratingObject.title,
          rating: ratingObject.rating,
          comment: ratingObject.comment,
        });
      }
      backendService.addFeedbackToEvent($stateParams.eventId, ratingArray).then(
        function (res) {
          $translate('Done!').then(
            function (res2) {
              $ionicPopup.alert({
                title: res2,
                template: "{{'Feedback submitted. Thank you!' | translate}}"
              }).then(function (res3) {
                $ionicHistory.goBack();
              });
            }
          );
        }
      )
    }
  })

  /*

   */
  .controller('FeedbackResultsCtrl', function ($scope, $stateParams, backendService, $translate, $ionicPopup, $ionicHistory) {
    /*
     Function calculating the average of an array of values.
     */
    average = function (array) {
      if (array.length == 0) {
        return 0;
      }
      total = 0;
      angular.forEach(array, function (value) {
        total += value;
      });
      return total / array.length;
    };

    /*
     Function for creating a new crating object
     Used for avoid redundance.
     Gets name of the objecvt which defines where in the $scope.results array the rating has to be pushed.
     Returns a rating object.
     */
    addNewRatingObject = function (title) {
      $scope.ratingObjects[title] = {
        iconOnColor: '#387ef5',
        iconOffColor: '#387ef5',
        readOnly: true,
        title: title,
        ratings: [],
        comments: [],
        callback: function (rating) {
        }
      };
    };

    $scope.ratingObjects = {};

    backendService.getEventById($stateParams.eventId).then(
      function (res) {
        event = res['data'];

        $scope.generalCategories = [];
        angular.forEach(event.feedback, function (rating) {
          angular.forEach(rating, function (categoryRating) {
            if ($scope.generalCategories.indexOf(categoryRating.category) == -1) {
              $scope.generalCategories.push(categoryRating.category);
              addNewRatingObject(categoryRating.category);
            }
            $scope.ratingObjects[categoryRating.category].ratings.push(categoryRating.rating);
            if (categoryRating.comment.length > 0) {
              $scope.ratingObjects[categoryRating.category].comments.push(categoryRating.comment);
            }
          })
        });

        angular.forEach($scope.ratingObjects, function (ratingObject) {
          ratingObject.ratingAvg = Math.round(average(ratingObject.ratings) * 100) / 100;
          ratingObject.rating = Math.round(ratingObject.ratingAvg)
        });

        backendService.loadAgendaWithParams($stateParams.eventId).then(
          function (res) {
            $scope.talks = res;
            angular.forEach($scope.talks, function (talk) {
              addNewRatingObject(talk.topic);

              angular.forEach(talk.feedback, function (feedbackEntry) {
                $scope.ratingObjects[talk.topic].ratings.push(feedbackEntry.rating);
                if (feedbackEntry.comment.length > 0) {
                  $scope.ratingObjects[talk.topic].comments.push(feedbackEntry.comment);
                }
              });
              $scope.ratingObjects[talk.topic].ratingAvg = Math.round(average($scope.ratingObjects[talk.topic].ratings) * 100) / 100;
              $scope.ratingObjects[talk.topic].rating = Math.round($scope.ratingObjects[talk.topic].ratingAvg);
            });
          }, function (err) {
            console.log(err)
          }
        )

      });
  })

  /*
   Controller for editing user information
   First gets user current personal information stored on backend
   After clicking submit button in edit-account view calls update account function with user form as a parameter
   Then redirects to MyAccount view
   */
  .controller('EditAccountCtrl', function ($scope, $state, backendService, $ionicPopup, $translate) {
    backendService.fetchCurrentUser().then(function (res) {
      $scope.user = res['data']['visibleByRegisteredUsers'];
      $scope.user.username = res['data']['user'].name;
      $scope.user.email = res['data']['visibleByTheUser'].email;
    });
    $scope.updateAccount = function (user) {
      backendService.updateUserProfile({"visibleByTheUser": {"email": user.email}});
      backendService.updateUserProfile({"visibleByRegisteredUsers": {"name": user.name, "gName": user.gName}});
      $translate('Done!').then(
        function (res) {
          $ionicPopup.alert({
            title: res,
            template: "{{'Account updated.' | translate}}"
          }).then(function (res) {
            $state.go('app.my-account')
          });
        }
      );
    }
  })
  /*
   Controller for choosing a question from the list of questions
   contains functions to get a list of questions in one event, to choose a question
   as well as to add a new question for the event
   */
  .controller('ChooseQuestionCtrl', function ($scope, $state, $ionicPopup, backendService, $filter, $stateParams, $ionicLoading, $translate) {
    $scope.available = true;
    $scope.add = false;
    $scope.questions = [];
    backendService.getEventById($stateParams.eventId).then(function (res) {
      $scope.questions = res['data'].questions;
      if ($scope.questions.length == 0) $scope.available = false;
    })
    $scope.choose = function (qId) {
      chooseQuestion(qId, function (deselected) {
        if (deselected) {
          $translate('is deselected').then(function (de) {
            $ionicLoading.show({
              template: '"' + questionToChoose[0].question + '" ' + de,
              noBackdrop: true,
              duration: 1150
            })
          })
        } else {
          $translate('is chosen as a current question').then(function (de) {
            $ionicLoading.show({
              template: '"' + questionToChoose[0].question + '" ' + de,
              noBackdrop: true,
              duration: 1150
            })
          })
        }
        backendService.updateEvent($stateParams.eventId, "questions", $scope.questions)
      })
    }
    function chooseQuestion(qId, callback) {
      deselected = false;
      currentQuestion = $filter('filter')($scope.questions, {current: true})
      questionToChoose = $filter('filter')($scope.questions, {id: qId})
      if (questionToChoose[0] == currentQuestion[0]) deselected = true;
      questionToChoose[0].current = true;
      if (currentQuestion.length > 0)
        currentQuestion[0].current = false;
      callback(deselected);
    }

    /*
     function to add question to array questions in event object
     */
    $scope.addingQuestion = function (que) {
      backendService.addingQuestion(que, $stateParams.eventId);
      $translate('Done!').then(
        function (res2) {
          var alertPopup = $ionicPopup.alert({
            title: res2,
            template: "{{'New Question is added' | translate}}"
          });
          alertPopup.then(function (res) {
            $state.go('app.transition', {
              to: 'app.choose-question',
              data: {eventId: $stateParams.eventId}
            })
          });
        }
      );
    };
  })
  /*
   Controller for live voting
   Gets active question out of event.
   On submit, the field is incremented and updated. Then, every second the event is loaded again for displaying changes.
   On leaving the event the interval call is cancelled.
   */
  .controller('LiveVotingCtrl', function ($scope, backendService, $stateParams, $interval, $filter) {
    $scope.beforeSubmit = false;
    $scope.afterSubmit = false;
    $scope.firstLoadComplete = false;

    interval = $interval(function () {
      backendService.getEventById($stateParams.eventId).then(
        function (res) {
          thisEvent = res['data'];
          currentQuestions = $filter('filter')(thisEvent.questions, {current: true})
          if (currentQuestions.length == 0) {
            $scope.questionObject = {};
            $scope.beforeSubmit = false;
            $scope.afterSubmit = false;
          } else {
            $scope.questionObject = currentQuestions[0];
            $scope.beforeSubmit = !$scope.afterSubmit;
          }
          $scope.firstLoadComplete = true;
        });
    }, 1000);

    $scope.$on('$ionicView.beforeLeave', function () {
      $interval.cancel(interval);
    });

    $scope.submit = function (result) {
      $scope.questionObject[result] += 1;
      backendService.updateEvent(thisEvent.id, "questions", thisEvent.questions).then(
        function (res) {
          $scope.beforeSubmit = false;
          $scope.afterSubmit = true;
        })
    }
  });
