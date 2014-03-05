var http = require('http');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');

var root = __dirname;

var server = http.Server(function(req, res) {
    
    var url = parse(req.url);
    var path = join(root, url.pathname);
    
    fs.stat(path, function(err, stat) {
        if (err) {
            if ('ENOENT' == err.code) {
                res.statusCode = 404;
                res.end('File Not Found');
            } else {
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        } else {
            // file exists
            switch (url.pathname) {
                case '/':
                    // root. serve up _html/index.html
                    var stream = fs.createReadStream(path + '_html/index.html');
                    stream.pipe(res);
                    stream.on('error', function(err) {
                        res.statusCode = 500;
                        res.end('Internal Server Error');
                    });
                    break;
            
                case '/stock.html':
                    // stock page. serve up _html/stock.html with argument
                    break;
                default:
                    //badRequest(res);
            }
        }
    
    });
});
server.listen(3000);
console.log('Server running at http://localhost:3000/');