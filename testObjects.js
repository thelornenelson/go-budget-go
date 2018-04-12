var test = {};
var dates = ['20110502', '20150607', '20180504'];

for(var i = 0; i < dates.length; i++){
  Object.defineProperty(test, dates[i], { value:['Description', -5], writable:true});

}

console.log(test['20110502']);