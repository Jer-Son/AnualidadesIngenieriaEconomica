document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('annuityForm').addEventListener('submit', handleFormSubmit);
});

function handleFormSubmit(event) {
    event.preventDefault();
    
    const presentValue = parseFloat(document.getElementById('presentValue').value);
    const futureValue = parseFloat(document.getElementById('futureValue').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100; // Convertir a tasa decimal
    const periods = parseInt(document.getElementById('periods').value);
    const annuityType = document.getElementById('annuityType').value;
    
    if (isNaN(presentValue) || isNaN(interestRate) || isNaN(periods)) {
        displayError('All inputs must be numeric values');
        return;
    }
    
    let result;
    if (annuityType === 'ordinary') {
        result = calculateOrdinaryAnnuity(presentValue, interestRate, periods);
    } else if (annuityType === 'due') {
        result = calculateAnnuityDue(presentValue, interestRate, periods);
    } else {
        displayError('Invalid annuity type');
        return;
    }
    
    if (result === null) {
        displayError('Calculation error: invalid inputs');
    } else {
        displayResult(result, presentValue, interestRate, periods);
    }
}

function calculateOrdinaryAnnuity(presentValue, interestRate, periods) {
    const paymentAmount = presentValue * (interestRate / (1 - Math.pow(1 + interestRate, -periods)));
    return {
        presentValue: presentValue,
        futureValue: paymentAmount * periods,
        paymentAmount: paymentAmount
    };
}

function calculateAnnuityDue(presentValue, interestRate, periods) {
    const paymentAmount = presentValue * (interestRate / (1 - Math.pow(1 + interestRate, -periods))) * (1 + interestRate);
    return {
        presentValue: presentValue,
        futureValue: paymentAmount * periods,
        paymentAmount: paymentAmount
    };
}

function displayResult(result, presentValue, interestRate, periods) {
    document.getElementById('result').innerHTML = `
        Present Value: ${result.presentValue}<br>
        Future Value: ${result.futureValue}<br>
        Payment Amount: ${result.paymentAmount}
    `;
    generateAmortizationTable(result.paymentAmount, interestRate, periods, presentValue);
}

function generateAmortizationTable(paymentAmount, interestRate, periods, presentValue) {
    let balance = presentValue;
    let tableBody = '';

    document.getElementById('amortizationTable').getElementsByTagName('tbody')[0].innerHTML = '';

    for (let period = 1; period <= periods; period++) {
        let interest = balance * interestRate;
        let principal = paymentAmount - interest;
        balance -= principal;

        tableBody += `
            <tr>
                <td>${period}</td>
                <td>${(balance + principal)}</td>
                <td>${paymentAmount}</td>
                <td>${interest}</td>
                <td>${principal}</td>
                <td>${(balance > 0 ? balance : 0)}</td>
            </tr>
        `;
    }

    document.getElementById('amortizationTable').getElementsByTagName('tbody')[0].innerHTML = tableBody;
    document.getElementById('tableContainer').style.display = 'block';
}

function displayError(message) {
    document.getElementById('result').innerHTML = `Error: ${message}`;
}
