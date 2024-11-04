import { backend } from 'declarations/backend';

const display = document.getElementById('display');
const buttons = document.querySelectorAll('.keypad button');
const clearButton = document.getElementById('clear');

let currentInput = '';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

buttons.forEach(button => {
    button.addEventListener('click', () => handleButtonClick(button.textContent));
});

clearButton.addEventListener('click', clearCalculator);

async function handleButtonClick(value) {
    if (value >= '0' && value <= '9' || value === '.') {
        inputDigit(value);
    } else if (['+', '-', '*', '/'].includes(value)) {
        handleOperator(value);
    } else if (value === '=') {
        await performCalculation();
    }
}

function inputDigit(digit) {
    if (waitingForSecondOperand) {
        currentInput = digit;
        waitingForSecondOperand = false;
    } else {
        currentInput = currentInput === '0' ? digit : currentInput + digit;
    }
    updateDisplay();
}

function handleOperator(nextOperator) {
    const inputValue = parseFloat(currentInput);

    if (operator && waitingForSecondOperand) {
        operator = nextOperator;
        return;
    }

    if (firstOperand === null && !isNaN(inputValue)) {
        firstOperand = inputValue;
    } else if (operator) {
        const result = performOperation(firstOperand, inputValue, operator);
        currentInput = `${parseFloat(result.toFixed(7))}`;
        firstOperand = result;
    }

    waitingForSecondOperand = true;
    operator = nextOperator;
    updateDisplay();
}

async function performCalculation() {
    const inputValue = parseFloat(currentInput);
    if (operator && !waitingForSecondOperand) {
        try {
            const result = await backend.calculate(firstOperand, inputValue, operator);
            currentInput = `${parseFloat(result.toFixed(7))}`;
            firstOperand = null;
            operator = null;
            waitingForSecondOperand = false;
            updateDisplay();
        } catch (error) {
            currentInput = 'Error';
            updateDisplay();
        }
    }
}

function performOperation(firstOperand, secondOperand, operator) {
    switch (operator) {
        case '+':
            return firstOperand + secondOperand;
        case '-':
            return firstOperand - secondOperand;
        case '*':
            return firstOperand * secondOperand;
        case '/':
            return firstOperand / secondOperand;
        default:
            return secondOperand;
    }
}

function clearCalculator() {
    currentInput = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    updateDisplay();
}

function updateDisplay() {
    display.value = currentInput;
}

updateDisplay();
