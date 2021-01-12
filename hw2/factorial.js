function factorial(a) {
    if (a === 0) {
        return 1
    }
    let product = a;

    for (let i = a - 1; i > 0; i--) {
        product = product * i
    }

    console.log(product);
    document.getElementById('fact-output').innerHTML = a + "! = <b>" + product + "</b>";

    return product
}
