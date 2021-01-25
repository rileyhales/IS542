const validator = (function () {
    // keeps track of most recent true/false check
    let isValid = true;

    // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
    const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    return {
        // from class slack channel, i like this approach
        isNumeric: function (txt) {
            isValid = !isNaN(txt);},

        isInteger: function (txt) {
            isValid = Number.isInteger(txt);},

        isNegativeInteger: function (txt) {
            isValid = (Number.isInteger(txt) && txt < 0);},

        // I'm assuming this does not include zero
        isPositiveInteger: function (txt) {
            isValid = (Number.isInteger(txt) && txt > 0);},

        // and that this is supposed to include zero
        isNonNegativeInteger: function (txt) {
            isValid = (Number.isInteger(txt) && txt >= 0);},

        isInRange: function (txt, m, n) {
            // check if numeric, if numeric then compare to m & n
            if (!isNaN(txt)) {
                if (m === undefined) {
                    isValid = (txt <= n);
                } else if (n === undefined) {
                    isValid = (txt >= m);
                } else {
                    isValid = (txt >= m && txt <= n);
                }
            } else {
                isValid = false;
            }
        },

        isValidEmail: function (txt) {
            isValid = emailRegex.test(txt);},

        // check that txt is string so only empty strings pass (e.g. not [])
        isNonEmpty: function (txt) {
            isValid = (typeof txt === "string" && txt.length > 0);},

        matchesRegex: function (txt, regex) {
            isValid = RegExp(regex).test(txt);},

        lengthIsInRange: function (txt, m, n) {
            if (typeof txt === "string") {
                if (m === undefined) {
                    isValid = (txt.length <= n);
                } else if (n === undefined) {
                    isValid = (txt.length >= m);
                } else {
                    isValid = (txt.length >= m && txt.length <= n);
                }
            } else {
                isValid = false;
            }
        },

        isValid: function () {
            return isValid;},
        reset: function () {
            isValid = true;},
    }
}());

// true true false
// validator.isNumeric(5);
// console.log(validator.isValid());
// validator.isNumeric("5");
// console.log(validator.isValid());
// validator.isNumeric("not numeric");
// console.log(validator.isValid());

// true false
// validator.isInteger(5);
// console.log(validator.isValid());
// validator.isInteger(5.6);
// console.log(validator.isValid());

// false true false
// validator.isNegativeInteger(5);
// console.log(validator.isValid());
// validator.isNegativeInteger(-1);
// console.log(validator.isValid());
// validator.isNegativeInteger(-1.1);
// console.log(validator.isValid());

// true false false
// validator.isPositiveInteger(5);
// console.log(validator.isValid());
// validator.isPositiveInteger(-1);
// console.log(validator.isValid());
// validator.isPositiveInteger(-5.1);
// console.log(validator.isValid());

// true true false
// validator.isNonNegativeInteger(1);
// console.log(validator.isValid());
// validator.isNonNegativeInteger(0);
// console.log(validator.isValid());
// validator.isNonNegativeInteger(-1);
// console.log(validator.isValid());

// true false true true
// validator.isInRange(1, 0, 2);
// console.log(validator.isValid());
// validator.isInRange(2, 0, 2);
// console.log(validator.isValid());
// validator.isInRange(2, 0, );
// console.log(validator.isValid());
// validator.isInRange(2, undefined, 3 );
// console.log(validator.isValid());

// true false
// validator.isValidEmail("rileyhales1@gmail.com");
// console.log(validator.isValid());
// validator.isValidEmail("nonemailstring");
// console.log(validator.isValid());

// true false
// validator.isNonEmpty("non empty string");
// console.log(validator.isValid());
// validator.isNonEmpty("");
// console.log(validator.isValid());
// validator.isNonEmpty([]);
// console.log(validator.isValid());

// true false
// need tests for regex test

// true false
// validator.lengthIsInRange("asdf", 2, 5);
// console.log(validator.isValid());
// validator.lengthIsInRange("asdf", 2, 4);
// console.log(validator.isValid());
