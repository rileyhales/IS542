function sumBetween(a, b) {
    if (b <= a || a < 0 || b < 0) {
        alert("Please enter 2 positive numbers that are not the same- the smaller in the first box and the larger in the second box")
        return
    }
    let sum = 0;
    for (let i = a + 1; i < b; i++) {
        sum = sum + i
    }
    console.log(sum);
    document.getElementById("sum-output").innerHTML = "The sum of integers between " + a + " and " + b + " = " + sum;

    return sum
}