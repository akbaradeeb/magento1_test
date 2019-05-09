;

function Payment() {
    OnePage.apply(this);
    this.sectionContainer = this.sectionContainer + ' #iwd_opc_payment';
    this.name = 'payment';
}

Payment.prototype = Object.create(OnePage.prototype);
Payment.prototype.constructor = Payment;

Payment.prototype.init = function () {

};


function PaymentMethod() {
    Payment.apply(this);
    this.sectionContainer = this.sectionContainer + ' #iwd_opc_payment_method';
    this.name = 'payment_method';
    this.ccTypes = {
        'SO': [new RegExp('^(6334[5-9]([0-9]{11}|[0-9]{13,14}))|(6767([0-9]{12}|[0-9]{14,15}))$'), new RegExp('^([0-9]{3}|[0-9]{4})?$'), 23],
        'VI': [new RegExp('^4[0-9]{12}([0-9]{3})?$'), new RegExp('^[0-9]{3}$'), 19],
        'MC': [new RegExp('^(5[1-5][0-9]{14}|2[2-7][0-9]{14})$'), new RegExp('^[0-9]{3}$'), 19],
        'AE': [new RegExp('^3[47][0-9]{13}$'), new RegExp('^[0-9]{4}$'), 18],
        'DI': [new RegExp('^6011[0-9]{12}$'), new RegExp('^[0-9]{3}$'), 23],
        'JCB': [new RegExp('^(3[0-9]{15}|(2131|1800)[0-9]{11})$'), new RegExp('^[0-9]{3,4}$'), 19],
        'DICL': [new RegExp('^(30[0-5][0-9]{13}|3095[0-9]{12}|35(2[8-9][0-9]{12}|[3-8][0-9]{13})|36[0-9]{12}|3[8-9][0-9]{14}|6011(0[0-9]{11}|[2-4][0-9]{11}|74[0-9]{10}|7[7-9][0-9]{10}|8[6-9][0-9]{10}|9[0-9]{11})|62(2(12[6-9][0-9]{10}|1[3-9][0-9]{11}|[2-8][0-9]{12}|9[0-1][0-9]{11}|92[0-5][0-9]{10})|[4-6][0-9]{13}|8[2-8][0-9]{12})|6(4[4-9][0-9]{13}|5[0-9]{14}))$'), new RegExp('^[0-9]{3}$'), 23],
        'SM': [new RegExp('(^(5[0678])[0-9]{11,18}$)|(^(6[^05])[0-9]{11,18}$)|(^(601)[^1][0-9]{9,16}$)|(^(6011)[0-9]{9,11}$)|(^(6011)[0-9]{13,16}$)|(^(65)[0-9]{11,13}$)|(^(65)[0-9]{15,18}$)|(^(49030)[2-9]([0-9]{10}$|[0-9]{12,13}$))|(^(49033)[5-9]([0-9]{10}$|[0-9]{12,13}$))|(^(49110)[1-2]([0-9]{10}$|[0-9]{12,13}$))|(^(49117)[4-9]([0-9]{10}$|[0-9]{12,13}$))|(^(49118)[0-2]([0-9]{10}$|[0-9]{12,13}$))|(^(4936)([0-9]{12}$|[0-9]{14,15}$))'), new RegExp('^([0-9]{3}|[0-9]{4})?$'), 23],
        'OT': [false, new RegExp('^([0-9]{3}|[0-9]{4})?$'), 23]
    };
}

PaymentMethod.prototype = Object.create(Payment.prototype);
PaymentMethod.prototype.constructor = PaymentMethod;

PaymentMethod.prototype.init = function () {
    this.saveUrl = this.config.savePaymentUrl;
    this.savePaymentMethodCodeUrl = this.config.savePaymentMethodCodeUrl;
    this.initChangeFields();
    this.initChangeCcFields();
    this.disableHiddenFields();
    this.initPaymentMethods();
    this.initFixedTooltipHover();
};

PaymentMethod.prototype.initFixedTooltipHover = function () {
    $ji(document).on('mouseover', this.sectionContainer + ' .iwd_opc_payment_tooltip', function () {
        var fixedContent = $ji(this).find('.iwd_opc_tooltip_content_fixed');
        if (fixedContent.length) {
            fixedContent.offset({
                left: $ji(this).offset().left - fixedContent.width() - 50,
                top: $ji(this).offset().top - (fixedContent.height() / 2) - 4
            });
        }
    });
};

PaymentMethod.prototype.decorateCcTypes = function () {
    var _this = this;
    $ji(_this.sectionContainer).find('.iwd_opc_payment_method_form .iwd_opc_cc_types').each(function () {
        var code = $ji(this).closest('.iwd_opc_payment_method_form').attr('data-payment-method-code');
        $ji(this).show().clone()
            .prependTo(
                $ji(_this.sectionContainer)
                    .find('.iwd_opc_select_container[data-element-name="payment[method]"] .iwd_opc_select_option[data-value="' + code + '"]')
            );
        $ji(this).remove();
    });
};

PaymentMethod.prototype.initChangeFields = function () {
    OnePage.prototype.initChangeFields.apply(this, arguments);
    var _this = this;
    $ji(document).off('blur', this.sectionContainer + ' .iwd_opc_universal_wrapper .iwd_opc_select:not(:disabled), ' +
        this.sectionContainer + ' .iwd_opc_universal_wrapper .iwd_opc_input:not(:disabled), ' +
        this.sectionContainer + ' .iwd_opc_universal_wrapper .iwd_opc_checkbox:not(:disabled), ' +
        this.sectionContainer + ' .iwd_opc_universal_wrapper .iwd_opc_radio:not(:disabled), ' +
        this.sectionContainer + ' .iwd_opc_universal_wrapper .iwd_opc_textarea:not(:disabled)');
    $ji(document).on('blur', this.sectionContainer + ' .iwd_opc_universal_wrapper .iwd_opc_select:not(:disabled), ' +
        this.sectionContainer + ' .iwd_opc_universal_wrapper .iwd_opc_input:not(:disabled), ' +
        this.sectionContainer + ' .iwd_opc_universal_wrapper .iwd_opc_checkbox:not(:disabled), ' +
        this.sectionContainer + ' .iwd_opc_universal_wrapper .iwd_opc_radio:not(:disabled), ' +
        this.sectionContainer + ' .iwd_opc_universal_wrapper .iwd_opc_textarea:not(:disabled)', function () {
        clearTimeout(_this.blurTimeout);
        var element = $ji(this);
        _this.blurTimeout = setTimeout(function () {
            if (_this.areFieldsChanged && !element.closest('.iwd_opc_form').first().hasClass('focused')) {
                _this.validate();
            }
        }, _this.blurDelay);
    });
};

PaymentMethod.prototype.initPaymentMethods = function () {
    Singleton.get(PaymentMethodPayPalExpress).init();
    Singleton.get(PaymentMethodAuthorizeNet).init();
    Singleton.get(PaymentMethodAuthorizeNetDirectPost).init();
    Singleton.get(PaymentMethodBrainTreePayments).init();
    Singleton.get(PaymentMethodOpgSquare).init();
};

PaymentMethod.prototype.getForm = function () {
    return iwdOpcPaymentMethodForm;
};

PaymentMethod.prototype.applyResponse = function (methods) {
    var _this = this;
    var tmpData = [];
    var paymentForm = $ji(_this.sectionContainer)
        .find('.iwd_opc_payment_method_form[data-payment-method-code="' + _this.getPaymentMethodCode() + '"]:visible');
    if (paymentForm.length) {
        paymentForm.find('.iwd_opc_field').each(function () {
            if ($ji(this).val()) {
                tmpData.push({
                    'name': $ji(this).attr('name') || $ji(this).attr('data-name'),
                    'value': $ji(this).val()
                });
            }
        });
    }

    $ji.when($ji(Singleton.get(Payment).sectionContainer + ' #iwd_opc_payment_method_additional').replaceWith(methods)).then(function () {
        _this.disableHiddenFields();
        _this.decorateFields(_this.sectionContainer);
        $ji.when(_this.decorateSelects(_this.sectionContainer)).then(function () {
            _this.decorateCcTypes();
        });

        paymentForm = $ji(_this.sectionContainer)
            .find('.iwd_opc_payment_method_form[data-payment-method-code="' + _this.getPaymentMethodCode() + '"]:visible');
        if (tmpData.length && paymentForm.length) {
            paymentForm.find('.iwd_opc_field:not([type="radio"]):not([type="checkbox"])').each(function () {
                var element = $ji(this);
                tmpData.forEach(function (obj) {
                    if (element.attr('name') == obj.name || element.attr('data-name') == obj.name) {
                        element.val(obj.value).trigger('input').trigger('change');
                    }
                });
            });
        }

        Singleton.get(PaymentMethodOpgSquare).init();
        if ($ji(Singleton.get(Payment).sectionContainer)
                .closest('.iwd_opc_column_content').attr('data-was-updated') == 1) {
            _this.validate();
        } else {
            _this.validate(false);
        }
    });
};

PaymentMethod.prototype.changeField = function (element) {
    var _this = this;
    if (element.attr('id') === 'iwd_opc_payment_method_select') {
        _this.selectPaymentMethod();
    } else {
        clearTimeout(_this.validateTimeout);
        clearTimeout(_this.blurTimeout);
        _this.areFieldsChanged = true;
        _this.validateTimeout = setTimeout(function () {
            _this.validate();
        }, _this.saveDelay);
    }
};

PaymentMethod.prototype.selectPaymentMethod = function () {
    clearTimeout(this.validateTimeout);
    clearTimeout(this.blurTimeout);
    this.disableHiddenFields();
    if (this.columnHasVisibleErrors($ji(this.sectionContainer).closest('.iwd_opc_column_content'))) {
        this.validate();
    } else {
        this.validate(false);
    }

    this.savePaymentMethod();
};

PaymentMethod.prototype.getPaymentMethodCode = function () {
    return $ji(this.sectionContainer + ' #iwd_opc_payment_method_select').val();
};

PaymentMethod.prototype.savePaymentMethod = function () {
    var data = [];
    data.push({
        'name': 'payment_method_code',
        'value': this.getPaymentMethodCode()
    });

    clearTimeout(this.validateTimeout);
    clearTimeout(this.blurTimeout);
    this.showLoader(Singleton.get(Payment).sectionContainer);
    this.ajaxCall(this.savePaymentMethodCodeUrl, data, this.onSavePaymentMethodSuccess);
};

PaymentMethod.prototype.onSavePaymentMethodSuccess = function (result) {
    if (typeof (result.status) !== 'undefined' && result.status) {
        this.hideLoader(Singleton.get(Payment).sectionContainer);
        OnePage.prototype.parseSuccessResult.apply(this, arguments)
    } else {
        if (typeof(result.message) !== 'undefined' && result.message) {
            this.showAjaxError(result.message);
        }
    }

    return false;
};

PaymentMethod.prototype.ajaxComplete = function (result, onComplete) {
    this.hideLoader(Singleton.get(Payment).sectionContainer);
    this.hideLoader(Singleton.get(OnePage).sectionContainer);
    OnePage.prototype.ajaxComplete.apply(this, arguments);
};

PaymentMethod.prototype.saveSection = function () {
    var _this = this;
    var _thisArguments = arguments;
    _this.showLoader(Singleton.get(OnePage).sectionContainer);
    switch (_this.getPaymentMethodCode()) {
        case Singleton.get(PaymentMethodStripe).code:
            Singleton.get(PaymentMethodStripe).originalThis = _this;
            Singleton.get(PaymentMethodStripe).originalArguments = _thisArguments;
            Singleton.get(PaymentMethodStripe).savePayment();
            break;
        case Singleton.get(PaymentMethodOpgSquare).code:
            Singleton.get(PaymentMethodOpgSquare).originalThis = _this;
            Singleton.get(PaymentMethodOpgSquare).originalArguments = _thisArguments;
            Singleton.get(PaymentMethodOpgSquare).savePayment();
            break;
        default:
            OnePage.prototype.saveSection.apply(_this, _thisArguments);
    }
};

PaymentMethod.prototype.parseSuccessResult = function (result) {
    switch (this.getPaymentMethodCode()) {
        case Singleton.get(PaymentMethodBrainTreePayments).codeCc:
            if (OnePage.prototype.parseSuccessResult.apply(this, arguments)) {
                Singleton.get(PaymentMethodBrainTreePayments).saveOrder()
            }

            break;
        default:
            if (OnePage.prototype.parseSuccessResult.apply(this, arguments)) {
                if (!result.centinel_frame) {
                    Singleton.get(OnePage).saveOrder();
                }
            }
    }
};

PaymentMethod.prototype.onErrorResult = function (result) {
    Singleton.get(OnePage).hideLoader(Singleton.get(OnePage).sectionContainer);
    Singleton.get(PaymentMethodOpgSquare).saveOrderInProgress = false;
    if (typeof(result.message) !== 'undefined' && result.message) {
        this.showPopup(result.message);
    }

    return false;
};

PaymentMethod.prototype.getSaveData = function () {
    var data = $ji(this.getForm().form).serializeArray();
    data.push({
        'name': 'subscribe',
        'value': $ji(Singleton.get(OnePage).sectionContainer + ' #iwd_opc_subscribe #iwd_opc_subscribe_checkbox').is(':checked') ? 1 : 0
    });

    return data;
};

PaymentMethod.prototype.initChangeCcFields = function () {
    var _this = this;
    $ji(document).on('input', _this.sectionContainer + ' #iwd_opc_payment_method_form .iwd_opc_input[name="payment[iwd_opc_cc_number]"], ' +
        _this.sectionContainer + ' #iwd_opc_payment_method_form .iwd_opc_input[data-name="payment[iwd_opc_cc_number]"]', function (e) {
        var element = $ji(this);
        _this.formatCcNumber(element, e);

        var previousCcType = $ji(this).closest('.iwd_opc_universal_wrapper').attr('data-cc-type');
        var ccType = _this.detectCcType($ji(this));
        if (ccType === 'OT' || !ccType) {
            ccType = previousCcType;
        }

        if (_this.ccTypes.hasOwnProperty(ccType)) {
            $ji(this).attr('max-length', _this.ccTypes[ccType][2]);
            if (element.val().length >= _this.ccTypes[ccType][2]) {
                element.val(element.val().substring(0, _this.ccTypes[ccType][2]));
                _this.detectCcType($ji(this));
            }
        }

        var v = element.val().replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        _this.fillCcNumberField(element.get(0), v);
    });

    $ji(document).on('keyup', _this.sectionContainer + ' #iwd_opc_payment_method_form .iwd_opc_input[name="payment[iwd_opc_cc_number]"], ' +
        _this.sectionContainer + ' #iwd_opc_payment_method_form .iwd_opc_input[data-name="payment[iwd_opc_cc_number]"]', function (e) {
        var ccType = _this.detectCcType($ji(this));
        if (_this.ccTypes.hasOwnProperty(ccType)) {
            $ji(this).attr('max-length', _this.ccTypes[ccType][2]);
        }
    });

    $ji(document).on('keydown', _this.sectionContainer + ' #iwd_opc_payment_method_form .iwd_opc_input[name="payment[iwd_opc_cc_number]"], ' +
        _this.sectionContainer + ' #iwd_opc_payment_method_form .iwd_opc_input[data-name="payment[iwd_opc_cc_number]"]', function (e) {
        _this.checkNumberInput($ji(this), e);
    });

    $ji(document).on('keydown', _this.sectionContainer + ' #iwd_opc_payment_method_form .iwd_opc_input[name="payment[iwd_opc_cc_exp]"], ' +
        _this.sectionContainer + ' #iwd_opc_payment_method_form .iwd_opc_input[data-name="payment[iwd_opc_cc_exp]"]', function (e) {
        _this.checkNumberInput($ji(this), e);
    });

    $ji(document).on('input', _this.sectionContainer + ' #iwd_opc_payment_method_form .iwd_opc_input[name="payment[iwd_opc_cc_exp]"], ' +
        _this.sectionContainer + ' #iwd_opc_payment_method_form .iwd_opc_input[data-name="payment[iwd_opc_cc_exp]"]', function (e) {
        var value = $ji(this).val();
        if (value.length > 2 && value[2] !== '/') {
            var cursorPosition = $ji(this).prop('selectionStart');
            value = value.replace('/', '');
            var month = value.substring(0, 2);
            var year = value.substring(2);
            value = month + '/' + year;
            value = value.substring(0, 7);
            $ji(this).val(value);
            $ji(this).selectRange(cursorPosition + 1);
        }

        var ccExpMonthYearArr = value.split('/');
        var is_valid = false;
        if (ccExpMonthYearArr[0] && ccExpMonthYearArr[1]) {
            var ccExpMonth = parseInt(ccExpMonthYearArr[0]);
            var ccExpYear = parseInt(ccExpMonthYearArr[1]);
            var currentTime = new Date();
            var currentMonth = currentTime.getMonth() + 1;
            var currentYear = currentTime.getFullYear();
            if (ccExpMonth > 12) {
                is_valid = false;
            } else if (ccExpYear > currentYear) {
                is_valid = true;
            } else if (ccExpMonth >= currentMonth && ccExpYear == currentYear) {
                is_valid = true;
            }

            if (is_valid) {
                _this.fillCcExpDateFields($ji(this).get(0), ccExpMonth, ccExpYear);
            }
        }
        if (!is_valid) {
            _this.fillCcExpDateFields($ji(this).get(0), '', '');
        }
    });
};

PaymentMethod.prototype.checkNumberInput = function (element, e) {
    var value = element.val();
    if (value) {
        if ($ji.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
            (e.keyCode == 65 && e.ctrlKey === true) ||
            e.ctrlKey === true ||
            e.shiftKey === true ||
            (e.keyCode == 67 && e.ctrlKey === true) ||
            (e.keyCode == 88 && e.ctrlKey === true) ||
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return true;
        } else if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
            return false;
        }
    }

    return null;
};

PaymentMethod.prototype.formatCcNumber = function (element, e) {
    var value = element.val();
    if (value) {
        var clear_value = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        var formatted_value = clear_value;
        var cursorPosition = element.prop('selectionStart');
        var matches = clear_value.match(/\d{4,24}/g);
        var match = matches && matches[0] || '';
        var parts = [];
        for (i = 0; i < match.length; i += 4) {
            parts.push(match.substring(i, i + 4))
        }

        if (parts.length) {
            formatted_value = parts.join(' ');
            test_value = value.substring(0, cursorPosition);
            test_formatted_value = formatted_value.substring(0, cursorPosition);
            var test_value_length = test_value.match(/ /g) ? test_value.match(/ /g).length : 0;
            var test_formatted_value_length = test_formatted_value.match(/ /g) ? test_formatted_value.match(/ /g).length : 0;
            if (test_formatted_value_length > test_value_length) {
                cursorPosition = cursorPosition + test_formatted_value_length - test_value_length;
            }
        }

        if ((cursorPosition % 5) === 0) {
            cursorPosition = cursorPosition - 1;
        }

        element.val(formatted_value);
        element.selectRange(cursorPosition);
    }
};

PaymentMethod.prototype.detectCcType = function (element) {
    var value = element.val();
    var type_select = element.closest('.iwd_opc_universal_wrapper').find('.iwd_opc_select[name="payment[cc_type]"]');
    if (!type_select.length) {
        type_select = element.closest('.iwd_opc_universal_wrapper').find('.iwd_opc_select[data-name="payment[cc_type]"]');
    }

    if (type_select.length) {
        type_select.val('').trigger('change');
        element.closest('.iwd_opc_universal_wrapper').attr('data-cc-type', '');
        if (value) {
            value = value.replace(/\D/g, '');
            for (var ccType in this.ccTypes) {
                if (this.ccTypes.hasOwnProperty(ccType)) {
                    var ccRegex = this.ccTypes[ccType][0];
                    if (value.match(ccRegex)) {
                        break;
                    }
                }
            }

            type_select.val(ccType).trigger('change');
            if (type_select.val()) {
                element.closest('.iwd_opc_universal_wrapper').attr('data-cc-type', ccType);
            }
        }

        if (element.closest('.iwd_opc_payment_method_form').find('.iwd_opc_payment_cc_solo_fields').length) {
            element.closest('.iwd_opc_payment_method_form').find('.iwd_opc_payment_cc_solo_fields')
                .hide().find('input, select').prop('disabled', true);
        }

        if ($ji.inArray(type_select.val(), ['SO', 'SM', 'SS']) !== -1) {
            if (element.closest('.iwd_opc_payment_method_form').find('.iwd_opc_payment_cc_solo_fields').length) {
                element.closest('.iwd_opc_payment_method_form').find('.iwd_opc_payment_cc_solo_fields')
                    .show().find('input, select').removeAttr('disabled');
            }
        }

        return type_select.val();
    } else {
        return 'OT';
    }
};

PaymentMethod.prototype.fillCcExpDateFields = function (element, expMonth, expYear) {
    var monthField = $ji(element).closest('.iwd_opc_universal_wrapper').find('input[name="payment[cc_exp_month]"]');
    if (!monthField.length) {
        monthField = $ji(element).closest('.iwd_opc_universal_wrapper').find('input[data-name="payment[cc_exp_month]"]');
    }

    var yearField = $ji(element).closest('.iwd_opc_universal_wrapper').find('input[name="payment[cc_exp_year]"]');
    if (!yearField.length) {
        yearField = $ji(element).closest('.iwd_opc_universal_wrapper').find('input[data-name="payment[cc_exp_year]"]');
    }

    if (monthField.length && yearField.length) {
        monthField.val(expMonth).trigger('input');
        yearField.val(expYear).trigger('input');
    }
};

PaymentMethod.prototype.fillCcNumberField = function (element, value) {
    var ccNumberField = $ji(element).closest('.iwd_opc_universal_wrapper').find('input[name="payment[cc_number]"]');
    if (!ccNumberField.length) {
        ccNumberField = $ji(element).closest('.iwd_opc_universal_wrapper').find('input[data-name="payment[cc_number]"]');
    }

    if (ccNumberField.length) {
        ccNumberField.val(value).trigger('input');
    }
};

PaymentMethod.prototype.disableHiddenFields = function () {
    var code = $ji(this.sectionContainer + ' #iwd_opc_payment_method_select').val();
    if (code) {
        $ji(this.sectionContainer + ' .iwd_opc_payment_method_forms .iwd_opc_payment_method_form').hide();
        $ji(this.sectionContainer + ' .iwd_opc_payment_method_forms .iwd_opc_payment_method_form')
            .find('input, select, textarea').prop('disabled', true);
        if ($ji(this.sectionContainer + ' .iwd_opc_payment_method_forms ' +
                '.iwd_opc_payment_method_form[data-payment-method-code="' + code + '"]').length) {
            $ji(this.sectionContainer + ' .iwd_opc_payment_method_forms ' +
                '.iwd_opc_payment_method_form[data-payment-method-code="' + code + '"]')
                .show()
                .find('input, select, textarea')
                .removeAttr('disabled');
            this.decorateSelects(this.sectionContainer + ' .iwd_opc_payment_method_forms ' +
                '.iwd_opc_payment_method_form[data-payment-method-code="' + code + '"]');
        }
    }
};

function PaymentMethodPayPalExpress() {
    PaymentMethod.apply(this);
    this.sectionContainer = Singleton.get(OnePage).sectionContainer;
    this.name = 'payment_method_paypal';
}

PaymentMethodPayPalExpress.prototype = Object.create(PaymentMethod.prototype);
PaymentMethodPayPalExpress.prototype.constructor = PaymentMethodPayPalExpress;

PaymentMethodPayPalExpress.prototype.init = function () {
    this.initButtons();
};

PaymentMethodPayPalExpress.prototype.initButtons = function () {
    $ji(document).on('click', this.sectionContainer + ' .iwd_opc_top_button_paypal', function () {
        if ($ji(this).attr('data-confirmation')) {
            if (confirm($ji(this).attr('data-confirmation'))) {
                window.location.href = $ji(this).attr('data-url');
            }
        } else {
            window.location.href = $ji(this).attr('data-url');
        }
    });
};


function PaymentMethodAuthorizeNet() {
    PaymentMethod.apply(this);
    this.name = 'payment_method_authorize_net';
}

PaymentMethodAuthorizeNet.prototype = Object.create(PaymentMethod.prototype);
PaymentMethodAuthorizeNet.prototype.constructor = PaymentMethodAuthorizeNet;

PaymentMethodAuthorizeNet.prototype.init = function () {
    this.cancelUrl = this.config.authorizeNetCancelUrl;
    this.iniCancelButton();
};

PaymentMethodAuthorizeNet.prototype.iniCancelButton = function () {
    var _this = this;
    $ji(document).on('click', _this.sectionContainer + ' #iwd_opc_authorizenet_cancel_button', function () {
        _this.confirmCancel();
    });
};

PaymentMethodAuthorizeNet.prototype.cancel = function () {
    var data = [];
    this.showLoader(Singleton.get(Payment).sectionContainer);
    this.ajaxCall(this.cancelUrl, data, Singleton.get(PaymentMethod).onSavePaymentMethodSuccess);
};

function PaymentMethodOpgSquare() {
    PaymentMethod.apply(this);
    this.name = 'payment_method_opg_square';
    this.paymentForm = null;
    this.code = 'square';
    this.originalThis = null;
    this.originalArguments = null;
    this.saveOrderInProgress = false;
}

PaymentMethodOpgSquare.prototype = Object.create(PaymentMethod.prototype);
PaymentMethodOpgSquare.prototype.constructor = PaymentMethodOpgSquare;

PaymentMethodOpgSquare.prototype.init = function () {
    var _this = this;
    if (typeof(SqPaymentForm) !== 'undefined' && this.config.opcSquareAppId) {
        this.paymentForm = new SqPaymentForm({
            applicationId: this.config.opcSquareAppId,
            inputStyles: [
                {
                    fontSize: '14px'
                    // padding:'5px 10px'
                }
            ],
            inputClass: 'sq-input',

            cardNumber: {
                elementId: 'square_cc_number',
                placeholder: 'Credit Card Number'
            },
            cvv: {
                elementId: 'square_cc_cid',
                placeholder: 'CVV'
            },
            expirationDate: {
                elementId: 'square_cc_date',
                placeholder: 'MM/YY'
            },
            postalCode: {
                elementId: 'square_postal_code',
                placeholder: 'Postal Code'
            },
            callbacks: {
                cardNonceResponseReceived: function (errors, nonce, cardData) {
                    if (errors) {
                        _this.originalThis.hideLoader(Singleton.get(OnePage).sectionContainer);
                        var message = '';
                        errors.forEach(function (error) {
                            message += error.message + '</br>';
                        });
                        _this.showPopup(message);
                    } else {
                        if (_this.saveOrderInProgress) {
                            return true;
                        }

                        $ji('#square_cc_type').attr('value', cardData.card_brand);
                        $ji('#square_expiration').attr('value', cardData.exp_month);
                        $ji('#square_expiration_yr').attr('value', cardData.exp_year);
                        $ji('#square_token').attr('value', nonce);
                        _this.saveOrderInProgress = true;
                        OnePage.prototype.saveSection.apply(_this.originalThis, _this.originalArguments);
                    }
                },
                unsupportedBrowserDetected: function () {
                    _this.originalThis.hideLoader(Singleton.get(OnePage).sectionContainer);
                    _this.showPopup('Your browser doesn\'t supported');
                }
            }
        });
        this.paymentForm.build();
    }
};

PaymentMethodOpgSquare.prototype.savePayment = function () {
    try {
        this.paymentForm.requestCardNonce();
    } catch (e) {
        this.originalThis.hideLoader(Singleton.get(OnePage).sectionContainer);
        this.showPopup(e.message);
    }

};

function PaymentMethodAuthorizeNetDirectPost() {
    PaymentMethod.apply(this);
    this.name = 'payment_method_authorize_net_direct_post';
    this.code = 'authorizenet_directpost';
    this.iframeId = 'iwd_opc_directpost_iframe';
    this.paymentRequestSent = false;
    this.hasError = false;
}

PaymentMethodAuthorizeNetDirectPost.prototype = Object.create(PaymentMethod.prototype);
PaymentMethodAuthorizeNetDirectPost.prototype.constructor = PaymentMethodAuthorizeNetDirectPost;

PaymentMethodAuthorizeNetDirectPost.prototype.init = function () {
    this.saveUrl = this.config.authorizeNetDirectPostSaveUrl;
    this.returnQuoteUrl = this.config.authorizeNetDirectPostReturnQuoteUrl;
};

PaymentMethodAuthorizeNetDirectPost.prototype.loadIframe = function () {
    if (Singleton.get(PaymentMethodAuthorizeNetDirectPost).paymentRequestSent) {
        Singleton.get(PaymentMethodAuthorizeNetDirectPost).paymentRequestSent = false;
        if (!Singleton.get(PaymentMethodAuthorizeNetDirectPost).hasError) {
            Singleton.get(PaymentMethodAuthorizeNetDirectPost).returnQuote();
        }
    }
};

PaymentMethodAuthorizeNetDirectPost.prototype.returnQuote = function () {
    var data = [];
    this.showLoader(this.sectionContainer);
    this.ajaxCall(this.returnQuoteUrl, data, this.onSuccessReturnQuote);
};

PaymentMethodAuthorizeNetDirectPost.prototype.onSuccessReturnQuote = function (result) {
    $ji('#' + this.iframeId).show();
    if (typeof(result.error_message) !== 'undefined' && result.error_message) {
        this.showError(result.error_message);
    }

    return true;
};

PaymentMethodAuthorizeNetDirectPost.prototype.getSaveData = function () {
    var data = Singleton.get(OnePage).getSaveData();
    data.push({
        'name': 'controller',
        'value': 'onepage'
    });

    return data;
};

PaymentMethodAuthorizeNetDirectPost.prototype.saveOrder = function () {
    var data = this.getSaveData();
    this.showLoader(Singleton.get(OnePage).sectionContainer);
    this.ajaxCall(this.saveUrl, data, this.onSaveOrderSuccess);
};

PaymentMethodAuthorizeNetDirectPost.prototype.onSaveOrderSuccess = function (result) {
    if (typeof (result.success) !== 'undefined'
        && typeof (result.directpost) !== 'undefined'
        && result.success
        && result.directpost) {
        var paymentData = {};
        for (var key in result.directpost.fields) {
            if (result.directpost.fields.hasOwnProperty(key)) {
                paymentData[key] = result.directpost.fields[key];
            }
        }

        var preparedData = this.preparePaymentRequest(paymentData, this.getSaveData());
        this.sendPaymentRequest(preparedData);
    } else if (typeof (result.error_messages) !== 'undefined'
        && result.error_messages) {
        var msg = result.error_messages;
        if (typeof (msg) === 'object') {
            msg = msg.join("\n");
        }

        if (msg) {
            this.showError(msg);
        }
    }

    this.hideLoader(Singleton.get(OnePage).sectionContainer);
    return false
};

PaymentMethodAuthorizeNetDirectPost.prototype.sendPaymentRequest = function (preparedData) {
    this.recreateIframe();
    var tmpForm = document.createElement('form');
    tmpForm.style.display = 'none';
    tmpForm.enctype = 'application/x-www-form-urlencoded';
    tmpForm.method = 'POST';
    document.body.appendChild(tmpForm);
    tmpForm.action = this.getCgiUrl();
    tmpForm.target = $ji('#' + this.iframeId).attr('name');
    tmpForm.setAttribute('target', $ji('#' + this.iframeId).attr('name'));
    for (var param in preparedData) {
        if (preparedData.hasOwnProperty(param)) {
            tmpForm.appendChild(this.createHiddenElement(param, preparedData[param]));
        }
    }

    this.paymentRequestSent = true;
    tmpForm.submit();
};

PaymentMethodAuthorizeNetDirectPost.prototype.createHiddenElement = function (name, value) {
    var field;
    if (isIE) {
        field = document.createElement('input');
        field.setAttribute('type', 'hidden');
        field.setAttribute('name', name);
        field.setAttribute('value', value);
    } else {
        field = document.createElement('input');
        field.type = 'hidden';
        field.name = name;
        field.value = value;
    }

    return field;
};

PaymentMethodAuthorizeNetDirectPost.prototype.recreateIframe = function () {
    if ($ji('#' + this.iframeId).length) {
        var nextElement = $(this.iframeId).next();
        var src = $ji('#' + this.iframeId).attr('src');
        var name = $ji('#' + this.iframeId).attr('name');
        $(this.iframeId).stopObserving();
        $ji('#' + this.iframeId).remove();
        var iframe = '<iframe id="' + this.iframeId +
            '" allowtransparency="true" frameborder="0"  name="' + name +
            '" style="display:none;width:100%;background-color:transparent;margin-bottom: 25px;" src="' + src + '" />';
        Element.insert(nextElement, {'before': iframe});
        $(this.iframeId).observe('load', this.loadIframe);
    }
};

PaymentMethodAuthorizeNetDirectPost.prototype.getCgiUrl = function () {
    return $ji(this.sectionContainer + ' #iwd_opc_cgi_url').val()
};

PaymentMethodAuthorizeNetDirectPost.prototype.preparePaymentRequest = function (DPdata, paymentData) {
    var year = '';
    var month = '';
    paymentData.forEach(function (obj) {
        if (obj.name === 'payment[cc_number]') {
            DPdata.x_card_num = obj.value;
        }

        if (obj.name === 'payment[cc_cid]' && obj.value) {
            DPdata.x_card_code = obj.value;
        }

        if (obj.name === 'payment[cc_exp_month]') {
            month = parseInt(obj.value, 10);
            if (month < 10) {
                month = '0' + month;
            }
        }

        if (obj.name === 'payment[cc_exp_year]') {
            year = obj.value;
            if (year.length > 2) {
                year = year.substring(2);
            }
        }
    });

    DPdata.x_exp_date = month + '/' + year;
    return DPdata;
};

PaymentMethodAuthorizeNetDirectPost.prototype.showError = function (message) {
    this.hasError = true;
    $ji('#' + this.iframeId).hide();
    this.showPopup(message);
};

function PaymentMethodStripe() {
    PaymentMethod.apply(this);
    this.sectionContainer = Singleton.get(OnePage).sectionContainer;
    this.name = 'payment_method_stripe';
    this.code = 'stripe';
    this.originalThis = null;
    this.originalArguments = null;
}

PaymentMethodStripe.prototype = Object.create(PaymentMethod.prototype);
PaymentMethodStripe.prototype.constructor = PaymentMethodStripe;

PaymentMethodStripe.prototype.savePayment = function () {
    var form = $ji(this.getForm().form);
    try {
        Stripe.card.createToken(form, this.responseHandler);
    } catch (e) {
        this.originalThis.hideLoader(Singleton.get(OnePage).sectionContainer);
        this.showPopup(e.message);
    }

};

PaymentMethodStripe.prototype.responseHandler = function (status, response) {
    var _this = Singleton.get(PaymentMethodStripe);
    if (status !== 200) {
        _this.ajaxError({status: 500});
    }

    if (response.error) {
        _this.originalThis.hideLoader(Singleton.get(OnePage).sectionContainer);
        _this.showPopup(response.error);
        return;
    }

    var form = $ji(_this.getForm().form);
    $ji(_this.sectionContainer + ' #strip_token').remove();
    var input = $ji('<input type="hidden" name="payment[stripe_token]" id="strip_token" />').val(response.id);
    input.appendTo(form);
    OnePage.prototype.saveSection.apply(_this.originalThis, _this.originalArguments);
};

function PaymentMethodBrainTreePayments() {
    PaymentMethod.apply(this);
    this.sectionContainer = Singleton.get(OnePage).sectionContainer;
    this.name = 'payment_method_braintree';
    this.codeCc = 'braintree';
    this.codePayPal = 'braintree_paypal';
}

PaymentMethodBrainTreePayments.prototype = Object.create(PaymentMethod.prototype);
PaymentMethodBrainTreePayments.prototype.constructor = PaymentMethodBrainTreePayments;

PaymentMethodBrainTreePayments.prototype.init = function () {
    this.initChangeCard();
};

PaymentMethodBrainTreePayments.prototype.initChangeCard = function () {
    var _this = this;
    $ji(document).on('change', _this.sectionContainer + ' .iwd_braintree_saved_card', function () {
        if ($ji(this).val() == 0) {
            $ji(_this.sectionContainer + ' #iwd_braintree_new_card_form').show();
            $ji(_this.sectionContainer + ' #iwd_braintree_new_card_form .iwd_opc_field')
                .prop('disabled', false).show().trigger('change');
        } else {
            $ji(_this.sectionContainer + ' #iwd_braintree_new_card_form').hide();
            $ji(_this.sectionContainer + ' #iwd_braintree_new_card_form .iwd_opc_field')
                .prop('disabled', true).hide();
        }
    });

    $ji(document).on('input', _this.sectionContainer + ' #braintree_cc_number', function () {
        $ji(_this.sectionContainer + ' #braintree_cc_last4').val($ji(this).val().slice(-4));
    });

    $ji(document).on('change', _this.sectionContainer + ' #braintree_cc_type', function () {
        $ji(_this.sectionContainer + ' #braintree_cc_type_hidden').val($ji(this).val());
    });
};

PaymentMethodBrainTreePayments.prototype.saveOrder = function () {
    var _this = this;
    var token = $ji(_this.sectionContainer + ' #braintree_cc_token');
    var storedCard = token.length && (token.val() != '');
    var threeDSecure = Boolean($ji(_this.sectionContainer + ' #braintree_3dsecure_available').length);
    if (threeDSecure && storedCard) {
        // Checkout using stored card, 3D Secure is enabled
        _this.showLoader(_this.sectionContainer);
        _this.ajaxCall(
            this.threeDSecureUrl,
            {token: token.val()},
            _this.onSavePaymentMethodSuccess
        );
    } else if (threeDSecure && !storedCard) {
        // Checkout using new card, 3D Secure is enabled
        _this.showLoader(_this.sectionContainer);
        var card = {
            number: $ji(_this.sectionContainer + ' #braintree_cc_number').val(),
            expirationMonth: $ji(_this.sectionContainer + ' #braintree_expiration').val(),
            expirationYear: $ji(_this.sectionContainer + ' #braintree_expiration_yr').val(),
            cardholderName: _this.cardHolderName
        };
        if ($ji(_this.sectionContainer + ' #braintree_cc_cid').length) {
            card['cvv'] = $ji(_this.sectionContainer + ' #braintree_cc_cid').val();
        }

        _this.processBraintree3DSecure(card);
    } else if (!threeDSecure && storedCard) {
        _this.processNativeExtensionOrder();
    } else {
        braintreeUtils.createHiddenInput({name: "payment[nonce]", id: _this.nonceInputId}, _this.formId);
        braintreeUtils.getPaymentNonce(
            'braintree',
            _this.cardHolderName,
            _this.processNativeExtensionOrder,
            _this.token
        );
    }
};

PaymentMethodBrainTreePayments.prototype.processNativeExtensionOrder = function (card) {
    var _this = this;
    if (_this.isAdvancedFraudProtectionEnabled) {
        if ($ji(_this.sectionContainer + ' #device_data').length) {
            $ji(_this.sectionContainer + ' #device_data').attr('disabled', false);
        }
    }

    Singleton.get(OnePage).saveOrder();
};

PaymentMethodBrainTreePayments.prototype.processBraintree3DSecure = function (card) {
    var _this = this;
    braintreeUtils.createHiddenInput({name: "payment[nonce]", id: _this.nonceInputId}, _this.formId);
    var onUserClose = function () {
        _this.hideLoader(_this.sectionContainer);
    };
    var beforeStart = function () {
        _this.showLoader(_this.sectionContainer);
    };
    braintreeUtils.place3DSecureOrder(
        card,
        _this.braintree3DSecureGrandTotal,
        Boolean(_this.canContinueOn3DSecureFail),
        _this.showErrorMessage.bind(_this),
        _this.processNativeExtensionOrder.bind(_this),
        _this.tryAnotherCardMessage,
        _this.formId,
        'braintree_cc_token',
        _this.token,
        onUserClose,
        beforeStart
    );
};

PaymentMethodBrainTreePayments.prototype.onSavePaymentMethodSuccess = function (result) {
    if (result.status == 200) {
        result = result.responseText.evalJSON();
        if (result.error == true) {
            this.showErrorMessage(result.text);
        } else {
            this.processBraintree3DSecure(result.nonce);
        }
    }
};

PaymentMethodBrainTreePayments.prototype.showErrorMessage = function (message) {
    this.hideLoader(this.sectionContainer);
    this.showPopup(message);
};