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







$scope.ledger1 = ["test1", "test2", "test3"];
$scope.transactionSeriesList = [];
$scope.clicks = 0;

$scope.testLedger = [1, 2, 3, 4]

var chequing = new Account("Chequing",0);


$scope.transactionSeriesList.push(new transactionSeries("Test Transaction 1", 50, "Chequing", "-", new Date(2015,00,01), new Date(2015,11,31), 4, "2"));
$scope.transactionSeriesList.push(new transactionSeries("Test Transaction 2", 750, "Chequing", "-", new Date(2015,00,01), new Date(2015,11,31), 2, "3"));
$scope.transactionSeriesList.push(new transactionSeries("Test Transaction 3", -100, "Chequing", "-", new Date(2015,00,01), new Date(2015,11,31), 2, "2"));
//$scope.transactionSeriesList.push(new testObj());
$scope.transactionSeriesListValid = [];
$scope.transactionSeriesListChecksums = [];


chequing.apply_transactions($scope.transactionSeriesList);


$scope.ledger = chequing.return_ledger(); //right now this is just the chequing ledger but I need to combine all accounts into a single ledger

/*
$scope.lastTrans = $scope.transactionSeriesList[$scope.transactionSeriesList.length-1];
$scope.transLength = 0;
*/

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
transactionSeries decribes an item of income, expense, or transfer and characteristics of its repitition.
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

		return [new Date(this.currDate), this.account, Number(this.amount) ];
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

*/
function Account(name, balance){
	this.name = name;
	this.balance = balance;
	this.startBalance = balance;
	this.ledger = []; //Ledger is a 2D array of Date | Amount | Account | Balance for all transactions in account


	this.transaction = function(transaction){

		this.ledger.push(transaction);
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

	return this.ledger;

	};

	this.apply_transactions = function(transactionSeriesList){

			this.ledger.length = 0;

			for(x = 0; x < transactionSeriesList.length; x++){
				if( transactionSeriesList[x].isValidSeries() ){
					transactionSeriesList[x].resetSeries();
					console.log("About to update transactions; Checksum = " + transactionSeriesList[x].checksum());
					while(transactionSeriesList[x].currDate.getTime() < transactionSeriesList[x].endDate.getTime()){
						this.transaction(transactionSeriesList[x].curr_transaction());
						transactionSeriesList[x].next();
						console.log("Looping through transaction series " + transactionSeriesList[x].description);
					}

					this.ledger.sort(function(a, b) {
								a = new Date(a[0]);
								b = new Date(b[0]);
								return a>b ? 1 : a<b ? -1 : 0;
						});
          columns = this.ledger[0].length;
					this.ledger[0][columns] = this.startBalance + this.ledger[0][columns - 1];
					for(i = 1; i < this.ledger.length; i++){
						this.ledger[i][columns] = this.ledger[i-1][columns - 1] + this.ledger[i][columns - 1];

					};
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
