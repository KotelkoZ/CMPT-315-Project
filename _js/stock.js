
var companies = {};
            
google.load('visualization', '1', {'packages':['annotatedtimeline']});
google.setOnLoadCallback();
            
$(document).ready(function() {
    var i = document.URL.indexOf('/stock/');
    getData(document.URL.slice(i + 7), function(column_names) {
        // Put the column_names into the combo box.
        var combo = document.getElementById('combo');
        for (var i = 1; i < column_names.length; i++) {
            combo.innerHTML += '<option>' + column_names[i] + '</option>';
        }
        makeChart();
    });
});  
            
function makeChart() {
    var data = new google.visualization.DataTable();
                    
    // Add a date column to the chart, then a column for each company in companies map.
    data.addColumn('date', 'Date');
    for (var i = Object.keys(companies).length - 1; i >= 0; i--) {
        data.addColumn('number', Object.keys(companies)[i]);
    }
                    
    // find the company with the oldest data
    var oldestDate = maxCompany(companies);
    var oldestYear = new Date(oldestDate).getFullYear();
                    
    var rows = [];
                
    var mainTicker = document.getElementById('ticker_title').value;
    for (var i = 2014; i >= oldestYear; i--) {
        // Starting at the current year, go backwards through time. For each year, loop through the companies map, 
        // and for each company, if there is an entry for that year, add it.
        var rowEntry = [new Date(i, 11, 31)];
                    
        for (var j = Object.keys(companies).length - 1; j >= 0; j--) {
            var company_name = Object.keys(companies)[j];
                        
            var entry = null;
            for (var index in companies[company_name]["data"]) {
                if (new Date(companies[company_name]["data"][index][0]).getFullYear() === i) {
                    var ind = companies[company_name]["column_names"].indexOf(document.getElementById('combo').value);
                    entry = companies[company_name]["data"][index][ind];
                                
                }
            }
            rowEntry.push(entry);
        }
        rows.push(rowEntry);
    }
    data.addRows(rows);
                    
    var options = {
        displayZoomButtons: false,
        fill: 4,
        thickness: 2
    }
                    
    var chart = new google.visualization.AnnotatedTimeLine(document.getElementById('stock_chart_div'));
    chart.draw(data, options);
}
            
function maxCompany(companies) {
    // Return the name of the company in the companies map that has the most years of data.
    var compName = undefined;
    var oldestDate = new Date();
    for (var name in companies) {
        var compData = companies[name]["data"];
        var compDate = new Date(compData[compData.length - 1][0]);
        if (compDate < oldestDate) {
            oldestDate = compDate;
            compName = name;
        }
    }
    return oldestDate;
}
            
function getData(path, callback) {
    // get the JSON file from quandl.
    if (path == "")
        return;
                
    var url = "../QuandlQuery/tickers/" + path + ".json";
                
    $.getJSON(url, function(company) {
        if (company.error === undefined) {
            var name = company["name"].split(" - ")[0];
            var column_names = company.column_names;
            var data = company.data;
            companies[name] = {"column_names":column_names, "data":data};
                        
            if (Object.keys(companies).length == 1) {
                // Set the title to the name of the company that the page was called with.
                document.getElementById('ticker_title').innerHTML = name;
            }
                        
            // make the callback.
            callback(company.column_names);
        } else {
            // no results for the query
        }
    });
}
            
function addCompareTicker() {
    var ticker = document.getElementById('compareBox').value;
    if (ticker) {
        getData(ticker, makeChart);
        document.getElementById('compareBox').value = "";
    }
}
            
function search(term) {
    term = term || document.getElementById('searchBox').value;
    if (term)
        window.location.href = "stock/" + term;
}