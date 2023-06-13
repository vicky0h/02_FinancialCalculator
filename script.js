class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.clear();
  }

  clear() {
    this.currentOperand = "";
    this.previousOperand = "";
    this.operation = undefined;
    this.numberOfPeriods = 0;
    this.interestRate = 0;
    this.presentValue = 0;
    this.futureValue = 0;
    this.payment = 0;
    this.financialOperation = undefined;
    this.previousOperation = undefined;
    this.internalRateOfReturn = 0;
    this.cashFlows = [];
    this.cashFlows.length = 0;
    this.netPresentValue = 0;
  }

  delete() {
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
  }

  appendNumber(number) {
    if (this.isComputed === true) {
      this.clear();
    }
    if (number === "." && this.currentOperand.includes(".")) {
      return;
    }
    this.currentOperand = this.currentOperand.toString() + number.toString();
  }

  chooseOperation(operation) {
    if (this.currentOperand === "") return;
    if (this.previousOperand !== "") {
      this.getResult();
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = "";
  }

  // "+" "-" "*" "/" RELATED SECTION
  getResult() {
    let result;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) {
      return;
    }
    switch (this.operation) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "*":
        result = prev * current;
        break;
      case "÷":
        result = prev / current;
        break;
      default:
        return;
    }
    this.currentOperand = result;
    this.operation = undefined;
    this.previousOperand = "";
  }

  getDisplayNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split(".")[0]);
    const decimalDigits = stringNumber.split(".")[1];

    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = "";
    } else {
      integerDisplay = integerDigits.toLocaleString("en", {
        maximumFractionDigits: 0,
      });
    }

    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return `${integerDisplay}`;
    }
  }

  updateDisplay() {
    this.currentOperandTextElement.innerText = this.getDisplayNumber(
      this.currentOperand
    );
    if (this.operation != null) {
      this.previousOperandTextElement.innerText = `${this.getDisplayNumber(
        this.previousOperand
      )} ${this.operation}`;
    } else {
      this.previousOperandTextElement.innerText = "";
    }
  }

  updateSignage() {
    this.currentOperand = -1 * this.currentOperand;
  }

  updatePercentage() {
    this.currentOperand = this.currentOperand / 100;
  }

  chooseFinancialOperation(financialOperation) {
    this.financialOperation = financialOperation;
  }


  // FINANCIAL OPERATION SECTION
  updateFinancialDisplay() {
    switch (this.financialOperation) {
      case "CPT":
        this.previousOperation = 'CPT';
        return;
      case "N":
        this.numberOfPeriods = this.currentOperand;
        break;
      case "I/Y":
        this.interestRate = this.currentOperand;
        break;
      case "PV":
        this.presentValue = this.currentOperand;
        break;
      case "PMT":
        this.payment = this.currentOperand;
        break;
      case "FV":
        this.futureValue = this.currentOperand;
        break;
      case "IRR":
        this.internalRateOfReturn = this.currentOperand;
        break;
      case "CF":
        this.cashFlows.push(this.currentOperand * 1);
        break;
      case "NPV":
        this.netPresentValue = this.currentOperand;
        break;
      default:
        return;
    }

      if (this.financialOperation === 'CF') {
        console.log(JSON.stringify(this.cashFlows));
        console.log(this.cashFlows.length);
        this.currentOperandTextElement.innerText = `${this.financialOperation}${this.cashFlows.length - 1} = ${this.currentOperand}`;
        this.currentOperand = "";
        return;
      }
  
      console.log('previousOperation =' + this.previousOperation);
      this.currentOperandTextElement.innerText = `${this.financialOperation} = ${this.currentOperand}`;
      this.currentOperand = "";

  }

  getFV(pv, pmt, r, n) {
    let fv;
    let compoundRate = Math.pow(1 + r, n);
    fv = -(pv * compoundRate + pmt * ((compoundRate - 1) / r));
    return fv;
  }

  getPV(fv, pmt, r, n) {
    let pv;
    let compoundRate = Math.pow(1 + r, n);
    pv = fv - (pmt * ((compoundRate - 1) / r)) / compoundRate;
    return pv;
  }

  getPMT(pv, fv, r, n) {
    let pmt;
    let compoundRate = Math.pow(1 + r, n);
    pmt = ((fv - pv * compoundRate) * r) / (compoundRate - 1);
    return pmt;
  }

  getNumberOfPeriods(pv, fv, pmt, r) {
    let n;
    let x = (fv - pmt / r) / (-pv - pmt / r);
    let y = 1 + r;
    n = parseFloat(Math.log(x) / Math.log(y));
    return n;
  }

  getCashFlows(pv, fv, pmt, n) {
    this.cashFlows.push(pv * 1);
    for (let i = 1; i < n; i++) {
        this.cashFlows.push(pmt * 1);
    }
    this.cashFlows.push((pmt * 1 + fv * 1));
    console.log("get cashFlows: " + JSON.stringify(this.cashFlows));
  }

  getRate(pv, fv, pmt, n) {
    this.getCashFlows(pv, fv, pmt, n);
    return this.getIRR(this.cashFlows, 0.1);
  }

  getNPV(rate, cashFlows) {
    let npv = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(rate + 1, i);
    }
    return npv;
  }

  getIRR(cashFlows, estimatedRate) {
    let result = 'isNAN';
 
    if (cashFlows != null && cashFlows.length > 0) {
      // TO CHECK IF CF0 == 0
      if (cashFlows[0] != 0) {
        let noOfCashFlows = cashFlows.length;
        let sumCashFlows = 0;

        let noOfNegativeCashFlows = 0;
        let noOfPositiveCashFlows = 0;

        for (let i = 0; i < noOfCashFlows; i++) {
          sumCashFlows += cashFlows[i];
          if (cashFlows[i] > 0) {
            noOfPositiveCashFlows++;
          } else {
            if (cashFlows[i] < 0) {
              noOfNegativeCashFlows++;
            }
          }
        }

        // WITH AT LEAST 1 POSTIVE AND 1 NEGATIVE CASHFLOW
        if (noOfPositiveCashFlows > 0 && noOfNegativeCashFlows > 0) {
          let irrGuess = 0.1;

          if (!isNaN(estimatedRate)) {
            irrGuess = estimatedRate;
            if (irrGuess <= 0) {
              irrGuess = 0.5;
            }
          }
          let irr = 0;
          if (sumCashFlows < 0) {
            irr = -irrGuess;
          } else {
            irr = irrGuess;
          }

          let minDistance = 1e-15;
  
          let cashFlowStart = cashFlows[0];
          let maxIteration = 100;
          let wasHi = false;
          let cashValue = 0;

          for (let i = 0; i <= maxIteration; i++) {
            // To set initial accumulated cashValue = cashflow[0];
            cashValue = cashFlowStart;
            console.log('cashValue initial = ' + cashValue);
            // To get accumulated cashValue;
            for (let j = 1; j < noOfCashFlows; j++) {
              cashValue += cashFlows[j] / Math.pow(1 + irr, j);
            }
            console.log('cashValue calculated = ' + cashValue);

            // As expected NPV = 0, when the cashValue is smaller than 0.1, return the result;
            if (Math.abs(cashValue) < 0.01) {
              result = irr;
              break;
            }
            // To adjust irr for the next iteration
            // When initial cashflow is positive:
            // if accumulated cashValue is negative, next irr > current irr;
            // if accumulated cashValue is positive, next irr < current irr;
            console.log('irrGuess = ' + irrGuess);
            console.log('irr = ' + irr);

            if ((cashFlowStart > 0 && cashValue < 0) || (cashFlowStart < 0 && cashValue > 0)) {
              if (wasHi) {
                irrGuess /= 2;
              }
  
              irr += irrGuess;

              if (wasHi) {
                irrGuess -= minDistance;
                wasHi = false;
              }
            } else {
              irrGuess /= 2;
              irr -= irrGuess;
              wasHi = true;
            }
            console.log('irrGuess = ' + irrGuess);
            console.log('irr = ' + irr);
            // When irrGuess is too small to continue, end the calculation;
            if (irrGuess <= minDistance) {
              result = irr;
              break;
            }
          }
        } 
      }
    }
    console.log(result);
    if (result < 0.000001) {
      return result = 'isNaN';
    } else {
      return result;
    }
  }

  getFinancialResult() {
    if (this.previousOperation === 'CPT') {
      this.compute(this.financialOperation);
      return;
    }
    return;
  }

  compute(financialOperation) {
    let computedResult;

      switch (financialOperation) {
        case "N":
          computedResult = this.getNumberOfPeriods(
            this.presentValue,
            this.futureValue,
            this.payment,
            this.interestRate
          );
          break;
        case "I/Y":
          computedResult = this.getRate(
            this.presentValue,
            this.futureValue,
            this.payment,
            this.numberOfPeriods
          );
          break;
        case "PV":
          computedResult = this.getPV(
            this.futureValue,
            this.payment,
            this.interestRate,
            this.numberOfPeriods
          );
          break;
        case "PMT":
          computedResult = this.getPMT(
            this.presentValue,
            this.futureValue,
            this.interestRate,
            this.numberOfPeriods
          );
          break;
        case "FV":
          computedResult = this.getFV(
            this.presentValue,
            this.payment,
            this.interestRate,
            this.numberOfPeriods
          );
          break;
        case "NPV":
            computedResult = this.getNPV(
                this.interestRate,
                this.cashFlows
            );
            break;
        case "IRR":
          computedResult = this.getIRR(
              this.cashFlows,
              0.1
          );
          break;
        default:
          return;
      }
    this.previousOperation = undefined;
    this.previousOperandTextElement.innerText = "Result:";
    if (isNaN(computedResult)) {
      this.currentOperand = "Error";
    } else {
      this.currentOperand = `${this.getDisplayNumber(computedResult)}`;
    }
  }
}

const numberButtons = document.querySelectorAll("[data-number]");
const operationButtons = document.querySelectorAll("[data-operation]");
const financialOperationButtons = document.querySelectorAll(
  "[data-financial-opeartion]"
);
const cashFlowsButton = document.querySelector(
    "[data-cashFlows-opeartion]"
);
const allClearButton = document.querySelector("[data-all-clear]");
const deleteButton = document.querySelector("[data-delete]");
const equalsButton = document.querySelector("[data-equals]");
const signageButton = document.querySelector("[data-signage]");
const percentageButton = document.querySelector("[data-percentage]");
const computeButton = document.querySelector("[data-compute]");

const previousOperandTextElement = document.querySelector(
  "[data-previous-operand]"
);
const currentOperandTextElement = document.querySelector(
  "[data-current-operand]"
);

const calculator = new Calculator(
  previousOperandTextElement,
  currentOperandTextElement
);

// TO APPEND AND UPDATE DISPLAY WHEN NUMBERS ARE CLICKED
numberButtons.forEach((item) => {
  item.addEventListener("click", () => {
    calculator.appendNumber(item.innerText);
    calculator.updateDisplay();
  });
});

// TO PERFORM OPERATION AND UPDATE DISPLAY WHEN OPERATION RELATED BUTTONS ("+", "-", "*", "/" ) ARE CLICKED
operationButtons.forEach((item) => {
  item.addEventListener("click", () => {
    calculator.chooseOperation(item.innerText);
    calculator.updateDisplay();
  });
});

// TO GET RESULT WHEN "=" IS CLICKED
equalsButton.addEventListener("click", () => {
  calculator.getResult();
  calculator.updateDisplay();
});

// TO CLEAR / DELETE DISPLAY WHEN "CLEAR" OR "DELETE" BUTTON IS CLICKED
allClearButton.addEventListener("click", () => {
  calculator.clear();
  calculator.updateDisplay();
});

deleteButton.addEventListener("click", () => {
  calculator.delete();
  calculator.updateDisplay();
});

// TO UPDATE SIGNAGE WHEN "+/-" IS CLICKED
signageButton.addEventListener("click", () => {
  calculator.updateSignage();
  calculator.updateDisplay();
});

// TO CHANGE THE NUMBER TO % WHEN "%" IS CLICKED
percentageButton.addEventListener("click", () => {
  calculator.updatePercentage();
  calculator.updateDisplay();
});

// TO PERFORM FINANCIAL RELATED OPERATION AND UPDATE DISPLAY WHEN FINANCIAL OPERATION RELATED BUTTONS ("CF", "N", "PMT", "PV", "FV", ETC) ARE CLICKED
financialOperationButtons.forEach((item) => {
  item.addEventListener("click", () => {
    calculator.chooseFinancialOperation(item.innerText);
    calculator.getFinancialResult();
    calculator.updateFinancialDisplay();
  });
});


