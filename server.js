var http = require('http');
var parse = require('url').parse;
var path = require('path');
var fs = require('fs');

var root = __dirname;

var server = http.Server(function(req, res) {
    
    var url = parse(req.url);
    var filepath = path.join(root, url.pathname);
    
    var send404 = createError(404, 'File Not Found.');
    var send500 = createError(500, 'Internal Server Error.');
    
    if (url.pathname == '/') {
        res.writeHead(200, {"Content-Type": "text/html"});
        var stream = fs.createReadStream(root + '/_html/index.html');
        stream.pipe(res);
    }
            
    else if (url.pathname == '/stock' || url.pathname == '/stock/') {
        res.writeHead(200, {"Content-Type": "text/html"});
        var stream = fs.createReadStream(root + '/_html/stock_list.html');
        stream.pipe(res);
    }
            
    else if (url.pathname.search('/stock/') == 0) {
        var ticker = url.pathname.slice(7);
        // check if the ticker file exists.
        fs.stat(root + '/QuandlQuery/tickers/' + ticker + '.json', function(err) {
            if (err) {
                if (err.code == 'ENOENT') send404(res);
                else                      send500(res);
            } 
            else {
                res.writeHead(200, {"Content-Type": "text/html"});
                var stream = fs.createReadStream(root + '/_html/stock.html');
                stream.pipe(res);
            }
        });
    }
            
    else {
        fs.stat(filepath, function(err, stats) {
            if (err) {
                if (err.code == 'ENOENT') send404(res);
                else                      send500(res);
            } 
            else {
                res.statusCode = 200;
                var stream = fs.createReadStream(filepath);
                stream.pipe(res);
            }
        });       
    }
    
    function createError(errorCode, errorString) {
        return function(response) {
            response.statusCode = errorCode;
            response.end(errorString);
        }
    }
});

server.listen(3000);
console.log('Server running at http://localhost:3000/');