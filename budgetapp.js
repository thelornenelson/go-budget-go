var budgetApp = angular.module('budgetApp', ['ui.bootstrap']);

budgetApp.controller('budgetAppCtrl', function($scope, $log) {





// START DATE PICKER

$scope.popupOpen = [];
/*
 $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function() {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };

  $scope.toggleMin();
  $scope.maxDate = new Date(2020, 5, 22);
*/
  $scope.open = function(index, x) {
	if(x == 0){
		$scope.popupOpen[index] = [true,false];
	}
	else $scope.popupOpen[index] = [false,true];
  };

/*
  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
  };
*/
  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
  $scope.altInputFormats = ['M!/d!/yyyy', 'yyyy-M-d', 'yyyy-MM-dd'];

  /*$scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };
*/

/*
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events =
    [
      {
        date: tomorrow,
        status: 'full'
      },
      {
        date: afterTomorrow,
        status: 'partially'
      }
    ];

  $scope.getDayClass = function(date, mode) {
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  };

*/

// END DATE PICKER








$scope.transactionSeriesList = [];
$scope.clicks = 0;


$scope.accounts = ["Chequing", "Savings", "TFSA", "RRSP"];
var chequing = new ledger($scope.accounts);


$scope.transactionSeriesList.push(new transactionSeries("Test Transaction 1", 50, "Chequing", "-", new Date(2015,00,01), new Date(2015,11,31), 4, "2"));
$scope.transactionSeriesList.push(new transactionSeries("Test Transaction 2", 750, "Chequing", "-", new Date(2015,00,01), new Date(2015,11,31), 2, "3"));
$scope.transactionSeriesList.push(new transactionSeries("Test Transaction 3", -100, "Chequing", "TFSA", new Date(2015,00,01), new Date(2015,11,31), 2, "2"));
$scope.transactionSeriesListValid = [];
$scope.transactionSeriesListChecksums = [];


chequing.apply_transactions($scope.transactionSeriesList);


$scope.ledger = chequing.return_ledger();


// output checksums for debugging
for(var x = 0; x < $scope.transactionSeriesList.length; x++){
	$scope.transactionSeriesListChecksums[x] = [$scope.transactionSeriesList[x].description, $scope.transactionSeriesList[x].checksum()];
}



//Watch last item in $scope.transactionSeriesList (which is blank by default). If it becomes valid (ie through user entry), add another blank transactionSeries to the list.
$scope.$watch(function() { return $scope.transactionSeriesList[$scope.transactionSeriesList.length-1].isValidSeries(); }, function(){
		if($scope.transactionSeriesList[$scope.transactionSeriesList.length-1].isValidSeries()){
			console.log("Last item in transactionSeriesList is " + $scope.transactionSeriesList[$scope.transactionSeriesList.length-1].description);
			$scope.transactionSeriesList.push(new transactionSeries(null,null,"Chequing","-",null,null,null,"2"));
			$scope.transLength = $scope.transactionSeriesList.length;
		}
});

//watch checksum of
$scope.$watch(function() {
	var checksums = 0;
	for(var x = 0; x < $scope.transactionSeriesList.length; x++){
		checksums += $scope.transactionSeriesList[x].checksum(); //combine all checksums into one variable for watching
	}
	console.log("checksums = " + checksums);

	return checksums;
},
//this function gets run if checksums changes
function(){
	console.log("Should be applying transactions outside IF"); // not sure why this is here?
	if($scope.transactionSeriesList.length > 0){
		console.log("Should be applying transactions inside IF");
		chequing.apply_transactions($scope.transactionSeriesList);
		$scope.ledger = chequing.return_ledger();

	}
});

//deletes a transactionSeries
$scope.deleteTransactionSeries = function(index){
	if($scope.transactionSeriesList.length > 1){
		$scope.transactionSeriesList.splice(index,1);
	};
}


/*function testObj(description, amount, account, transferAccount, startDate, endDate, frequency, frequencyType){
	this.description = description;
	this.amount = amount;
	this.account = account;
	this.transferAccount = transferAccount;
	this.startDate = startDate;
	this.endDate = endDate;
	this.frequency = frequency;
	this.frequencyType = frequencyType;
}
*/
/*
transactionSeries decribes an item of income, expense, or transfer and characteristics of its repetition.
description is a plain english name for the item, for example "rent" or "paycheque"
amount is the dollar amount of the item
account is the name of the account to which the item applies, or the source account for transfers
transferAccount is the destination account for transfers
startDate is the start date of a repeating item, or the date of the item
endDate is the end date of the repeating item.
frequency is how often the item repeats (ie every [frequency] days, weeks, months, years)
frequencyType is a numeric code for how often the item repeats. 1 = daily, 2 = weekly; 3 = monthly, 4 = annually
*/
function transactionSeries(description, amount, account, transferAccount, startDate, endDate, frequency, frequencyType){
	this.description = description;
	this.amount = amount;
	this.account = account;
	this.transferAccount = transferAccount;
	this.startDate = startDate;
	this.endDate = endDate;
	this.frequency = Math.floor(frequency);
	this.frequencyType = frequencyType; //1 = daily, 2 = weekly; 3 = monthly, 4 = annually
	this.currDate = new Date(startDate);



	this.checksum = function(){
		var checksum = this.description + this.amount + this.account + this.transferAccount;

		if(angular.isDate(this.startDate)){ //prevent null dates from causing issues
			checksum += this.startDate.getTime();
		}
		if(angular.isDate(this.endDate)){ //prevent null dates from causing issues
			checksum += this.endDate.getTime();
		}

		checksum += this.frequency + this.frequencyType;

		return checksum;
	};

	this.resetSeries = function(){
		this.currDate.setTime(this.startDate.getTime());
		this.amount = this.amount;
		this.frequency = Math.floor(this.frequency);

	}

	this.next = function(){

		switch(this.frequencyType) {
			case "1":
				this.currDate.setDate(this.currDate.getDate() + this.frequency);

				break;
			case "2":

				this.currDate.setDate(this.currDate.getDate() + this.frequency*7);

				break;
			case "3":
				this.currDate.setMonth(this.currDate.getMonth() + this.frequency);

				break;
			case "4":
				this.currDate.setFullYear(this.currDate.getFullYear() + this.frequency);

				break;
			default:
				console.log("Error: unrecognized frequencyType");
				break;
		}

	};

	this.curr_transaction = function(){

		return [new Date(this.currDate), this.description, this.account, this.transferAccount, Number(this.amount) ];
	};

	this.isValidSeries = function(){
		var isValid = true;
		if(!angular.isString(this.description)){
				//console.log("Description is not a string [" + series.description + "]");
				isValid = false;
		}
		if(!isFinite(Number(this.amount)) || this.amount == null){
			//console.log("Amount is not a number [" + series.amount + "]");
			isValid = false;
		}
		if(!isFinite(Number(this.frequency)) || this.frequency == null || this.frequency == 0){
			//console.log("Frequency is not a number [" + series.frequency + "]");
			isValid = false;
		}
		if(!angular.isDate(this.startDate) || this.startDate == null){
			isValid = false;
		}
		if(!angular.isDate(this.endDate) || this.endDate == null){
			isValid = false;
		}
		return isValid;
	}
};


/*
Account currently only handles a single accounts and is limited by the object's ledger only storing date, amount, and balance for each transaction.
Doesn't really make sense to have separate objects for each account as it seems to only complicate the interoperation of transactions.
This should be rewritten to handle all accounts within a single object (a Ledger object).

TO DO:

Change account object to a ledger object. Ledger will contain an array of objects. Each object will have properties date (date), endingBalance,
 and transactions (array).
transactions will be an array with length equal to the number of accounts. Each element of the array will be a further array of objects
describing amount and description for each transaction.

*/
function ledger(accounts){

  this.accounts = accounts;
	this.ledgerData = {}; //ledgerData is an object with properties named [getTime()] corresponding to dates when account activity occurs.
                        //XXXXX.transactions = [{description: blah, accounts: [account 1 change, account 2 change, ... , account n change]}, ...]
                        //XXXXX.endBalance = [account 1 balance, account 2 balance, ..., account n balance]
                        //XXXXX.date = JS date

	this.transaction = function(transaction){
    //transaction is an array of format [this.currDate, this.description, this.account, this.transferAccount, Number(this.amount)]

    var currentDay = transaction[0].getTime();

		if(this.ledgerData[currentDay] === undefined) {
      this.ledgerData[currentDay] = {};
      this.ledgerData[currentDay].transactions = [];
      this.ledgerData[currentDay].date = transaction[0];
    }
    this.ledgerData[currentDay].transactions.push({description: transaction[1], accounts: []});
    var currentTransaction = this.ledgerData[currentDay].transactions.length - 1;
    this.ledgerData[currentDay].transactions[currentTransaction].accounts.length = this.accounts.length;
    this.ledgerData[currentDay].transactions[currentTransaction].accounts[this.accounts.indexOf(transaction[2])] = transaction[5];
    if(transaction[3] != "-"){
      this.ledgerData[currentDay].transactions[currentTransaction].accounts[this.accounts.indexOf(transaction[3])] = transaction[5] * -1;
    }
		console.log("pushing " + transaction + " to this.ledger");



	};

	this.show_ledger = function(){



		var y = 0;
		var x = 0;

		 while(y < this.ledger.length ){
			while(x < this.ledger[y].length ){
				//document.write(this.ledger[y][x] + " | ");
				x += 1;
			}
			//document.write("<br>");
			x = 0;
			y +=1;
		}

	};

	this.return_ledger = function(){

	return this.ledgerData;

	};

	this.apply_transactions = function(transactionSeriesList){

			this.ledgerData = {};

			for(x = 0; x < transactionSeriesList.length; x++){
				if( transactionSeriesList[x].isValidSeries() ){
					transactionSeriesList[x].resetSeries();
					console.log("About to update transactions; Checksum = " + transactionSeriesList[x].checksum());
          //while loop iterates through transaction series and
					while(transactionSeriesList[x].currDate.getTime() < transactionSeriesList[x].endDate.getTime()){
						this.transaction(transactionSeriesList[x].curr_transaction());
						transactionSeriesList[x].next();
						console.log("Looping through transaction series " + transactionSeriesList[x].description);
					}





				}
			};

	};


};




//var chequing = new Account(0);
//var until_date = new Date(2018,0,1);
/*
var test_transaction = [];
test_transaction.push( new TransactionSeries(5000, new Date(2016, 01, 01), 2, 2) ); //$5000, biweekly
test_transaction.push( new TransactionSeries(-350, new Date(2016, 01, 01), 1, 3)); //-350, monthly
test_transaction.push( new TransactionSeries(-150, new Date(2016, 01, 01), 1, 2)); //-350, monthly
*/




//chequing.show_ledger();



}); //budgetApp.controller
