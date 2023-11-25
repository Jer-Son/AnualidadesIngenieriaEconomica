document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('annuityForm').addEventListener('submit', handleFormSubmit);
});

function handleFormSubmit(event) {
    event.preventDefault();
    
    const presentValueInput = document.getElementById('presentValue').value;
    const futureValueInput = document.getElementById('futureValue').value;
    const interestRateInput = document.getElementById('interestRate').value;
    const periodsInput = document.getElementById('periods').value;
    const annuityType = document.getElementById('annuityType').value;
    
    if (!validateInput(interestRateInput, 'Interest Rate') || 
        !validateInput(periodsInput, 'Number of Periods')) {
        return;
    }
    
    const interestRate = parseFloat(interestRateInput);
    const periods = parseInt(periodsInput);

    let presentValue = parseFloat(presentValueInput) || 0;
    let futureValue = parseFloat(futureValueInput) || 0;
    
    let paymentAmount;

    if(presentValue === 0 && futureValue !== 0) {
        // Calcular el valor presente a partir del valor futuro
        presentValue = calculatePresentValue(futureValue, interestRate, periods);
        paymentAmount = calculatePaymentAmount(presentValue, interestRate, periods, annuityType);
    } else if(presentValue !== 0 && futureValue === 0) {
        // Calcular el valor futuro a partir del valor presente
        paymentAmount = calculatePaymentAmount(presentValue, interestRate, periods, annuityType);
        futureValue = calculateFutureValue(paymentAmount, interestRate, periods, annuityType);
    } else {
        displayError('Please enter either a present value or a future value, not both.');
        return;
    }

    const totalInterest = calculateTotalInterest(paymentAmount, periods, presentValue);

    displayResult(paymentAmount, presentValue, futureValue, totalInterest, interestRate, periods, annuityType);
    generateAmortizationTable(paymentAmount, interestRate, periods, presentValue);
}

function calculatePresentValue(futureValue, interestRate, periods) {
    const interestRateDecimal = interestRate / 100;
    return futureValue / Math.pow(1 + interestRateDecimal, periods);
}

function calculatePaymentAmount(presentValue, interestRate, periods, annuityType) {
    const interestRateDecimal = interestRate / 100;
    const annuityFactor = (1 - Math.pow(1 + interestRateDecimal, -periods)) / interestRateDecimal;
    const paymentAmount = presentValue / annuityFactor;

    return annuityType === 'ordinary' ? paymentAmount : paymentAmount * (1 + interestRateDecimal);
}

function calculateFutureValue(paymentAmount, interestRate, periods, annuityType) {
    const interestRateDecimal = interestRate / 100;
    const futureValue = paymentAmount * ((Math.pow(1 + interestRateDecimal, periods) - 1) / interestRateDecimal);

    return annuityType === 'ordinary' ? futureValue : futureValue * (1 + interestRateDecimal);
}

function validateInput(value, fieldName) {
    if (isNaN(value) || value < 0) {
        displayError(`Invalid ${fieldName}. Please enter a positive number or zero.`);
        return false;
    }
    return true;
}

function calculateTotalInterest(paymentAmount, periods, presentValue) {
    const totalPaymentAmount = paymentAmount * periods;
    const totalInterest = totalPaymentAmount - presentValue;
    return totalInterest.toFixed(2);
}

function displayError(errorMessage) {
    document.getElementById('result').innerHTML = `Error: ${errorMessage}`;
}

function displayResult(paymentAmount, presentValue, futureValue, totalInterest, interestRate, periods, annuityType) {
    document.getElementById('result').innerHTML = `
        Present Value: ${formatCurrency(presentValue)}<br>
        Future Value: ${formatCurrency(futureValue)}<br>
        Payment Amount: ${formatCurrency(paymentAmount)}<br>
        Total Interest: ${formatCurrency(totalInterest)}
    `;
}

function generateAmortizationTable(paymentAmount, interestRate, periods, presentValue) {
    let balance = presentValue;
    let tableBody = '';

    document.getElementById('amortizationTable').getElementsByTagName('tbody')[0].innerHTML = '';

    for (let period = 1; period <= periods; period++) {
        let interest = balance * (interestRate / 100);
        let principal = paymentAmount - interest;
        balance -= principal;

        tableBody += `
            <tr>
                <td>${period}</td>
                <td>${formatCurrency(balance + principal)}</td>
                <td>${formatCurrency(paymentAmount)}</td>
                <td>${formatCurrency(interest)}</td>
                <td>${formatCurrency(principal)}</td>
                <td>${formatCurrency(balance)}</td>
            </tr>
        `;
    }

    document.getElementById('amortizationTable').getElementsByTagName('tbody')[0].innerHTML = tableBody;
    document.getElementById('tableContainer').style.display = 'block';
}

function formatCurrency(value) {
    return '$' + Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
