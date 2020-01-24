var budgetController = (function(){

    var Expense = function(ID, desc, value){
        this.ID = ID;
        this.desc = desc;
        this.value = value;
    }

    var Income = function(ID, desc, value){
        this.ID = ID;
        this.desc = desc;
        this.value = value;
    }

    var data = {
        totalItems : {
            exp : [],
            inc : []
        },
        totalExpense : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    }

    var calculateTotal = function(type){
        var sum = 0
        data.totalItems[type].forEach(function(cur) {
            sum = sum + cur.value
        });
        console.log('sum: '+sum)
        data.totalExpense[type] = sum
    }

    return {
        addItems: function(type, desc, value){
            var newItem, ID
            if(data.totalItems[type].length > 0){
                var len = data.totalItems['inc']
                var itemArr = data
                console.log('len '+len+'itemArr '+itemArr)
                ID = data.totalItems[type][data.totalItems[type].length - 1 ].ID + 1
            }    
            else    
                ID = 0
            if(type === 'inc')
                newItem = new Income(ID, desc, value)
            else if(type === 'exp')
                newItem = new Expense(ID, desc, value)

            data.totalItems[type].push(newItem)
            return newItem
        },

        removeItems : function (type,id){
            var ids,index
            ids = data.totalItems[type].map(
                (current) => {
                    return current.ID
                }
            )
            index = ids.indexOf(id)
            if(index !== -1){
                data.totalItems[type].splice(index,1) //(postiton of the item to delete, no of items to delete)
            }
        },

        testing : function(){
            console.log('exp arr',data.totalItems['exp'])
            console.log('inc arr',data.totalItems['inc'])
        },
        budget : function () {
            calculateTotal('inc')
            calculateTotal('exp')
           
            data.budget = data.totalExpense.inc - data.totalExpense.exp
            if(data.totalExpense.inc > 0)
                data.percentage = Math.round((data.totalExpense.exp / data.totalExpense.inc) * 100)
        },
        budgetValue : function(){
            return {
                budget : data.budget,
                totalInc : data.totalExpense.inc,
                totalExp : data.totalExpense.exp,
                percentage : data.percentage
            }
        }
    }
})()

var UIController = (function(){
    DomStrings={
        type : '.add__type',
        description:'.add__description',
        value:'.add__value'
    }
    return {
         getInput : function(){
            return {
                inputType : document.querySelector(DomStrings.type).value,
                inputDesc : document.querySelector(DomStrings.description).value,
                inputVal : parseFloat(document.querySelector(DomStrings.value).value)
            }
        },

        replaceHtml : function(obj, type) {
            var html, newHtml, element;
            if(type === 'inc'){
                element = '.income__list';
                html = '<div class="item clearfix" id="inc-%id%">'+
                '<div class="item__description">%description%</div> '+
                '<div class="right clearfix"><div class="item__value">%value%</div>'+
                '<div class="item__delete"><button class="item__delete--btn">'+
                '<i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if (type === 'exp'){
                element ='.expenses__list';
                html = '<div class="item clearfix" id="exp-%id%">'+
                '<div class="item__description">%description%</div> '+
                '<div class="right clearfix"><div class="item__value">%value%</div>'+
                '<div class="item__percentage">21%</div>'+
                '<div class="item__delete"><button class="item__delete--btn">'+
                '<i class="ion-ios-close-outline"></i></button></div></div></div>'
            } 
            newHtml = html.replace('%id%',obj.ID)
            newHtml = newHtml.replace('%description%',obj.desc)
            newHtml = newHtml.replace('%value%',obj.value)

            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml)
            this.clearFields()
        },

        clearFields : function(){
            console.log('inside clear')
            var fields, fieldsArr
            fields = document.querySelectorAll(DomStrings.description +', '+DomStrings.value)
            fieldsArr = Array.prototype.slice.call(fields)
            fieldsArr.map(
                (current) => {
                    return (current.value = '')
                }
            )
            fieldsArr[0].focus()
        },
        display : function(obj){
            document.querySelector('.budget__value').textContent = obj.budget,
            document.querySelector('.budget__income--value').textContent = obj.totalInc,
            document.querySelector('.budget__expenses--value').textContent = obj.totalExp
            if(obj.percentage > 0){
                document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + '%'
            } else {
                document.querySelector('.budget__expenses--percentage').textContent = '---' + '%'
            }  
        },

        deleteListItem : function(itemId){
            var el = document.getElementById(itemId)
            el.parentElement.removeChild(el)
        }
    }
})()

var controller = (function(bdgtCntrl,UICntrl){

    var applicationStart = function(){
        document.querySelector('.add__btn').addEventListener('click', addVal)
        document.addEventListener('keypress',function(){
            if(event.keyCode === 13 || event.which === 13){
                addVal()
            }
        })
        document.querySelector('.container').addEventListener('click',deleteItem)
    }

    var updateBudget = function(){
        // 1. Calculate the budget
        budgetController.budget()
        // 2. Return the budget
        var budgetVal = budgetController.budgetValue()
        console.log('budgetVal: '+budgetVal)
        //3. Display the budget on the UI
        UIController.display(budgetVal)
    }

    var addVal = function(){
        // 1. get the user input
        var userInput = UIController.getInput()

        if(userInput.inputDesc !== '' && userInput.inputVal > 0){
            //2. add the items to budget controller
            var newItem = budgetController.addItems(userInput.inputType, userInput.inputDesc, userInput.inputVal)

            //3. show it up in the UI
            UIController.replaceHtml(newItem,userInput.inputType)

            //4.
            updateBudget()


        }
        
    }

    var deleteItem = function(event) {
        var itemID, splitID, type, ID
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id
        if(itemID){
            splitID = itemID.split('-')
            type = splitID[0]
            ID = parseInt(splitID[1])
        }
        budgetController.removeItems(type,ID)
        UIController.deleteListItem(itemID)
        updateBudget()
    }
    
    return {
       init : function(){
        console.log("Application started!!")
        applicationStart();
        UIController.display({
            budget : 0,
            totalInc : 0,
            totalExp : 0,
            percentage : -1
        });
       } 
    }
})(budgetController,UIController)

controller.init();