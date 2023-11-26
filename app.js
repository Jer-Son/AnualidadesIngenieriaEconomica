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
    
    const interestRate = parseFloat(interestRateInput) / 100;
    const periods = parseInt(periodsInput);
    let presentValue = parseFloat(presentValueInput) || 0;
    let futureValue = parseFloat(futureValueInput) || 0;
    
    let paymentAmount, totalInterest;
    if (presentValue === 0 && futureValue !== 0) {
        presentValue = calculatePresentValue(futureValue, interestRate, periods);
        paymentAmount = calculatePaymentAmount(presentValue, interestRate, periods, annuityType);
        totalInterest = futureValue - presentValue;
        generateFutureValueAmortizationTable(paymentAmount, interestRate, periods, futureValue);
    } else if (presentValue !== 0 && futureValue === 0) {
        paymentAmount = calculatePaymentAmount(presentValue, interestRate, periods, annuityType);
        futureValue = calculateFutureValue(paymentAmount, interestRate, periods, annuityType);
        totalInterest = futureValue - presentValue;
        generateAmortizationTable(paymentAmount, interestRate, periods, presentValue);
    } else {
        displayError('Please enter either a present value or a future value, not both.');
        return;
    }

    displayResult(paymentAmount, presentValue, futureValue, totalInterest, interestRate, periods, annuityType);
}

function calculatePresentValue(futureValue, interestRate, periods) {
    return futureValue / Math.pow(1 + interestRate, periods);
}

function calculatePaymentAmount(presentValue, interestRate, periods, annuityType) {
    const annuityFactor = (1 - Math.pow(1 + interestRate, -periods)) / interestRate;
    const paymentAmount = presentValue / annuityFactor;
    return annuityType === 'ordinary' ? paymentAmount : paymentAmount * (1 + interestRate);
}

function calculateFutureValue(paymentAmount, interestRate, periods, annuityType) {
    const futureValue = paymentAmount * ((Math.pow(1 + interestRate, periods) - 1) / interestRate);
    return annuityType === 'ordinary' ? futureValue : futureValue / (1 + interestRate);
}

function validateInput(value, fieldName) {
    if (isNaN(value) || value < 0) {
        displayError(`Invalid ${fieldName}. Please enter a positive number or zero.`);
        return false;
    }
    return true;
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
    let cumulativeInterest = 0;

    document.getElementById('amortizationTable').getElementsByTagName('tbody')[0].innerHTML = '';

    for (let period = 1; period <= periods; period++) {
        let interest = balance * interestRate;
        cumulativeInterest += interest;
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

function generateFutureValueAmortizationTable(paymentAmount, interestRate, periods, futureValue) {
    let balance = 0;
    let tableBody = '';
    let cumulativeInterest = 0;

    document.getElementById('amortizationTable').getElementsByTagName('tbody')[0].innerHTML = '';

    for (let period = 1; period <= periods; period++) {
        let interest = balance * interestRate;
        cumulativeInterest += interest;

        // Cambio aquí: incremento es igual a la suma de la cuota y el interés
        let increment = paymentAmount + interest;

        // Actualizar el balance sumando el incremento, no solo el pago
        balance += increment;

        tableBody += `
            <tr>
                <td>${period}</td>
                <td>${formatCurrency(balance)}</td>
                <td>${formatCurrency(paymentAmount)}</td>
                <td>${formatCurrency(interest)}</td>
                <td>${formatCurrency(increment)}</td>
                <td>${formatCurrency(cumulativeInterest)}</td>
            </tr>
        `;

        if (balance >= futureValue) break;
    }

    document.getElementById('amortizationTable').getElementsByTagName('tbody')[0].innerHTML = tableBody;
    document.getElementById('tableContainer').style.display = 'block';
}


function formatCurrency(value) {
    return '$' + Number(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}
