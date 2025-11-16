export function formatSequentialCurrencyInput(inputValue = "") {
    const digits = `${inputValue ?? ""}`.replace(/[^0-9]/g, '');

    if (digits === '') return '0.00';

    const lastDigits = digits.slice(-7);
    const len = lastDigits.length;

    let number = '0000000';
    number = number.slice(0, -len) + lastDigits;

    const integerPart = parseInt(number.slice(0, -2), 10).toString();
    const decimalPart = number.slice(-2);

    return `${integerPart}.${decimalPart}`;
}
