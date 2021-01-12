function makeChange(a) {
    if (a < 0) {
        alert("Please enter a positive integer")
        return
    }
    if (a === 0) {
        console.log("No change")
        return
    }

    let balance = new Number(a);

    // count quarters first, then dimes, then nickles
    // if remaining balance is non-zero, that's the number of pennies

    // store the messages rather than immediately console log so i can also print neatly to html
    let quarterMessage = "";
    let dimeMessage = "";
    let nickleMessage = "";
    let pennyMessage = "";

    let numQuarters = Math.floor(balance / 25);
    balance = balance - (25 * numQuarters)
    if (numQuarters === 1) {
        quarterMessage = "1 Quarter";
    } else if (numQuarters > 1) {
        quarterMessage = numQuarters + " Quarters";
    }

    let numDimes = Math.floor(balance / 10)
    balance = balance - (10 * numDimes)
    if (numDimes === 1) {
        dimeMessage = "1 Dime";
    } else if (numDimes > 1) {
        dimeMessage = numDimes + " Dimes";
    }

    let numNickles = Math.floor(balance / 5)
    balance = balance - (5 * numNickles)
    if (numNickles === 1) {
        nickleMessage = "1 Nickle";
    } else if (numNickles > 1) {
        nickleMessage = numNickles + " Nickles";
    }

    if (balance === 1) {
        pennyMessage = "1 Penny";
    } else if (balance > 1) {
        pennyMessage = balance + " Pennies";
    }

    console.log(quarterMessage);
    console.log(dimeMessage);
    console.log(nickleMessage);
    console.log(pennyMessage);
    document.getElementById("coin-output-25").innerHTML = quarterMessage;
    document.getElementById("coin-output-10").innerHTML = dimeMessage;
    document.getElementById("coin-output-5").innerHTML = nickleMessage;
    document.getElementById("coin-output-1").innerHTML = pennyMessage;

}
