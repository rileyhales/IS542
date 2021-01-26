const validator = (function () {
    // keeps track of most recent true/false check
    let isValid = true;
    let messages = [];
    const messageDiv = document.getElementById("validation-messages");

    // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
    const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    return {
        // for checking the age
        isPositiveInteger: function (txt) {
            if (isNaN(txt)) {
                messages.push("Age must be a number");
                isValid = false;
                return
            }
            const check = (Number.isInteger(Number(txt)) && txt > 0);
            if (!check) {
                messages.push("Please enter a positive integer for your age");
            }
            isValid = isValid && check;
        },

        // for picking their favorite number
        isInRange: function (txt, m, n) {
            // check if numeric, if numeric then compare to m & n
            let check;
            if (!isNaN(txt)) {
                if (m === undefined) {
                    check = (txt <= n);
                } else if (n === undefined) {
                    check = (txt >= m);
                } else {
                    check = (txt >= m && txt <= n);
                }
            } else {
                check = false;
            }
            if (!check) {
                messages.push("Pick a number between 1 and 10");
            }
            isValid = isValid && check;
        },

        // for checking the email address
        isValidEmail: function (txt) {
            const check = emailRegex.test(txt);
            if (!check) {
                messages.push("Invalid Email Address, check your spelling and format");
            }
            isValid = isValid && check;
            return check
        },

        // for checking the name fields
        isNonEmpty: function (txt) {
            const check = (typeof txt === "string" && txt.length > 0);
            if (!check) {
                messages.push("Please enter both a first and last name")
            }
        },

        // for checking the phone number field
        matchesRegex: function (txt, regex) {
            const check = RegExp(regex).test(txt)
            if (!check) {
                messages.push("Invalid Phone Number. Use 123-456-7890 format");
            }
            isValid = isValid && check;
        },

        // enters the appropriate messages
        isValid: function () {
            // isValid should only be true if every check passed (and therefore messages.length === 0)
            if (isValid) {
                messageDiv.innerHTML = "Form looks good";
            } else {
                messages.forEach((errorMessage) => messageDiv.innerHTML += `<li>${errorMessage}</li>`);
            }
        },
        reset: function () {
            messageDiv.innerHTML = "";
            messages = [];
            isValid = true;},
    }
}());

function callValidator() {
    // https://stackoverflow.com/questions/4338267/validate-phone-number-with-javascript
    const phoneRegExp = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/;
    validator.reset();
    validator.isNonEmpty(document.getElementById("first-name").value);
    validator.isNonEmpty(document.getElementById("last-name").value);
    validator.isPositiveInteger(document.getElementById("age").value);
    validator.isValidEmail(document.getElementById("email").value);
    validator.matchesRegex(document.getElementById("phone").value, phoneRegExp);
    validator.isInRange(document.getElementById("number").value, 50, 100);
    validator.isValid();
}

