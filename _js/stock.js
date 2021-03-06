
var companies = {};
var companiesDaily = {};
var allTickers;
var calledCompany;
var priceCode;
var p;
            
google.load('visualization', '1', {'packages':['annotatedtimeline']});
google.load('visualization', '1', {packages:['table']});
            
$(document).ready(function() {    
                
    $.getJSON('../QuandlQuery/alltickers.json', function(data) {
        allTickers = data;
        var i = document.URL.indexOf('/stock/');
        getData(document.URL.slice(i + 7), function(column_names) {
            // Put the column_names into the combo box.
            var combo = document.getElementById('combo');
            // Add entries of open
            combo.innerHTML += '<option>Open</option><option>High</option><option>Low</option><option>Close</option>';
            // Add entries for all returned quandl fields.
            for (var i = 1; i < column_names.length; i++) {
                combo.innerHTML += '<option>' + column_names[i] + '</option>';
            }
            makeChart();
        });

        $(function() {
            $('#right_column').tooltip();
        });
    });    
    
}); 

    
     

function makeChart() {
    console.log(companiesDaily);
    var data = new google.visualization.DataTable();
    var rows = [];
    
    // Add a date column to the chart, then a column for each company in companies map.
    data.addColumn('date', 'Date');
    for (var i = Object.keys(companies).length - 1; i >= 0; i--) {
        data.addColumn('number', Object.keys(companies)[i]);
    }
    
    var val = document.getElementById('combo').value;
    
    if (val === 'Open' || val === 'High' || val === 'Low' || val === 'Close') {
        var index;
        switch (val) {
            case 'Open':
                index = 1;
                break;
            case 'High':
                index = 2;
                break;
            case 'Low':
                index = 3;
                break;
            case 'Close':
                index = 4;
                break;
        }
        
        for (var i = 0; true; i++) {
            var mainComp = companiesDaily[calledCompany];
            var day = mainComp.data[i];
            var date = new Date(day[0]);
            
            var today = new Date();
            var lastyear = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
            
            if (date < lastyear) {
                break;
            }
            
            var rowEntry = [new Date(day[0])];
            
            for (var j = Object.keys(companies).length - 1; j >= 0; j--) {
                var company = companiesDaily[Object.keys(companiesDaily)[j]];
                if (company) {
                    rowEntry.push(company['data'][i][index]);
                } else {
                    rowEntry.push(null);
                }
            } 
            console.log(rowEntry);
            rows.push(rowEntry);
        }
    } else {         
    // find the company with the oldest data
    var oldestDate = maxCompany(companies);
    var oldestYear = new Date(oldestDate).getFullYear();
                    
    //var rows = [];
                
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
        if (!emptyRow(rowEntry)) {
            // don't add a row if it's all null entries.
            rows.push(rowEntry);
        }
    }
        
    //data.addRows(rows);
        
    }
    
    data.addRows(rows);
              
    var height = $('#right_column').height();
    var width = $('#right_column').width();
    
    var colors = ['blue'];
    switch (Object.keys(companies).length) {
        case 1:
            colors = ['blue'];
            break;
        case 2:
            colors = ['red','blue'];
            break;
            
        case 3:
            colors = ['orange','red','blue'];
            break;
    }
    
    var timelineoptions = {
        displayZoomButtons: false,
        fill: 4,
        thickness: 2,
        colors: colors
    }
    var tableoptions = {
        showRowNumber: false,
        height: (height - 5).toString(),
        width: width.toString(),
        sort: 'event',
        alternatingRowStyle: false,
        cssClassNames: { hoverTableRow: 'highlightClass', selectedTableRow: 'selectedRow', headerCell: 'headercell' }
    }
                    
    var chart = new google.visualization.AnnotatedTimeLine(document.getElementById('stock_chart_div'));
    chart.draw(data, timelineoptions);
    
    var table = new google.visualization.Table(document.getElementById('table_div'));
    table.draw(data, tableoptions);
    
    google.visualization.events.addListener(chart, 'rangechange', makeSelections);
    google.visualization.events.addListener(chart, 'ready', makeSelections);
    
    google.visualization.events.addListener(table, 'sort', function (evt) {
        // Delete the ticker from the comparison when the company is clicked in the table
        var company = data.getColumnLabel(evt.column);
        
        if (company === 'Date') {
        } else if (company !== calledCompany) {
            delete companies[company];
            delete companiesDaily[company];
            makeChart();
        } else {
            $('#error').text('Cannot remove ' + calledCompany + ' from comparison.');
            setTimeout(function () {
                $('#error').text('');
            }, 3000);
        }
    });
    
    function makeSelections() {
        var range = chart.getVisibleChartRange();
        var start = Date.parse(range.start);
        var end = Date.parse(range.end);
        var a = [];
        
        for (var i = 0; i < data.getNumberOfRows(); i++) {
            var date = data.getValue(i, 0);
            
            // have to add by two because child numbers start at 1. and since we dont want to select the head line,
            // the first data row is row 2.
            var rowInd = i + 2;
            
            $('tbody  tr:nth-child(' + rowInd + ')').removeClass('google-visualization-table-tr-even');
            
            if (date >= start && date <= end) {
                switch (Object.keys(companies).length) {
                    case 1:
                        $('tr:nth-child(' + rowInd + ') td:nth-child(2)').addClass('blue_column');
                        break;
                    case 2:
                        $('tr:nth-child(' + rowInd + ') td:nth-child(2)').addClass('red_column');
                        $('tr:nth-child(' + rowInd + ') td:nth-child(3)').addClass('blue_column');
                        break;
                    case 3: 
                        $('tr:nth-child(' + rowInd + ') td:nth-child(2)').addClass('orange_column');
                        $('tr:nth-child(' + rowInd + ') td:nth-child(3)').addClass('red_column');
                        $('tr:nth-child(' + rowInd + ') td:nth-child(4)').addClass('blue_column');
                        break;
                }
                
            } else {
                switch (Object.keys(companies).length) {
                    case 1:
                        $('tr:nth-child(' + rowInd + ') td:nth-child(2)').removeClass('blue_column');
                        break;
                    case 2:
                        $('tr:nth-child(' + rowInd + ') td:nth-child(2)').removeClass('red_column');
                        $('tr:nth-child(' + rowInd + ') td:nth-child(3)').removeClass('blue_column');
                        break;
                    case 3: 
                        $('tr:nth-child(' + rowInd + ') td:nth-child(2)').removeClass('orange_column');
                        $('tr:nth-child(' + rowInd + ') td:nth-child(3)').removeClass('red_column');
                        $('tr:nth-child(' + rowInd + ') td:nth-child(4)').removeClass('blue_column');
                        break;
                }
            }
        }
    }
    
    function emptyRow(row) {
        for (var i = 1; i < row.length; i++) {
            if (row[i] !== null) {
                return false;
            }
        }
        return true;
    }
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
    var url = "http://www.quandl.com/api/v1/datasets/DMDRN/" + path.toUpperCase() + "_ALLFINANCIALRATIOS.json?auth_token=iT1LrBo1Uw79uqJfrKyb";          
    $.getJSON(url, function(company) {
        var name = company["name"].split(" - ")[0].replace('( ','(').replace(' )',')');
        //name = name + ' - ';
        var column_names = company.column_names;
        var data = company.data;
        companies[name] = {"column_names":column_names, "data":data};
                        
        getPriceData(callback, company);
                       
    }).fail(function () {
            // no results for the query
        if (Object.keys(companies).length === 0) {
            console.log('ok');
            document.getElementById('ticker_title').innerHTML = 'Cannot find ticker ' + path + '.';
        } else {
            $('#error').text('Cannot find ticker ' + path + '.');
            setTimeout(function () {
                $('#error').text('');
            }, 3000);
        }
        
    });
    
    function getPriceData (callback, company) {
        var name = company["name"].split(" - ")[0].replace('( ','(').replace(' )',')');
        
        if (!allTickers[path.toUpperCase()]) {
            companiesDaily[name] = undefined;
            return callback(company.column_names);
        }
        
        var priceCode = allTickers[path.toUpperCase()]['price code'];
        priceCode = priceCode.toUpperCase();
        
        url = "http://www.quandl.com/api/v1/datasets/" + priceCode + ".json?auth_token=iT1LrBo1Uw79uqJfrKyb";
        $.getJSON(url, function(data) {
            //var name = company["name"].split(" - ")[0].replace('( ','(').replace(' )',')');
            companiesDaily[name] = data;
            
            if (Object.keys(companiesDaily).length == 1) {
                // Set the title to the name of the company that the page was called with.
                calledCompany = name;
                
                var todayClose = data['data'][0][4];
                var yesterdayClose = data['data'][1][4];
                
                document.getElementById('ticker_title').innerHTML = name + '&nbsp;&nbsp;$' + data['data'][0][1] + '&nbsp;&nbsp;';
                var perc = ((todayClose / yesterdayClose) - 1).toFixed(5);
                
                if(todayClose > yesterdayClose) {
                    document.getElementById('up').innerHTML = '(+' + perc.toString() + '%)';
                } else {
                    document.getElementById('down').innerHTML = '(' + perc.toString() + '%)';
                }
            }
            
            callback(company.column_names);
        });
    }
}
            
function addCompareTicker() {
    if (Object.keys(companies).length < 3) {
        var ticker = document.getElementById('compareBox').value;
        if (ticker) {
            getData(ticker, makeChart);
            document.getElementById('compareBox').value = "";
        }
    } else {
        // too many tickers already. We want the error message to be displayed for 3 sec, then removed.
        $('#error').text('Please remove a ticker before adding another.');
        setTimeout(function () {
            $('#error').text('');
        }, 3000);
    }
    
}
            
function search(term) {
    term = term || document.getElementById('searchBox').value;
    if (term)
        window.location.href = term;
}