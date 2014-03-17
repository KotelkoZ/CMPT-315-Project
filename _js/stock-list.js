google.load('visualization', '1', {packages:['table']});
//google.showRowNumber(false);

$(document).ready(function() {
    
    var url = "./QuandlQuery/alltickers.json";
    var a = 0;
    $.getJSON(url, function(file) {
        companyObject = file;   
        makeTable();
    });   
    
    
});

var companyObject;

function makeTable() {
    console.log(companyObject);
    var url = "../QuandlQuery/alltickers.json";
    var data = new google.visualization.DataTable();    
    
    data.addColumn('string', 'Name');
    data.addColumn('string', 'Ticker');
    data.addColumn('string', 'Exchange');
    //data.addColumn('number', 'Stock Price');
    
    for(var i in companyObject) {
        data.addRows([
            [companyObject[i]['name'], companyObject[i]['ticker'], companyObject[i]['exchange']]            
        ]);
    }

    var table = new google.visualization.Table(document.getElementById('table_div'));
    table.draw(data, {showRowNumber: true});
    
}