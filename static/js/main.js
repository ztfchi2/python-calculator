//666, 420, 1999

var globalAnswer = "0"; //declaring global variable here... this is bad practice

let isNegative = false;
let operands = [];
let operators = [];

let lastBtn = "";
let historyValues = [];

let operator_tokens = ['+','-','*','/','^','%','//']

const operatorOrders = {
    '+' : 7,
    '-' : 7,
    '*' : 6,
    '/' : 6,
    '^' : 4,
    '%' : 6,
    '//' : 6,
}

function allClear(){
    isNegative = false;
    operands = [];
    operators = [];
    return clearCurrentValue();
}

function cancel(){
    if (lastBtn === 'num'){
        const currentValue = getCurrentValue()
        const canceledCurrentValue = (currentValue.length > 1)?currentValue.slice(0,-1):"0";
        $("#currentValue").html(canceledCurrentValue)
        return  canceledCurrentValue
    }
    if (lastBtn === 'operator'){
        const lastValue = (operands.length > 0)?operands.pop().toString():"0"
        return storeAndReset(lastValue, lastValue);
    }
    if (lastBtn === 'negative'){
        isNegative = false;
        const currentValue = (historyValues.length > 0)?historyValues.pop():0;
        return storeAndReset(currentValue, currentValue);
    }
    if (lastBtn === 'percentage'){
        const currentValue = (historyValues.length > 0)?historyValues.pop():0;
        return storeAndReset(currentValue, currentValue);
    }
}


function removeLeadingZero(string) {
  var newString = string
  if (newString[0] === '0') {
    newString = newString.slice(1)
  }
  return newString
}

function makeCurrentValueNegative() {
	//alert('Sorry, no negatives on this calculator. Only positive vibes!')
  var currentValue = document.getElementById("currentValue").innerHTML
  historyValues.push(currentValue)
  if (currentValue[0] === "-") {
    currentValue = currentValue.slice(1)
    $("#currentValue").html(currentValue)
  } else {
    $("#currentValue").prepend("-")
  }
  isNegative = true;

  return currentValue
}


function removeLeadingSymbol(string) {
  var newString = string
  var symbols = ["*", "/", "+", "-"]
  if (symbols.includes(newString[0])) {
    newString = newString.slice(1)
  }
  return newString
}


function storeAnswer(value) {
  var value = removeLeadingZero(value)
  globalAnswer = value //bad practice -- setting globalAnswer here
  $("#globalAnswer").html(globalAnswer) //set globalAnswer on calculator
  return value //should be a STRING
}


function getCurrentValue() {
  var currentValue = document.getElementById("currentValue").innerHTML
  return currentValue //currentValue will be a STRING
}


function clearCurrentValue() {
  $("#currentValue").html("0") //set currentValue to "0"
  changeBackground()
  return storeAnswer("0") //set globalAnswer to "0", a STRING
}


function clearCurrentValue() {
  $("#currentValue").html("0") //set currentValue to "0"
  changeBackground()
  return storeAnswer("0") //set globalAnswer to "0", a STRING
}

function makeCurrentValuePercentage(){
    const currentValue = getCurrentValue();
    historyValues.push(currentValue);

    const percentValueNum = Number(currentValue) * 0.01;
    const percentValueString = percentValueNum.toString();

    return storeAndReset(percentValueString, percentValueString);
}

function binaryOperate(operand1,operand2,operator){
    switch(operator){
        case '/':
            return (operand1 / operand2).toString();
        case '*':
            return (operand1 * operand2).toString();
        case '-':
            return (operand1 - operand2).toString();
        case '+':
            return (operand1 + operand2).toString();
        case '^':
            return Math.pow(operand1, operand2).toString();
        case '%':
            return (operand1 % operand2).toString();
        case '//':
            return Math.floor(operand1/operand2).toString();
    }
}

async function compute() {
    data = {
        'operands' : operands,
        'operators' : operators,
    }
    const response = await fetch('/compute', {
        method: 'POST',
        cache: 'no-cache',
        headers: {
      'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    resData = await response.json()
    return resData.answer;
}

function isNumeric(num){
  return !isNaN(num)
}


async function equals() {
    $('.negative').prop('disabled', false)
    $('.percentage').prop('disabled', false)

    let currentValue = getCurrentValue();

    if( operands.length === 0) {
        return storeAndReset(currentValue, currentValue);
    }



    let finalAnswer = await compute()
    finalAnswer = finalAnswer.toString();
    storeAndReset(finalAnswer, finalAnswer);
    changeBackground();
    return finalAnswer; //returning finalAnswer, a STRING

}


function clickButton() {
  $(".btn").click(async function(event) {
    var thingClicked = this.innerHTML;

    if ($(this).hasClass("operator")) {
      const answer = await addSymbolToAnswer(thingClicked);
      lastBtn = 'operator';
      return answer;
    }

    if ($(this).hasClass("num")) {
      const answer = createNewNumber(thingClicked);
      lastBtn = 'num';
      return answer;
    }

    if ($(this).hasClass("clear")) {
      const answer = allClear();
      lastBtn = 'clear';
      return answer;
    }

    if ($(this).hasClass("cancel")) {
      return cancel()
    }

    if ($(this).hasClass("negative")) {
      const answer = makeCurrentValueNegative()
      lastBtn = 'negative';
      return answer
    }

    if ($(this).hasClass("percentage")) {
      const answer = makeCurrentValuePercentage()
      lastBtn = 'percentage';
      return answer
    }

    if ($(this).hasClass("equals")) {
      let currentValue = getCurrentValue();
      if (isNumeric(currentValue)) {
        operands.push(currentValue);
      }
      const answer = await equals()
      lastBtn = 'equals';
      return answer
    }
  })
}
clickButton()


function replaceOperator(string) {
  string = string.replace("x", "*")
  string = string.replace("<span>*</span>", "x")
  string = string.replace("x<sup>y</sup>", "^")
  string = string.replace("÷", "/")
  return string
}

function compareOperatorOrder(operator1,operator2){
    const operator1order = operatorOrders[operator1];
    const operator2order = operatorOrders[operator2];
    if (operator1order < operator2order){
        return true;
    }
    return false;
}

async function addSymbolToAnswer(string) {
    $('.negative').prop('disabled', true); //disable "+/-" when orange button clicked
    $('.percentage').prop('disabled', true);
    let symbolString = string
    symbolString = replaceOperator(symbolString)
    let currentValue = getCurrentValue()

    if (lastBtn === 'operator'){
        const oldSymbol = operators.pop();
        operators.push(symbolString);
        currentValue = currentValue.slice(0,-(oldSymbol.length))
        return storeAndReset(currentValue+symbolString, currentValue+symbolString)
    }

    if (isNumeric(currentValue)){
        operands.push(currentValue);
    }

    if (operators.length === 0 ) {
        operators.push(symbolString);
        return storeAndReset(symbolString, symbolString)
    }

    if (compareOperatorOrder(symbolString,operators.slice(-1))) {
        operators.push(symbolString);
        return storeAndReset(symbolString, symbolString)
    }

    const answer = await equals();

    operands.push(answer);
    operators.push(symbolString);

    return storeAndReset(answer+symbolString, answer+symbolString)

}


function storeAndReset(newGlobalAnswer, newCurrentValue) {
    storeAnswer(newGlobalAnswer)
    $("#currentValue").html(newCurrentValue)
    changeBackground()
    return newCurrentValue
}


function createNewNumber(string) {
    $('.negative').prop('disabled', false)
    $('.percentage').prop('disabled', false)
    if (lastBtn === 'negative' || lastBtn === 'operator' || lastBtn === 'equals'){
        clearCurrentValue();
    }
    var thingClicked = string;
    var currentValue = getCurrentValue();
    var newString = currentValue + thingClicked; //add into newString
    newString = removeLeadingZero(newString);
    newString = removeLeadingSymbol(newString);
    $("#currentValue").html(newString);
    changeBackground();
    return newString
}



function changeBackground() {
  var currentValue = document.getElementById("currentValue").innerHTML
  if (currentValue === "420") {
    $(document.body).addClass('background-420');
  }
  if (currentValue != "420") {
    $(document.body).removeClass('background-420');
  }
    if (currentValue === "666") {
    $(document.body).addClass('background-666');
  }
  if (currentValue != "666") {
    $(document.body).removeClass('background-666');
  }
    if (currentValue === "1999") {
    $(document.body).addClass('background-1999');
  }
  if (currentValue != "1999") {
    $(document.body).removeClass('background-1999');
  }
}
