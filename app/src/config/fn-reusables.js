const DIGIT_REGEX = /[^0-9]/g;

export function formatSequentialCurrencyInput(inputValue = "") {
    const digits = `${inputValue ?? ""}`.replace(DIGIT_REGEX, '');

    if (digits === '') return '0.00';

    const lastDigits = digits.slice(-7);
    const len = lastDigits.length;

    let number = '0000000';
    number = number.slice(0, -len) + lastDigits;

    const integerPart = parseInt(number.slice(0, -2), 10).toString();
    const decimalPart = number.slice(-2);

    return `${integerPart}.${decimalPart}`;
}

export function formatSequentialNumberInput(inputValue = "") {
    const digits = `${inputValue ?? ""}`.replace(DIGIT_REGEX, '');

    if (digits === '') return '0';

    const normalized = digits.slice(-7);
    const trimmed = normalized.replace(/^0+(?=\d)/, '') || '0';

    return trimmed;
}
