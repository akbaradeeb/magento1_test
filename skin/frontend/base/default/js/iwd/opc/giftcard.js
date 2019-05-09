;
function GiftCard() {
    OnePage.apply(this);
    this.sectionContainer = this.sectionContainer + ' #iwd_opc_giftcard';
    this.name = 'gift_card';
}

$ji(document).ready(function () {
    GiftCard.prototype = Object.create(OnePage.prototype);
    GiftCard.prototype.constructor = GiftCard;

    GiftCard.prototype.init = function () {
        if (this.config.isIwdGiftCardEnabled) {
            this.applyUrl = this.config.giftCardApplyUrl;
            this.removeUrl = this.config.giftCardRemoveUrl;
            this.initGiftCardButtons();
        }
    };

    GiftCard.prototype.initGiftCardButtons = function () {
        var _this = this;
        $ji(document).on('click', _this.sectionContainer + ' #iwd_opc_add_giftcard_button, ' + _this.sectionContainer + ' .iwd_opc_cancel_giftcard_button', function () {
            $ji(_this.sectionContainer).find('#iwd_opc_giftcard_form').toggleClass('selected');
        });

        $ji(document).on('click', _this.sectionContainer + ' .iwd_opc_apply_giftcard_button', function () {
            var value = $ji(this).closest('.iwd_opc_giftcard_one_card').find('.iwd_opc_giftcard_input').val();
            if (value) {
                _this.apply(value);
            }
        });

        $ji(document).on('click', _this.sectionContainer + ' .iwd_opc_remove_giftcard_button', function () {
            var value = $ji(this).closest('.iwd_opc_giftcard_one_card').find('.iwd_opc_giftcard_input').val();
            _this.remove(value);
        });

        $ji(document).on('keydown', _this.sectionContainer + ' .iwd_opc_giftcard_input', function (e) {
            if (e.keyCode === 13) {
                if ($ji(this).val()) {
                    _this.apply($ji(this).val());
                } else {
                    _this.remove($ji(this).val());
                }
            }
        });
    };

    GiftCard.prototype.apply = function (value) {
        var data = [];
        data.push({
            'name': 'gift_code',
            'value': value
        });
        this.showLoader(Singleton.get(Payment).sectionContainer);
        this.ajaxCall(this.applyUrl, data);
    };

    GiftCard.prototype.remove = function (value) {
        var data = [];
        data.push({
            'name': 'gift_code',
            'value': value
        });
        this.showLoader(Singleton.get(Payment).sectionContainer);
        this.ajaxCall(this.removeUrl, data);
    };

    GiftCard.prototype.ajaxComplete = function (result, onComplete) {
        this.hideLoader(Singleton.get(Payment).sectionContainer);
        OnePage.prototype.ajaxComplete.apply(this, arguments);
    };

    GiftCard.prototype.applyResponse = function (gift_card) {
        $ji(this.sectionContainer).html(gift_card);
    };

    GiftCard.prototype.getForm = function () {
        return false;
    };

    Singleton.get(GiftCard).init();
});