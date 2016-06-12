# Content
1. Instruction for ng-translate

# Instruction for ng-translate

We are using the library ng-translate for the support of different languages in our app. This file explains how to use it.

## General
We develop our app in english, so you type everything in english. Then you use the function translate for telling the system to translate it.
In the locales-files the translations are defined.

## Usage of translate

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

## Locale file
In the directory www/locales the different language files are stored.

Every file consists of a single json array defining the word pairs.

Add a new translation by adding a new entry in a new line (make sure to add a colon).
