var http = require('http');
var parse = require('url').parse;
var path = require('path');
var fs = require('fs');

var root = __dirname;

var server = http.Server(function(req, res) {
    
    var url = parse(req.url);
    var filepath = path.join(root, url.pathname);
    
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
        res.writeHead(200, {"Content-Type": "text/html"});
        var stream = fs.createReadStream(root + '/_html/stock.html');
        stream.pipe(res);
    }
            
    else {
        fs.stat(filepath, function(err, stats) {
            if (err) {
                // File doesn't exist.
                if (err.code == 'ENOENT') {
                    send404(res);
                } 
                
                else {
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                }
            } 
            
            else {
                var stream = fs.createReadStream(filepath);
                stream.pipe(res);
            }
        });       
    }
    
    function send404(response) {
        response.statusCode = 404;
        response.end('File Not Found');
    }
});
server.listen(3000);
console.log('Server running at http://localhost:3000/');