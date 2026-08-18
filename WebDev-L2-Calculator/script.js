const previousOperandEl = document.querySelector('[data-previous-operand]');
const currentOperandEl = document.querySelector('[data-current-operand]');
const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const equalsButton = document.querySelector('[data-equals]');
const clearButton = document.querySelector('[data-clear]');
const backspaceButton = document.querySelector('[data-backspace]');

let currentOperand = '0';
let previousOperand = '';
let operation = undefined;
let isError = false;

function clear() {
  currentOperand = '0';
  previousOperand = '';
  operation = undefined;
  isError = false;
}

function backspace() {
  if (isError) {
    clear();
    return;
  }
  currentOperand = currentOperand.toString().slice(0, -1);
  if (currentOperand === '') currentOperand = '0';
}

function appendNumber(number) {
  if (isError) clear();
  if (number === '.' && currentOperand.includes('.')) return;
  if (currentOperand === '0' && number !== '.') {
    currentOperand = number;
    return;
  }
  currentOperand = currentOperand.toString() + number.toString();
}

function chooseOperation(selectedOperation) {
  if (isError) clear();
  if (currentOperand === '' ) return;
  if (previousOperand !== '') {
    compute();
  }
  operation = selectedOperation;
  previousOperand = currentOperand;
  currentOperand = '0';
}

function compute() {
  let result;
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);
  if (isNaN(prev) || isNaN(current)) return;

  switch (operation) {
    case '+':
      result = prev + current;
      break;
    case '-':
      result = prev - current;
      break;
    case '×':
      result = prev * current;
      break;
    case '÷':
      if (current === 0) {
        currentOperand = 'Erreur : division par zéro';
        previousOperand = '';
        operation = undefined;
        isError = true;
        return;
      }
      result = prev / current;
      break;
    default:
      return;
  }

  currentOperand = roundResult(result).toString();
  operation = undefined;
  previousOperand = '';
}

function roundResult(number) {
  return Math.round((number + Number.EPSILON) * 1e10) / 1e10;
}

function formatOperand(operand) {
  if (operand === '' || operand === undefined) return '';
  const stringOperand = operand.toString();
  const [integerPart, decimalPart] = stringOperand.split('.');
  if (isNaN(parseFloat(integerPart))) return stringOperand;
  const formattedInteger = parseFloat(integerPart).toLocaleString('fr-FR');
  if (decimalPart != null) return `${formattedInteger},${decimalPart}`;
  return formattedInteger;
}

function updateActiveOperator() {
  operatorButtons.forEach(button => {
    button.classList.toggle('is-active', button.getAttribute('data-operator') === operation);
  });
}

function pulseDisplay() {
  currentOperandEl.classList.add('is-updating');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => currentOperandEl.classList.remove('is-updating'));
  });
}

function updateDisplay() {
  updateActiveOperator();
  pulseDisplay();

  if (isError) {
    currentOperandEl.textContent = currentOperand;
    currentOperandEl.setAttribute('data-error', '');
    previousOperandEl.textContent = '';
    return;
  }

  currentOperandEl.removeAttribute('data-error');
  currentOperandEl.textContent = formatOperand(currentOperand);

  if (operation != null) {
    previousOperandEl.textContent = `${formatOperand(previousOperand)} ${operation}`;
  } else {
    previousOperandEl.textContent = '';
  }
}

numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    appendNumber(button.textContent);
    updateDisplay();
  });
});

operatorButtons.forEach(button => {
  button.addEventListener('click', () => {
    chooseOperation(button.getAttribute('data-operator'));
    updateDisplay();
  });
});

equalsButton.addEventListener('click', () => {
  compute();
  updateDisplay();
});

clearButton.addEventListener('click', () => {
  clear();
  updateDisplay();
});

backspaceButton.addEventListener('click', () => {
  backspace();
  updateDisplay();
});

const KEY_TO_OPERATOR = { '+': '+', '-': '-', '*': '×', '/': '÷' };

document.addEventListener('keydown', event => {
  if (event.key >= '0' && event.key <= '9') {
    appendNumber(event.key);
    updateDisplay();
  } else if (event.key === '.') {
    appendNumber('.');
    updateDisplay();
  } else if (KEY_TO_OPERATOR[event.key]) {
    chooseOperation(KEY_TO_OPERATOR[event.key]);
    updateDisplay();
  } else if (event.key === 'Enter' || event.key === '=') {
    event.preventDefault();
    compute();
    updateDisplay();
  } else if (event.key === 'Backspace') {
    backspace();
    updateDisplay();
  } else if (event.key === 'Escape' || event.key === 'Delete') {
    clear();
    updateDisplay();
  }
});

updateDisplay();
