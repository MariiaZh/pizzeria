let main = document.querySelector("main"),
    table = document.querySelector(".orderList"),
    form = document.querySelector("form"),
    checkout = document.querySelector("input[type='submit']"),
    pattern = /[+]38[(]0[0-9]{2}[)][0-9]{3}-[0-9]{2}-[0-9]{2}/;

let pizza = document.querySelectorAll(".pizza"),
    order = document.getElementById("cart"),
    summ = document.querySelector(".summ"),
    tBody = table.querySelector("tbody"),
    tFoot = table.querySelector("tfoot").rows[0].cells[0],
    goPay = document.querySelector(".goPay"),
    goPizza = document.querySelector(".goPizza"),
    // 1.хранение строк заказа 2. счетчик строк заказа 
    trList = [],
    countLine = -1;

//1.общая сумма заказа 2.флажок для проверки наличия строки общей суммы заказа 3.флажок проверки удаления строки
let totalSum = 0;
let flag = true;
//remover = true;

//1. выбранный размер пиццы 2. выбранные ингридинеты 3.массив списка заказанных пицц 4. временная переменная, которая содержит индекс элемента массива currentPizzaArray
let pizzaCurrentSizeArray = [],
    ingredArray = [],
    currentPizzaArray = [],
    temporary = -1;

// 1.коллекция кнопок удаления из заказа вида пиццы 2.коллекция input изменения количества пицц
let btnResetArr = [],
    countQuantityArr = [];

function $(parent, selector) {
    return parent.querySelectorAll(selector);
}

class Pizza {
    constructor(picture, name, consist, small, middle, big) {
        this.picture = picture;
        this.name = name;
        this.consist = consist;
        this.small = small;
        this.middle = middle;
        this.big = big;
    }

    getSizeName(a) {
        switch (a) {
            case this.small: return "s";
            case this.middle: return "m";
            case this.big: return "b";
            default: return "m";
        }
    }
}

class ClientPizza {
    constructor(name, size, piece = 1, price, mushrooms = ["mushrooms", false], bacon = ["bacon", false], tomatoes = ["tomatoes", false], cheese = ["cheese", false], olives = ["olives", false]) {
        this.name = name;
        this.size = size;
        this.piece = piece;
        this.price = price;

        this.mushrooms = mushrooms;
        this.bacon = bacon;
        this.tomatoes = tomatoes;
        this.cheese = cheese;
        this.olives = olives;
    }

    getIngredArr(ingr) {
        let bool;
        if (ingr.checked) {
            bool = true;
        } else {
            bool = false;
        }
        return [ingr.value, bool];
    }

    getPizzasTotalPrice() {
        return this.piece * this.price;
    }

    getPizzaAdditions() {
        let arr = [this.mushrooms, this.bacon, this.tomatoes, this.cheese, this.olives];

        let txt = '';

        for (let i = 0; i < arr.length; i++) {
            if (arr[i][1]) {
                if (txt.length == 0) {
                    txt = arr[i][0];
                } else {
                    txt += ", " + arr[i][0];
                }
            }
        }
        if (txt.length == 0) {
            return "-";
        } else {
            return txt;
        }
    }

    getPizzaNoteLine() {
        getRow();

        let tdLine = trList[countLine].querySelectorAll("td");
        let btnReset, countQuantity;

        createBtn(btnReset, "button", String.fromCharCode("10006"), "reset", btnResetArr);
        createBtn(countQuantity, "number", this.piece, "countQuantity", countQuantityArr);

        tdLine[0].innerHTML = this.name;
        tdLine[1].innerHTML = this.size;
        tdLine[2].innerHTML = this.getPizzaAdditions();
        tdLine[3].append(countQuantityArr[countQuantityArr.length - 1]);
        tdLine[4].innerHTML = this.getPizzasTotalPrice();
        tdLine[5].append(btnResetArr[btnResetArr.length - 1]);
    }
}

function createBtn(inpName, inpType, inpVal, inpStyle, inpArr) {
    inpName = document.createElement("input");
    inpName.setAttribute("type", inpType);
    inpName.setAttribute("value", inpVal);
    if (inpType == "number") {
        inpName.setAttribute("min", "0");
        inpName.setAttribute("max", "100");
    }
    inpName.classList.add(inpStyle);
    inpArr.push(inpName);
}

let margarita = new Pizza("img/Маргарита_300dpi-min-thumbnail-960x960-70.jpg", "Margarita", "tomato sauce, mozzarella, basil", 100, 130, 150, false),
    pepperoni = new Pizza("img/Пепперони_300dpi-min-thumbnail-960x960-70.jpg", "Pepperoni", "BBQ sauce, mozzarella, pepperoni, tomatoes", 120, 150, 170, false),
    hawaiian = new Pizza("img/Гавайська_300dpi-min-thumbnail-960x960-70.jpg", "Hawaiian", "chicken, tomato sauce, mozzarella, pineapple", 125, 155, 175, false),
    texas = new Pizza("img/Техас_300dpi-min-thumbnail-960x960-70.jpg", "Texas", "bavarian sausages, BBQ sauce, corn, mozzarella, mushrooms, onion", 130, 160, 180, false);

let pizzaType = [margarita, pepperoni, hawaiian, texas];

window.onload = function () {

    order.innerHTML = totalSum;

    for (let i = 0; i < pizza.length; i++) {

        pizza[i].querySelector("img").src = pizzaType[i].picture;
        pizza[i].querySelector("img").alt = pizzaType[i].name;
        pizza[i].querySelector("h1").innerHTML = pizzaType[i].name;
        pizza[i].querySelector("h5").innerHTML = pizzaType[i].consist;
        pizza[i].querySelector(".calculate").innerHTML = pizzaType[i].middle;

        let size = $(pizza[i], ".size"),
            ingred = $(pizza[i], "input[type='checkbox']"),
            sum = pizza[i].querySelector(".calculate"),
            cart = pizza[i].querySelector("input[type='button']"),
            quantity = pizza[i].querySelector("input[type='number']");

        ingredArray[i] = 0;
        pizzaCurrentSizeArray[i] = pizzaType[i].middle;

        for (let j = 0; j < size.length; j++) {

            // обработчик события на сравнения размеров пиццы

            size[j].addEventListener("click", () => {

                let str = size[j].innerHTML.toLowerCase();
                pizzaCurrentSizeArray[i] = pizzaType[i][str];

                if (compareCells(pizzaType[i], pizzaCurrentSizeArray[i], getAdditions(ingred))) {
                    trList[temporary].children[4].innerHTML = currentPizzaArray[temporary].piece;
                    showQuantity(cart, quantity);
                    summ.innerHTML = getTotalSum();
                    sum.innerHTML = currentPizzaArray[temporary].getPizzasTotalPrice();
                    addClass(size, j);
                } else {
                    addClass(size, j);
                    pizzaCurrentSizeArray[i] = changePizzaCost(size[j], pizzaType[i], pizzaCurrentSizeArray[i]);
                    countPizzaCost(pizzaCurrentSizeArray[i], ingredArray[i], sum);
                    showCart(cart, quantity);
                }
            });
        }

        // добавление обработчика событий на изменение ингредиентов
        for (let j = 0; j < ingred.length; j++) {
            ingred[j].addEventListener("change", () => {

                if (compareCells(pizzaType[i], pizzaCurrentSizeArray[i], getAdditions(ingred))) {
                    ingredArray[i] = changeIngredSumm(ingred);
                    countPizzaCost(pizzaCurrentSizeArray[i], changeIngredSumm(ingred), sum);
                    quantity.value = currentPizzaArray[temporary].piece;
                    showQuantity(cart, quantity);
                } else {
                    ingredArray[i] = changeIngredSumm(ingred);
                    countPizzaCost(pizzaCurrentSizeArray[i], changeIngredSumm(ingred), sum);
                    showCart(cart, quantity);
                }
            });
        }

        // кнопка, добавляет в список заказа выбранную пиццу
        cart.addEventListener("click", function () {
            if (compareCells(pizzaType[i], pizzaCurrentSizeArray[i], getAdditions(ingred))) {
                currentPizzaArray[temporary].piece = currentPizzaArray[temporary].piece + 1;
                quantity.value = currentPizzaArray[temporary].piece;
                trList[temporary].children[4].innerHTML = currentPizzaArray[temporary].piece;
                showQuantity(cart, quantity);
                summ.innerHTML = getTotalSum();
                sum.innerHTML = currentPizzaArray[temporary].getPizzasTotalPrice();
            } else {
                addToOrder(pizzaType[i], pizzaType[i].getSizeName(pizzaCurrentSizeArray[i]), ingred, Number(sum.innerHTML));
                quantity.value = 1;
                showQuantity(cart, quantity);
                summ.innerHTML = getTotalSum();
            }
        });

        // изменение количества одинаковых пицц в заказе
        quantity.addEventListener("change", function () {
            if (compareCells(pizzaType[i], pizzaCurrentSizeArray[i], getAdditions(ingred))) {
                if (quantity.value > 0) {
                    currentPizzaArray[temporary].piece = Number(quantity.value);
                    countQuantityArr[temporary].value = currentPizzaArray[temporary].piece;
                    trList[temporary].children[4].innerHTML = currentPizzaArray[temporary].getPizzasTotalPrice();
                    summ.innerHTML = getTotalSum();
                    sum.innerHTML = currentPizzaArray[temporary].getPizzasTotalPrice();
                } else {
                    showCart(cart, quantity);
                    currentPizzaArray.splice(temporary, 1);
                    countQuantityArr.splice(temporary, 1);
                    trList[temporary].remove();
                    trList.splice(temporary, 1);
                    countLine--;
                    summ.innerHTML = getTotalSum();
                }
            } else {
                showCart(cart, quantity);
                summ.innerHTML = getTotalSum();
                countPizzaCost(pizzaCurrentSizeArray[i], changeIngredSumm(ingred), sum);
            }
        });
    }

    goPay.addEventListener("click", changeSpaceOn);
    goPizza.addEventListener("click", changeSpaceOff);

    checkout.addEventListener("click", (e) => {
        if (getTotalSum() > 0) {
            let valid = new Array(5);
            for (let i = 0; i < form.elements.length; i++) {
                if (i != 4 && !(form.elements[i].value.length > 0)) {
                    e.preventDefault();
                    alert("Enter correct data!");
                    break;
                } else if (i == 4 && !(pattern.exec(form.elements[4].value))) {
                    alert("Enter correct data!");
                    e.preventDefault();
                    break;
                } else {
                    valid[i] = true;
                }
            }

            if (valid[0] && valid[1] && valid[2] && valid[3] && valid[4]) {
                alert("Your order is completed! Wait for delivery in 45 minutes.");
            }
        } else {
            alert("You haven't choosen any pizza!");
        }
    })
}

function initCounter() {

    for (let i = 0; i < countQuantityArr.length; i++) {

        countQuantityArr[i].addEventListener("change", function () {
            currentPizzaArray[i].piece = Number(countQuantityArr[i].value);
            trList[i].children[4].innerHTML = currentPizzaArray[i].getPizzasTotalPrice();
            summ.innerHTML = getTotalSum();
            tFoot.innerHTML = "Total price: " + getTotalSum();
        })
    }
}

//удаление строчки из списка заказа
function initResetBtn() {

    for (let i = 0; i < btnResetArr.length; i++) {

        btnResetArr[i].addEventListener("click", function () {

            let btn = this;
            let index = btn.parentNode.parentNode.rowIndex - 1;

            trList.splice(index, 1);
            currentPizzaArray.splice(index, 1);
            countQuantityArr.splice(index, 1);
            btn.parentNode.parentNode.remove();
            summ.innerHTML = getTotalSum();
            countLine--;

            if (countLine > 0) {
                tFoot.innerHTML = "Total price: " + getTotalSum();
            } else {
                tFoot.innerHTML = "Please, order something tasty!"
            }
        });
    }
}

//пересчет общей суммы заказа

function getTotalSum() {

    let total = 0;
    for (let note = 0; note < currentPizzaArray.length; note++) {
        total += currentPizzaArray[note].getPizzasTotalPrice();
    }
    return total;
}

// сравнение текущей пиццы с теми, которые записаны в заказ
function compareCells(piz, siz, ing) {
    for (let note = 0; note < currentPizzaArray.length; note++) {
        if (currentPizzaArray[note].name == piz.name
            && currentPizzaArray[note].size == piz.getSizeName(siz)
            && currentPizzaArray[note].getPizzaAdditions() == ing) {
            temporary = note;
            return true;
        }
    }
    temporary = -1;
    return false;
}

function showQuantity(cart, quantity) {
    cart.classList.add("hidden");
    quantity.classList.remove("hidden");
};

function showCart(cart, quantity) {
    cart.classList.remove("hidden");
    quantity.classList.add("hidden");
}

function addToOrder(pizza, size, ingred, sum) {
    let currentPizza = new ClientPizza(pizza.name, size, 1, sum);
    for (let i = 0; i < ingred.length; i++) {
        currentPizza[ingred[i].value] = currentPizza.getIngredArr(ingred[i]);
    }
    currentPizza.getPizzaNoteLine();
    currentPizzaArray.push(currentPizza);
}

function getRow() {
    countLine++;
    let tr = document.createElement("tr");
    tBody.append(tr);
    for (let index = 0; index < 6; index++) {
        let td = document.createElement("td");
        tr.append(td);
    }
    trList.push(tr);
}

function getAdditions(ingred) {

    let txt = '';
    for (let i = 0; i < ingred.length; i++) {
        if (ingred[i].checked) {
            if (txt.length == 0) {
                txt = ingred[i].value;
            } else {
                txt += ", " + ingred[i].value;
            }
        }
    }
    if (txt.length == 0) {
        return "-";
    } else {
        return txt;
    }
}

function changePizzaCost(sizeElem, pizzaArray, pizzaSize) {
    switch (sizeElem.innerHTML) {
        case "Small": pizzaSize = pizzaArray.small;
            break;
        case "Middle": pizzaSize = pizzaArray.middle;
            break;
        case "Big": pizzaSize = pizzaArray.big;
            break;
    }
    return pizzaSize;
};

function changeIngredSumm(elem) {
    let cost = 0;
    for (let i = 0; i < elem.length; i++) {
        if (elem[i].checked) {
            cost += 20;
        }
    }
    return cost;
}

function countPizzaCost(piz, ingr, sum) {
    sum.innerHTML = piz + ingr;
}

function addClass(elem, num) {
    for (let i = 0; i < elem.length; i++) {
        if (i == num) {
            elem[i].classList.add("choice");
        } else {
            elem[i].classList.remove("choice");
        }
    }
}

function changeSpaceOn() {
    main.classList.add('hidden');
    table.classList.remove('hidden');
    form.classList.remove("hidden");
    goPay.classList.add('hidden');
    goPizza.classList.remove('hidden');
    initResetBtn();
    initCounter();
    countLine++;
    tFoot.innerHTML = "Total price: " + getTotalSum();
}

function changeSpaceOff() {
    main.classList.remove('hidden');
    table.classList.add('hidden');
    form.classList.add("hidden");
    goPay.classList.remove('hidden');
    goPizza.classList.add('hidden');

    for (let i = 0; i < pizza.length; i++) {

        let cart = pizza[i].querySelector("input[type='button']"),
            quantity = pizza[i].querySelector("input[type='number']");
        showCart(cart, quantity);
        pizza[i].querySelector(".calculate").innerHTML = pizzaType[i].middle;

        let size = pizza[i].querySelectorAll(".size");
        addClass(size, 1);

        document.querySelector("details").removeAttribute("open");
        let ingred = $(pizza[i], "input[type='checkbox']");
        for (let j = 0; j < ingred.length; j++) {
            ingred[j].checked = false;
        }
    }
};