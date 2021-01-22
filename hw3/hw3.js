const validator = (function () {
    let isValid = true;

    // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
    const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    return {
        isNumeric: function (txt) {
            // from class slack channel, i like this approach
            isValid = Number.isNaN(txt);
        },
        isInteger: function (txt) {
            isVald = Number.isInteger(txt);
        },
        isNegativeInteger: function (txt) {
        },
        isPositiveInteger: function (txt) {
        },
        isNonNegativeInteger: function (txt) {
        },
        isInRange: function (txt, m, n) {
        },
        isValidEmail: function (txt) {
            isValid = emailRegex.test(txt);
        },
        isNonEmpty: function (txt) {
        },
        matchesRegex: function (txt, regex) {
            isValid = txt.match(regex);
        },
        lengthIsInRange: function (txt, m, n) {
        },
        isValid: function () {
            return isValid
        },
        reset: function () {
            isValid = true
        },
    }
}());

validator.isValidEmail("rileyhales1@gmail.com")
console.log(validator.isValid())
