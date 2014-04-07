google.load('visualization', '1', {packages:['table']});
//google.showRowNumber(false);

$(document).ready(function() {
    
    var url = "../QuandlQuery/alltickers.json";
    $.getJSON(url, function(file) {
        companyObject = file;   
        makeTable();
    });   
    
    
});

var companyObject;

function makeTable() {
    var data = new google.visualization.DataTable();    
    
    var priceIndex = companyObject.column_names.indexOf('Stock Price');
    var incomeIndex = companyObject.column_names.indexOf('Net Income');
    var betaIndex = companyObject.column_names.indexOf('Value Line Beta');
    var dyIndex = companyObject.column_names.indexOf('Dividend Yield');
    
    data.addColumn('string', 'Name');
    data.addColumn('string', 'Ticker');
    data.addColumn('string', 'Exchange');
    data.addColumn('number', 'Stock Price');
    data.addColumn('number', 'Net Income(in millions)');
    data.addColumn('number', 'Beta');
    data.addColumn('number', 'Dividend Yield');
    
    for(var i in companyObject) {
        if(i != 'column_names') {
            data.addRows([
                [companyObject[i]['name'], companyObject[i]['ticker'], companyObject[i]['exchange'],
                 companyObject[i]['data'][priceIndex], companyObject[i]['data'][incomeIndex],
                 companyObject[i]['data'][betaIndex], companyObject[i]['data'][dyIndex]]            
            ]);
        }
    }

    var table = new google.visualization.Table(document.getElementById('table_div'));
    table.draw(data, {sortColumn: 0}, {sortAscending: true});
    
    google.visualization.events.addListener(table, 'select',
        function(event) {
            var ticker = data.getValue(table.getSelection()[0].row, 1);
            window.location.href = "stock/" + ticker;
    });
    
}