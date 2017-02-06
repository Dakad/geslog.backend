'use strict';


/**
 * Load modules dependencies.
 */
// Built-in
const util = require("util");


// npm
const SimpleError = require('simple-error');







const InjectError = SimpleError.define('InjectError', {
    message: 'Missing injection',
    ctor: function _construct(inject, into,msg) {
        if (arguments.length === 1) {
            this.inject = inject;
            this.into = '(Go look into the stacktrace)';
        } else {
            this.inject = inject;
            this.into = into;
        }
        this.message = util.format('Missing dependency \'%s\' into \'%s\' - %s', inject, into,msg);
    }
});






module.exports = InjectError;