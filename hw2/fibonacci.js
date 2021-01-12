function fib(a) {
    if (a < 0) {
        alert("Please enter a positive integer")
        return
    }

    let previous2 = 0;
    let previous1 = 1;
    let current;

    if (a === 0) {
        current = 0
    } else if (a === 1) {
        current = 1
    } else {
        for (let i = 2; i <= a; i++) {
            current = previous2 + previous1;
            previous2 = new Number(previous1);
            previous1 = new Number(current);
        }
    }

    console.log(current);
    document.getElementById('fib-output').innerHTML = "Fibonacci number " + a + " is <b>" + current + "</b>";

    return current;
}
