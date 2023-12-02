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
    html='<tr>'
        html+='  <th>Periodo</th>'
        html+='  <th>Saldo</th>'
        html+='  <th>Interes</th>'
        html+='  <th>Cuota</th>'
        html+='  <th>Amortización</th>'
        html+='  <th>Balance Final</th>'
        html+='</tr>'
    document.getElementById('titletable').innerHTML=html
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
    html='<tr>'
        html+='  <th>Periodo</th>'
        html+='  <th>Saldo</th>'
        html+='  <th>Interes</th>'
        html+='  <th>Cuota</th>'
        html+='  <th>Capitalización</th>'
        html+='  <th>Balance Final</th>'
        html+='</tr>'
    document.getElementById('titletable').innerHTML=html
}


function formatCurrency(value) {
    return '$' + Number(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}
/////Conversion de tasas
const arraytasas = ['EM', 'EB', 'ET', 'EC', 'ES', 'EA', 'PM', 'PB', 'PR', 'PC', 'PS', 'PA', 'MV', 'BV', 'TV', 'CV', 'SV', 'NM', 'NB', 'NT', 'NC', 'NS', 'CM', 'CB', 'CT', 'CC', 'CS'];
const arrayn =     ['12',  '6',  '4',  '3',  '2',  '1', '12', '6',  'PR', '3',  '6',  '1',  '12',  '6',  '4',  '3', '2',  '12',  '6',  '4',  '3',  '2', '12',  '2',  '4',  '3', '2'];

function convertirTasas(){
   var1select = document.getElementById('selectdateconvert1').value
   var2select = document.getElementById('selectdateconvert2').value
   valtoconvert = document.getElementById('interestRate').value
   tipo1 = null
   tipo2 = null
   if(var1select>=1 && var1select<=12){
    tipo1='i'
   }else{
    tipo1='j'
   }
   if(var2select>=1 && var2select<=12){
    tipo2='i'
   }else{
    tipo2='j'
   }
   result=null
   if(tipo1=='j' && tipo2=='i'){
    var aux1 = parseInt(var1select)-1
    var aux2 = parseInt(var2select)-1
    if(arrayn[aux1]==arrayn[aux2]){
        result = (valtoconvert)/arrayn[aux2]
    }else{
       //Pasar j a i equivalente en tasa 
        resulttemp = (valtoconvert)/arrayn[aux1]
        //Equivalencia de tasas
        result = Math.pow((1+(resulttemp/100)),(arrayn[aux1]/arrayn[aux2]))-1
        result=result*100
       //Pasar j a i final
       //Ejecutar anticipada 
       //i=i/1+i
    }
   }
   if(tipo1=='i' && tipo2=='j'){
    var aux1 = parseInt(var1select)-1
    var aux2 = parseInt(var2select)-1
    if(arrayn[aux1]==arrayn[aux2]){
        result = (valtoconvert)*arrayn[aux2]
    }else{
        //Pasar i a i equivalente en tasa 
        resulttemp = (valtoconvert)
        resultequivalente = Math.pow((1+(resulttemp/100)),(arrayn[aux1]/arrayn[aux2]))-1
        //Pasar de i a una j final
        result = resultequivalente*arrayn[aux2]
        result=result*100
    }
   }
   if(tipo1=='i' && tipo2=='i'){
    var aux1 = parseInt(var1select)-1
    var aux2 = parseInt(var2select)-1
        resulttemp = (valtoconvert)
        resultequivalente = Math.pow((1+(resulttemp/100)),(arrayn[aux1]/arrayn[aux2]))-1
   }
   if(tipo1=='j' && tipo2=='j'){
    var aux1 = parseInt(var1select)-1
    var aux2 = parseInt(var2select)-1
    if(arrayn[aux1]==arrayn[aux2]){
        resultaux_i = (valtoconvert)/arrayn[aux2]
        result = resultaux_i*arrayn[aux2]
    }else{
        //Pasar j a i equivalente en tasa 
        resultaux_i = (valtoconvert)/arrayn[aux1]
        //PAra de i a i equivalente 
        resultequivalente = Math.pow((1+(resultaux_i/100)),(arrayn[aux1]/arrayn[aux2]))-1
        //Pasar de i a una j final
        result = resultequivalente*arrayn[aux2]
        result=result*100
    }
   }

   //Actualizar valor en input
    document.getElementById('interestRate').value=result
   
}

function validvaluepresent(){
    if(document.getElementById('futureValue').value!='0'){
        document.getElementById('futureValue').value=0
    }
}

function validvaluefuture(){
    if(document.getElementById('presentValue').value!='0'){
        document.getElementById('presentValue').value=0
    }
}

function finctiontable(){
    if(document.getElementById('containertable').style.display=='block'){
        document.getElementById('containertable').style.display = 'none';
    }else{
        document.getElementById('containertable').style.display = 'block';
        document.getElementById('containerconvertion').style.display = 'none';
    }
    
}

function finctionconvertion(){
    if(document.getElementById('containerconvertion').style.display=='block'){
        document.getElementById('containerconvertion').style.display = 'none';
    }else{
        document.getElementById('containerconvertion').style.display = 'block';
        document.getElementById('containertable').style.display = 'none';
    }
}

function convertirTasas_2(){
    //Varificar checks
    check1 = document.getElementById('flexRadioDefault1').checked
    check2 = document.getElementById('flexRadioDefault2').checked

    check3 = document.getElementById('flexRadioDefault3').checked
    check4 = document.getElementById('flexRadioDefault4').checked

    var1select = document.getElementById('selectdateconvert1_2').value
    var2select = document.getElementById('selectdateconvert2_2').value
    valtoconvert = document.getElementById('interestRate2').value
    tipo1 = null
    tipo2 = null
    if(var1select>=1 && var1select<=12){
     tipo1='i'
    }else{
     tipo1='j'
    }
    if(var2select>=1 && var2select<=12){
     tipo2='i'
    }else{
     tipo2='j'
    }
    result=null
    if(tipo1=='j' && tipo2=='i'){
     var aux1 = parseInt(var1select)-1
     var aux2 = parseInt(var2select)-1
     if(arrayn[aux1]==arrayn[aux2]){
         result = (valtoconvert)/arrayn[aux2]
         if(check3){
            result= result/(1-(result/100))
            result=result*100
         }
         if(check4){
            result= result/(1+(result/100))
            result=result*100
         }

     }else{
        //Pasar j a i equivalente en tasa 
         resulttemp = (valtoconvert)/arrayn[aux1]
         //Es vecida inicial
         if(check1){
            resulttemp= resulttemp/(1-(resulttemp/100))
            resulttemp*100
         }
         //anticipada
         if(check2){
            resulttemp= resulttemp/(1+(resulttemp/100))
            resulttemp*100
         }
         //Equivalencia de tasas
         result = Math.pow((1+(resulttemp/100)),(arrayn[aux1]/arrayn[aux2]))-1
         //Es vencida final
         if(check3){
            result= result/(1-(resulttemp))
         }
         //anticipada
         if(check4){
            result= result/(1+(resulttemp))
         }
         result=result*100
        //Pasar j a i final
        //Ejecutar anticipada 
        //i=i/1+i
     }
    }
    if(tipo1=='i' && tipo2=='j'){
     var aux1 = parseInt(var1select)-1
     var aux2 = parseInt(var2select)-1
     if(arrayn[aux1]==arrayn[aux2]){
        if(check1 && !check3 && !check4){
            valtoconvert= (valtoconvert/100)/(1-(valtoconvert/100))
        }
        if(check2 && !check3 && !check4){
            valtoconvert= (valtoconvert/100)/(1+(valtoconvert/100))
        }
         result = (valtoconvert)*arrayn[aux2]
         
     }else{
         //Pasar i a i equivalente en tasa 
         resulttemp = (valtoconvert)
         resultequivalente = Math.pow((1+(resulttemp/100)),(arrayn[aux1]/arrayn[aux2]))-1
         //anticpada o vencida
         if(check1 && !check3){
            resultequivalente= resultequivalente/(1-(resultequivalente))
         }
         //anticipada
         if(check2 && !check4){
            resultequivalente= resultequivalente/(1+(resultequivalente))
         }
         if(check1 && check4){
            resultequivalente= resultequivalente/(1+(resultequivalente))
         }
         //anticipada
         if(check2 && check3){
            resultequivalente= resultequivalente/(1-(resultequivalente))
         }
         //Pasar de i a una j final
         result = resultequivalente*arrayn[aux2]
         result=result*100
     }
    }
    if(tipo1=='i' && tipo2=='i'){
     var aux1 = parseInt(var1select)-1
     var aux2 = parseInt(var2select)-1
         resulttemp = (valtoconvert)
         //Es vecida inicial
         if(check1){
            resulttemp= resulttemp/(1-(resulttemp/100))
            resulttemp=resulttemp*100
         }
         //anticipada
         if(check2){
            resulttemp= resulttemp/(1+(resulttemp/100))
            resulttemp=resulttemp*100
         }
         result = Math.pow((1+(resulttemp/100)),(arrayn[aux1]/arrayn[aux2]))-1
         if(check3){
            result= result/(1-(resulttemp))
         }
         //anticipada
         if(check4){
            result= result/(1+(resulttemp))
         }
         result*100

    }
    if(tipo1=='j' && tipo2=='j'){
     var aux1 = parseInt(var1select)-1
     var aux2 = parseInt(var2select)-1
     if(arrayn[aux1]==arrayn[aux2]){
         resultaux_i = (valtoconvert)/arrayn[aux2]
         result = resultaux_i*arrayn[aux2]
     }else{
         //Pasar j a i equivalente en tasa 
         resultaux_i = (valtoconvert)/arrayn[aux1]
         //PAra de i a i equivalente 
         resultequivalente = Math.pow((1+(resultaux_i/100)),(arrayn[aux1]/arrayn[aux2]))-1
         //Pasar de i a una j final
         result = resultequivalente*arrayn[aux2]
         result=result*100
     }
    }
 
    //Actualizar valor en input
     document.getElementById('interestRate2').value=result
}

function borarckecks(){
    document.getElementById('flexRadioDefault1').checked=false
    document.getElementById('flexRadioDefault2').checked=false

    document.getElementById('flexRadioDefault3').checked=false
    document.getElementById('flexRadioDefault4').checked=false
}