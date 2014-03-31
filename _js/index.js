// Have to load at beginning. If called after page loads, wipes out HTML
google.load("visualization", "1", {packages:["corechart"]});

$(document).ready(function() {
                
   // $('div#range_div').hide();
    $('div#filter_table_ranges').hide();
                
    // Set the range panel to open/close when h3#open_ranges clicked
    $('h3#open_ranges').click(function() {
        if ($('div#filter_table_ranges').attr('class') == 'open') {
            $('div#filter_table_ranges').removeClass("open")
            .animate({width: '-=150px'}, 400, 'easeInBack', function() {
                $('div#filter_table_ranges').hide()
            });
            $('h3#open_ranges').text("Open Ranges >>");
        }
        else {
            $('div#filter_table_ranges').addClass("open")
            .show()
            .animate({width: '+=150px'}, 400, 'easeOutBack');
            $('h3#open_ranges').text("Close Ranges <<");
        }
        
    }) // and set the curser to a pointer when hovering
    .css('cursor', 'pointer');
                
    // Set the curser to a pointer when hovering h3#filter_btn
    $('h3#filter_btn').click(function() { makeChart(); })
    .css('cursor', 'pointer');
                
    // Values for the range sliders.
    var values = {
        "PERatioSlider":   [0,1000],    "MarketCapSlider":        [0,250000],
    };
                
    // Go through each input.slider and set it to a range slider with the correct range from values array.
    $('.slider').each(function () {
        var slider_id = this.id;
        var min = values[slider_id][0];
        var max = values[slider_id][1];
        var s = (max - min) / 3;
        var p1 = removeZero(parseFloat(min + s).toFixed(1));
        var p2 = removeZero(parseFloat(max - s).toFixed(1));
        
        $("#" + slider_id).slider({
            from: min,  to: max,
            scale: [min, '|', p1, '|', p2, '|', max],
            limits: false,
            step: (max - min) / 20
            //onstatechange: function() { makeChart(companyObject); }
        });
    });
    
    
    // Grab the quandl data
   //http://www.quandl.com/api/v1/datasets/OFDP/DMDRN_" + tickerCode + "_ALLFINANCIALRATIOS.json?auth_token=iT1LrBo1Uw79uqJfrKyb
    $.getJSON('./QuandlQuery/alltickers.json', function(file) {
        companyObject = file;
        
        var XSelect = document.getElementById('XSelect');
        var YSelect = document.getElementById('YSelect');
        var BSelect = document.getElementById('BSelect');
        //bubbleSize = "Trading Volume";
        
        for (var i = 1; i < file.column_names.length; i++) {
            XSelect.innerHTML += '<option>' + file.column_names[i] + '</option>';
            YSelect.innerHTML += '<option>' + file.column_names[i] + '</option>';
            BSelect.innerHTML += '<option>' + file.column_names[i] + '</option>';
            /*if (file.column_names[i] === bubbleSize) {
                sizeIndex = i;
            }*/
        }
        XSelect.value = "Hi-Lo Risk";
        YSelect.value = "Value Line Beta";
        BSelect.value = "Market Capitalization";
        
        makeChart();
    });
}); // End JQuery

var companyObject;
var dataTable;
//var sizeIndex;
//var bubbleSize;
            
function removeZero(val) {
    // Remove unnecesary decimal zero after decimal.
    if ((val * 10) % 10 == 0) return parseFloat(val).toFixed(0);
    else return val;
}
            
function within(value, pt) {
    return (pt <= parseFloat(value.split(";")[1]) && pt >= parseFloat(value.split(";")[0]));
}
            
function satisfyFilters(c) {
    // Exchange check boxes
    //if ((c.StockExchange == 'NYSE' && !(document.getElementById('NYSEFilter').checked)) || 
    //        (c.StockExchange === 'NasdaqNM' && !(document.getElementById('NasdaqFilter').checked)))
    //    return false;
    
    var exchange = companyObject[c].exchange;
    switch (exchange) {
        case 'NYSE':
            if (!(document.getElementById('NYSEFilter').checked))
                return false;
            break;
        case 'NASDAQ':
            if (!(document.getElementById('NASDAQFilter').checked))
                return false;
            break;
        case 'TSX':
            if (!(document.getElementById('TSXFilter').checked))
                return false;
            break;
        case 'AMEX':
            if (!(document.getElementById('AMEXFilter').checked))
                return false;
            break;
        case 'PINK':
            if (!(document.getElementById('PINKFilter').checked))
                return false;
            break;
    }
    
    if (!within($("#PERatioSlider").attr('value'), companyObject[c]['data'][companyObject['column_names'].indexOf('Current PE Ratio')])) return false;
    if (!within($("#MarketCapSlider").attr('value'), companyObject[c]['data'][companyObject['column_names'].indexOf('Market Capitalization')])) return false;
    
    return true;
                
    // PERatio slider
    /*if (!within($("#PERatioSlider").attr('value'), c.PERatio)) return false;
    if (!within($("#YearLowSlider").attr('value'), c.YearLow)) return false;
    if (!within($("#YearHighSlider").attr('value'), c.YearHigh)) return false;
    if (!within($("#YearLowChangeSlider").attr('value'), c.ChangeFromYearLow)) return false;
    if (!within($("#YearHighChangeSlider").attr('value'), c.ChangeFromYearHigh)) return false;
    if (!within($("#OpenSlider").attr('value'), c.Open)) return false;
    if (!within($("#PrevCloseSlider").attr('value'), c.PreviousClose)) return false;
    if (!within($("#PercentChangeSlider").attr('value'), parseFloat(c.ChangeinPercent))) return false;
    if (!within($("#BookValueSlider").attr('value'), c.BookValue)) return false;
    if (!within($("#DividendYieldSlider").attr('value'), c.DividendYield)) return false;*/
                
    //return true;
}
            
function makeChart() {
    if (companyObject === undefined) return;
                console.log(companyObject);
    var XIndex = document.getElementById('XSelect').selectedIndex;
    var YIndex = document.getElementById('YSelect').selectedIndex;
    var BIndex = document.getElementById('BSelect').selectedIndex;
    
    var col_names = companyObject.column_names;
    var chartArray = [['ID', col_names[XIndex + 1], col_names[YIndex + 1], 'Company Name', col_names[BIndex + 1]]];
    var exchangeMap = {};
    var numResults = 0;
    
    for (var cName in companyObject) {
        
        if (cName !== "column_names" && satisfyFilters(cName)) {
            var xVal = companyObject[cName]['data'][XIndex + 1];
            var yVal = companyObject[cName]['data'][YIndex + 1];
            var bVal = companyObject[cName]['data'][BIndex + 1];
            
            if (xVal !== null && yVal !== null && bVal !== 0 && bVal !== null) {
                numResults++;
                
                chartArray.push([
                    cName, 
                    xVal,
                    yVal,
                    companyObject[cName]['name'],
                    bVal
                ]);
            }
        }
    }
    
    // chart Array will be less than 2 if not tickers satisfy the filters. Don't draw chart.
    if (chartArray.length < 2) return;
    // Set the number of tickers in the chart.
    document.getElementById('filter_title').innerHTML = 'Filters - ' + numResults;
                
    dataTable = google.visualization.arrayToDataTable(chartArray);
    var options = {
        // Options for the chart. Info at
        // https://google-developers.appspot.com/chart/interactive/docs/gallery/bubblechart
        hAxis: {title: col_names[XIndex + 1], gridlines: {color: 'none'}},
        vAxis: {title: col_names[YIndex + 1], gridlines: {color: 'none'}},
        bubble: {textStyle: {color: 'none'}},
        legend: {position: 'none'},
        chartArea: {left: 50, top: 0, width:"100%", height:"90%"},
        backgroundColor: '#fff',
        explorer: {keepInBounds: false, maxZoomOut: 1.1}
    };

    // Draw the chart.
    chart = new google.visualization.BubbleChart(document.getElementById('index_chart_div'));
    chart.draw(dataTable, options);
    google.visualization.events.addListener(chart, 'select', selectHandler);
                
    // Bubble selection handler. Calls search on the ticker symbol of the bubble that was chosen.
    function selectHandler() {
        var row = chart.getSelection()["0"].row;
        var symbol = dataTable.getValue(row, 0);
        search(symbol);
    }
}

// Load the stock page with the specific stock as an argument.
function search(term) {
    term = term || document.getElementById('searchBox').value;
    if (term)
        window.location.href = "stock/" + term;
}
