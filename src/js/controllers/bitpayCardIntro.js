'use strict';
angular.module('copayApp.controllers').controller('bitpayCardIntroController', function($scope, $log, $state, $ionicHistory, storageService, externalLinkService, bitpayCardService, gettextCatalog, popupService, appIdentityService, bitpayService) {

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (data.stateParams && data.stateParams.secret) {
      var pairData = {
        secret: data.stateParams.secret,
        email: data.stateParams.email,
        otp: data.stateParams.otp
      };

      var pairingReason = gettextCatalog.getString('BitPay Visa card');

      bitpayService.pair(pairData, pairingReason, function(err, paired, apiContext) {

        if (err) {
          popupService.showAlert(gettextCatalog.getString('Error pairing Bitpay Account'), err);
          return;
        }
        if (paired) {
          bitpayCardService.fetchBitpayDebitCards(apiContext, function(err, data) {

            if (err) {
              popupService.showAlert(gettextCatalog.getString('Error fetching Debit Cards'), err);
              return;
            }
            // Set flag for nextStep
            storageService.setNextStep('BitpayCard', 'true', function(err) {});
            // Save data
            bitpayCardService.setBitpayDebitCards(data, function(err) {
              if (err) return;
              $ionicHistory.nextViewOptions({
                disableAnimate: true
              });
              $state.go('tabs.home').then(function() {
                if (data.cards[0]) {
                  $state.transitionTo('tabs.bitpayCard', {
                    id: data.cards[0].id
                  });
                }
              });
            });
          });
        }
      });
    } else {
      appIdentityService.getIdentity(bitpayService.getEnvironment(), function(err, appIdentity) {
        if (err) popupService.showAlert(null, err);
        else $log.info('App identity: OK');
      });
    }
  });

  $scope.bitPayCardInfo = function() {
    var url = 'https://bitpay.com/visa/faq';
    externalLinkService.open(url);
  };

  $scope.orderBitPayCard = function() {
    var url = 'https://bitpay.com/visa/get-started';
    externalLinkService.open(url);
  };

  $scope.connectBitPayCard = function() {
    var url = 'https://bitpay.com/visa/dashboard/add-to-bitpay-wallet-confirm';
    externalLinkService.open(url);
  };
});
