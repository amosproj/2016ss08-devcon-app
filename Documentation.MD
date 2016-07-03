# Content
1. Localization
2. Push Notifications
3. Build iOS installation

# 1. Localization

## 1.1 ng-translate

We are using the library ng-translate for the support of different languages in our app. This file explains how to use it.

### General
We develop our app in english, so you type everything in english. Then you use the function translate for telling the system to translate it.
In the locales-files the translations are defined.

### Usage of translate

Everywhere you use a text that should be translated automatically, you have to use the function translate. There are different ways to do so.

##### Interpolation (recommanded)
You use translate in interpolation. This works in HTML as well as in Javascript files:
```html
<ion-view view-title="{{ 'Overview' | translate }}">
```
```javascript
textVariable = "{{'You are already logged in' | translate}}"
```
##### Service
In the ionicPopus, the title cannot be translated by interpolation. Here you have to use the function translate and handle the returned promise:
```javascript
$translate('Done!').then(
    function (res) {
      $ionicPopup.alert({
        title: res,
        template: "{{'This worked.' | translate}}"
      }).then(function (res) {
        $state.go('app.main')
      });
    }
  );
```
It is not possible in the service to use the english value as default without translation-pair in the english locale file. So every String that has to be
translated by the service has to be in every locale file. Because of this, and because of a consistent UI, one of the three following titles should be used
for pop-ups, if possible:
* "Done!"
* "Error!"
* "Confirmation needed"


**Attention:** Make sure you rename the used 'res'-attribute of an promise outside the translate promise to use it inside:
```javascript
backendService.fetchCurrentUser().then(function (res) {
    $translate('Error!').then(
      function (res2) {
        $ionicPopup.alert({
          title: res2,
          template: "{{'Logged in as' | translate}}" + res['data']['user'].name
        }).then(function (res) {
          $state.go('app.main')
        });
      }
    );
  }
});
```

### Locale file
In the directory www/locales the different language files are stored.

Every file consists of a single json array defining the word pairs.

Add a new translation by adding a new entry in a new line (make sure to add a colon).

## 1.2 angular-i18n

For formatting time and date right for the selected language, the following formats have to be used:

| format        | example German           | example English        |
| ------------- |--------------------------| -----------------------|
| shortTime     | 21:37                    | 9:37 PM                |
| shortDate     | 07.07.16                 | 7/7/16                 |
| fullDate      | Donnerstag, 7. Juli 2016 | Thursday, July 7, 2016 |
See the full list [here](https://docs.angularjs.org/api/ng/filter/date).

Use it like that:
```javascript
$filter('date')($scope.event.date, shortDate);
```
or like
```html
<ion-item> {{(event.date | date: "shortDate")}} </ion-item>
```
# 2. Push Notifications

For push notifications, the BaasBox-backend is used. It connects to the [Google Cloud Messaging Service](https://developers.google.com/cloud-messaging/) (GCM). In the app, the [Phonegap Push Plugin](https://github.com/phonegap/phonegap-plugin-push) is used.

For setting up, the project id of GCM has to be entered in the BaasBox console.

The user's device has to be registered to Baasbox to enable push notifications. Therefore the device id token is needen, which is received by the Phonegap Push Plugin while starting up the app and is stored in the local storage (app.js):
```javascript
push.on('registration', function (data) {
          var oldRegistrationId = localStorage.getItem('registrationId');
          if (oldRegistrationId !== data.registrationId) {
            // Save new registration ID
            localStorage.setItem('registrationId', data.registrationId);
          }
        });
```
When enabling or disabling push notifications for a user, the service functions are reading this stored content and call the BaasBox-API for that.

For sending push notifications to a group of users, this backend service function can be used:
```javascript
sendPushNotificationToUsers(message, users)
```
where `message` is a String and `users` is a list of usernames.

# 3. Build iOS installation

##### Requirements:

* Software: [Xcode](https://developer.apple.com/xcode/)

##### Steps:

Step 1. Add iOS platform:
```bash
$ ionic platform add ios
```

Step 2. Build iOS:
```bash
$ ionic build ios
```

Step 3. Install in iPhone:
* Plugin iPhone to computer with a cable
* Open ../platforms/ios/MyConference.xcodeproj with Xcode
* Choose device as plugged in device
* Click Build button and wait installation process finish

Step 4. Configure iPhone to run application:
* Settings
* General
* Device Management
* Tap on the Developer account
* Trust

Now this app can be run on iPhone