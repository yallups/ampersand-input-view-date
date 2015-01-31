'use strict';

var InputView = require('ampersand-input-view-masked');
var moment = require('moment');
var extend = require('amp-extend');
var isArray = require('amp-is-array');

var DATE_MASK = '99 / 99 / 9999';
var DATE_PLACEHOLDER = 'MM / DD / YYYY';
var DATE_INPUT_FORMAT = 'YYYY-MM-DD';

var DateInput = InputView.extend({
  props: {
    max: 'any',
    min: 'any',
    exceededMaxMessage: ['string', false, 'Must be earlier than :max'],
    exceededMinMessage: ['string', false, 'Must be more recent than :min'],
    invalidFormatMessage: ['string', false, 'Please pick a valid date in the format of :format'],
    format: ['string', true, DATE_PLACEHOLDER]
  },

  derived: {
    inputFormattedMin: {
      deps: ['min', 'format'],
      fn: function () {
        if (!this.min) return null;
        var mVal = getMoment(this.min, this.format);

        if (mVal.isValid()) return mVal.format(DATE_INPUT_FORMAT);

        return null;
      }
    },
    inputFormattedMax: {
      deps: ['max', 'format'],
      fn: function () {
        if (!this.max) return null;
        var mVal = getMoment(this.max, this.format);

        if (mVal.isValid()) return mVal.format(DATE_INPUT_FORMAT);

        return null;
      }
    },
    formattedMin: {
      deps: ['min', 'format'],
      fn: function () {
        if (!this.min) return null;
        var mVal = getMoment(this.min, this.format);

        if (mVal.isValid()) return mVal.format(this.format);

        return null;
      }
    },
    formattedMax: {
      deps: ['max', 'format'],
      fn: function () {
        if (!this.max) return null;
        var mVal = getMoment(this.max, this.format);

        if (mVal.isValid()) return mVal.format(this.format);

        return null;
      }
    }
  },

  bindings: extend({}, InputView.prototype.bindings, {
    'inputFormattedMin': {
      type: 'attribute',
      selector: 'input',
      name: 'min'
    },
    'inputFormattedMax': {
      type: 'attribute',
      selector: 'input',
      name: 'max'
    },
    'inputClass': {
      type: 'class',
      selector: 'input'
    }
  }),

  constructor: function (opts) {
    var clean;
    opts = opts || {};

    opts.placeholder = opts.placeholder || opts.format || DATE_PLACEHOLDER;
    opts.type = 'date';
    opts.mask = opts.mask || DATE_MASK;
    opts.maskOptions = opts.maskOptions || {};
    opts.maskOptions.placeholder = opts.placeholder;
    opts.maskOptions.autoUnmask = true;

    if (!isArray(opts.tests)) opts.tests = [];

    opts.tests.unshift(function (val) {
      var mVal = getMoment(val, this.format);

      if (!mVal.isValid()) return this.invalidFormatMessage.replace(':format', this.format);
      if (this.min && mVal < moment(this.min)) return this.exceededMinMessage.replace(':min', this.formattedMin);
      if (this.max && mVal > moment(this.max)) return this.exceededMaxMessage.replace(':max', this.formattedMax);
    });

    clean = opts.clean;
    opts.clean = function (val) {
      var mVal = getMoment(val, this.format);

      if (mVal && mVal.isValid()) {
        val = mVal.format(DATE_INPUT_FORMAT);
      }

      if (clean) return clean(val);
      return val;
    };

    arguments[0] = opts;
    InputView.apply(this, arguments);
  },

  setValue: function (value) {
    var mVal = getMoment(value, this.format);

    if (mVal) { value = mVal.format(this.format); }

    this.value = this.clean(value);

    this.$input.val(value);

    if (!this.input.value) { // if the browser has native support for input date
      this.$input.val(this.value);
    }

    if (!this.getErrorMessage(this.value)) {
      this.shouldValidate = true;
    }
  }
});

var getMoment = function (val, format) {
  var mVal;
  if (!val) return null;
  if ((mVal = moment(val, format)).isValid()) return mVal;
  if ((mVal = moment(val, DATE_INPUT_FORMAT)).isValid()) return mVal;

  return null;
};

module.exports = DateInput;