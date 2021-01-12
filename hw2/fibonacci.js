function fib(a) {
    if (a === 0) {
        return 0
    }
    if (a === 1) {
        return 1
    }
    console.log(a);

    let previous2 = 0;
    let previous1 = 1;
    let current;

    for (let i = 2; i <= a; i++) {
        current = previous2 + previous1;
        previous2 = new Number(previous1);
        previous1 = new Number(current);
    }

    console.log(current);
    document.getElementById('fib-output').innerHTML = "Fibonacci number " + a + " is <b>" + current + "</b>";

    return current;
}
