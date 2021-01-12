function factorial(a) {
    if (a < 0) {
        alert("Please enter a positive integer")
        return
    }
    let product;
    if (a === 0) {
        product = 1
    } else {
        product = a;
        for (let i = a - 1; i > 0; i--) {
            product = product * i
        }
    }

    console.log(product);
    document.getElementById('fact-output').innerHTML = a + "! = <b>" + product + "</b>";

    return product
}
