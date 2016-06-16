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
      $translate('Connection error').then(
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
      $translate('Reset Password').then(
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

    //Attribute for determing if feedback is allowed (which is the case while the event and 48h afterwards)
    // Is set later after loading the agenda
    $scope.isFeedbackAllowed = false;

    backendService.getEventById($stateParams.eventId).then(function (res) {
      $scope.event = res['data'];
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
        $translate('Error').then(
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
     Function that determines if now is between the first agenda talk and not more than 48h after the last.
     Finds the first beginnig and the last ending time of the talks first.
     */
    isFeedbackAllowed = function () {
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

      eventDateSplitted = $scope.event.date.split("-");
      beginDate = new Date(eventDateSplitted[0], eventDateSplitted[1] - 1, eventDateSplitted[2], firstBeginTime.getHours(), firstBeginTime.getMinutes(), 0, 0)
      endDatePlus48h = new Date(eventDateSplitted[0], eventDateSplitted[1] - 1, eventDateSplitted[2], lastEndTime.getHours() + 48, lastEndTime.getMinutes(), 0, 0)

      now = new Date();
      if (now >= beginDate && now <= endDatePlus48h) {
        return true;
      } else {
        return false;
      }
    }

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
                {text: cancel}
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
            $state.reload()
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
    }, function (error) {
      console.log("Error by retrieving the event", error)
    })

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
   First get all event information by using getEventById(), then save all update and shows a popup alert
   about successful updating of an event and redirects to main view.

   */

  .controller('EditEventCtrl', function ($scope, $state, $stateParams, $ionicPopup, backendService, $translate, $filter) {
    backendService.getEventById($stateParams.eventId).then(function (res) {
      $scope.event = res['data']
      var id = $scope.event.id;

      $scope.updateEvent = function (ev) {
        ev.stat = [];
        creator = {};
        creator.updated = "true";
        ev.stat.push(creator);
        console.log(creator);
        console.log(ev.stat);
        backendService.updateEvent($stateParams.eventId, "stat", ev.stat);
        backendService.updateEvent($stateParams.eventId, "title", ev.title);
        backendService.updateEvent($stateParams.eventId, "location", ev.location);
        backendService.updateEvent($stateParams.eventId, "date", ev.date);
        backendService.updateEvent($stateParams.eventId, "descr", ev.descr);
        backendService.SetStatusTrue(id).then(
          function (res) {
            console.log('i do it  yeahhhhhhhhhh')
          })
        $translate('Done!').then(
          function (res) {
            $ionicPopup.alert({
              title: res,
              template: "{{'Event' | translate}}" + ' "' + ev.title + '" ' + "{{'updated' | translate}}" + "."
            }).then(function (res) {
              $state.go('app.start')
            });
          }
        );
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
      backendService.updateAgenda($stateParams.agendaId, "begin", ag.begin);
      backendService.updateAgenda($stateParams.agendaId, "end", ag.end);
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
    $scope.deleteAgenda = function (xId) {
      $translate('Delete A Talk').then(
        function (res3) {
          var confirmPopup = $ionicPopup.confirm({
            title: res3,
            template: "{{'Are you sure you want to delete this talk?' | translate}}"
          });
          confirmPopup.then(function (res) {
            if (res) {
              backendService.getAgendaById($stateParams.agendaId).then(function (res2) {
                backendService.deleteFile(res2['data'].fileId);
              })
              backendService.deleteAgenda($stateParams.agendaId);
              $translate('Done!').then(
                function (res4) {
                  var alertPopup = $ionicPopup.alert({
                    title: res4,
                    template: "{{'This Talk Has Been Deleted.' | translate}}"
                  });
                  alertPopup.then(function (re) {
                    $state.go('app.event', {eventId: xId}, {reload: true});
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
        $translate('Error').then(
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
                var title = res[i].title;
                var id = res[i].id;
                var stat = res[i].stat;
                var updated = stat[0].updated;
                var l = participants.length;

                console.log('------------------>Event number :', i);
                console.log('---There is', l, 'participants in this event : ', title, '---');
                console.log('-Event update status:', updated);

                for (var j = 0; j < l; j++) {
                  var name = participants[j].name;
                  var status = participants[j].status;
                  var updpart = participants[j].updated;
                  console.log('-participant name   :', name);
                  console.log('-participant status :', status);
                  console.log('-participant updated :', updpart);

                  var sta = "joined";
                  var upd = "true";
                  //do { } while (name == me && updated == upd && status == sta);

                  if (updated == upd && name == me && status == sta && updpart == upd) {
                    x = true;
                    console.log('----------------->Done! : yes');
                    var alertPopup = $ionicPopup.alert({
                      title: 'Attention!',
                      template: "{{'Event ' | translate}}" + ' "' + title + '" ' + "{{'is updated' | translate}}" + "."
                    });
                    backendService.SetStatusFalse(id).then(
                      function (res) {
                        console.log('i do it  yeahhhhhhhhhh')
                      })

                  } else {
                    console.log('----------------->Else : false');
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
      $translate('Delete Account').then(
        function (res) {
          $ionicPopup.confirm({
            title: res,
            template: "{{'Are you sure you want to delete your account?' | translate}}"
          }).then(function (result) {
            if (result) {
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
  });
