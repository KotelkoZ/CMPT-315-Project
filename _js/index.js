$(document).ready(function() {
                
   // $('div#range_div').hide();
    $('div#filter_table_ranges').hide();
                
    // Set the range panel to open when h3#open_ranges clicked
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
    $('h3#filter_btn').click(function() { makeChart(companyObject); })
    .css('cursor', 'pointer');
                
    // Values for the range sliders.
    var values = {
        "PERatioSlider":   [0,45],    "YearLowSlider":        [0,220],  
        "YearHighSlider":  [0,280],  "YearLowChangeSlider": [0,60],   "YearHighChangeSlider": [-40,5],  "OpenSlider":          [10,250], 
        "PrevCloseSlider": [10,250], "PercentChangeSlider": [-10,10], "BookValueSlider":      [0,80],   "DividendYieldSlider": [0,7]
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
            step: (max - min) / 20,
            onstatechange: function() { makeChart(companyObject); }
        });
    });
}); // End JQuery


// Have to load at beginning. If called after page loads, wipes out HTML
google.load("visualization", "1", {packages:["corechart"]});
            
var companyObject;
var dataTable;

function done() {
    // Get the data from yahoo
    $.getJSON('http://query.yahooapis.com/v1/public/yql?q=select%20Symbol%2CBookValue%2CYearLow%2CYearHigh%2CChangeFromYearLow%2CChangeFromYearHigh%2CName%2COpen%2CPreviousClose%2CChangeinPercent%2CPERatio%2CVolume%2CDividendYield%2CStockExchange%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22SRCE%22%2C%22MMM%22%2C%22ABM%22%2C%22AFL%22%2C%22APD%22%2C%22MO%22%2C%22AWR%22%2C%22ADM%22%2C%22T%22%2C%22ATO%22%2C%22ADP%22%2C%22BDX%22%2C%22BMS%22%2C%22BKH%22%2C%22BRC%22%2C%22BF-B%22%2C%22BCR%22%2C%22CWT%22%2C%22CSL%22%2C%22CVX%22%2C%22CB%22%2C%22CINF%22%2C%22CTAS%22%2C%22CLC%22%2C%22CLX%22%2C%22KO%22%2C%22CL%22%2C%22CBSH%22%2C%22CTBI%22%2C%22CSVI%22%2C%22CTWS%22%2C%22ED%22%2C%22DBD%22%2C%22DCI%22%2C%22DOV%22%2C%22EFSI%22%2C%22EV%22%2C%22EMR%22%2C%22EGN%22%2C%22XOM%22%2C%22FDO%22%2C%22FRT%22%2C%22BEN%22%2C%22GPC%22%2C%22GRC%22%2C%22FUL%22%2C%22HCP%22%2C%22HP%22%2C%22HRL%22%2C%22ITW%22%2C%22JNJ%22%2C%22KMB%22%2C%22LANC%22%2C%22LEG%22%2C%22LOW%22%2C%22MKC%22%2C%22MCD%22%2C%22MHFI%22%2C%22MDT%22%2C%22MCY%22%2C%22MGEE%22%2C%22MSEX%22%2C%22MSA%22%2C%22NC%22%2C%22NFG%22%2C%22NDSN%22%2C%22NWN%22%2C%22NUE%22%2C%22ORI%22%2C%22PH%22%2C%22PNR%22%2C%22PEP%22%2C%22PNY%22%2C%22PPG%22%2C%22PG%22%2C%22STR%22%2C%22RAVN%22%2C%22RLI%22%2C%22RPM%22%2C%22SHW%22%2C%22SIAL%22%2C%22SJW%22%2C%22SON%22%2C%22SWK%22%2C%22SCL%22%2C%22SYY%22%2C%22TROW%22%2C%22TGT%22%2C%22TDS%22%2C%22TNC%22%2C%22TMP%22%2C%22TR%22%2C%22UGI%22%2C%22UBSI%22%2C%22UVV%22%2C%22UHT%22%2C%22VAL%22%2C%22VVC%22%2C%22VFC%22%2C%22GWW%22%2C%22WAG%22%2C%22WMT%22%2C%22WEYS%22%2C%22WGL%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=', 
            function(file) {
        companyObject = file.query.results.quote;
        makeChart(companyObject);
    });
}
            
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
    if ((c.StockExchange == 'NYSE' && !(document.getElementById('NYSEFilter').checked)) || 
            (c.StockExchange === 'NasdaqNM' && !(document.getElementById('NasdaqFilter').checked)))
        return false;
                
    // PERatio slider
    if (!within($("#PERatioSlider").attr('value'), c.PERatio)) return false;
    if (!within($("#YearLowSlider").attr('value'), c.YearLow)) return false;
    if (!within($("#YearHighSlider").attr('value'), c.YearHigh)) return false;
    if (!within($("#YearLowChangeSlider").attr('value'), c.ChangeFromYearLow)) return false;
    if (!within($("#YearHighChangeSlider").attr('value'), c.ChangeFromYearHigh)) return false;
    if (!within($("#OpenSlider").attr('value'), c.Open)) return false;
    if (!within($("#PrevCloseSlider").attr('value'), c.PreviousClose)) return false;
    if (!within($("#PercentChangeSlider").attr('value'), parseFloat(c.ChangeinPercent))) return false;
    if (!within($("#BookValueSlider").attr('value'), c.BookValue)) return false;
    if (!within($("#DividendYieldSlider").attr('value'), c.DividendYield)) return false;
                
    return true;
}
            
function makeChart() {
    if (companyObject === undefined) return;
                
    var e = document.getElementById('XSelect');
    var xValue = e.options[e.selectedIndex];
    e = document.getElementById('YSelect');
    var yValue = e.options[e.selectedIndex];
    e = document.getElementById('BSelect');
    var bValue = e.options[e.selectedIndex];
    var chartArray = [['ID', xValue.text, yValue.text, 'Company Name', bValue.text]];
    var exchangeMap = {};
                
    companyObject.forEach(function(c) {
        // For each company, check if they satisfy the filters. 
        if (satisfyFilters(c)) {
            chartArray.push([c.Symbol, parseFloat(c[xValue.value]), parseFloat(c[yValue.value]),c.Name, Math.abs(parseFloat(c[bValue.value]))]);
            exchangeMap[c.Symbol] = c.StockExchange;
        }
    });
    
                
    // minus one because of title entry in the chartArray.
    document.getElementById('filter_title').innerHTML = 'Filters - ' + (chartArray.length - 1);
                
    if (chartArray.length < 2) return;
    dataTable = google.visualization.arrayToDataTable(chartArray);
    var options = {
        // Options for the chart. Info at
        // https://google-developers.appspot.com/chart/interactive/docs/gallery/bubblechart
        hAxis: {title: xValue.text, gridlines: {color: 'none'}},
        vAxis: {title: yValue.text, gridlines: {color: 'none'}},
        bubble: {textStyle: {color: 'none'}},
        legend: {position: 'none'},
        chartArea: {left: 50, top: 0, width:"100%", height:"90%"},
        backgroundColor: '#fff',
        explorer: {keepInBounds: false, maxZoomOut: 1.1}
    };

    // Draw the chart.
    chart = new google.visualization.BubbleChart(document.getElementById('main_div'));
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
        window.location.href = "stock.html?" + term;
}