var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var ids = require('shortid');

var jsonPath = path.join(__dirname, 'data.json');

console.log('starting server');
http.createServer(function(req, res) {
    var parsedUrl = url.parse(req.url);

    if (parsedUrl.pathname === '/chirps' && req.method === 'GET') {
    
        fs.readFile(jsonPath, function(err, file) {
            if (err) {
                res.writeHead(500);
                res.end('Could not read file');
            }

            res.write(file);
            res.end();
        });
    } else if (parsedUrl.pathname === '/chirps' && req.method === 'POST') {
        var chunks = '',
            data;

        req.on('data', function(chunk) {
            chunks += chunk;
            
            if (chunks.length > 1e6) {
                req.connection.destroy();
            }

            data = JSON.parse(chunks);
        });

        fs.readFile(jsonPath, 'utf-8', function(err, file)  {
            if (err) {
                res.writeHead(500);
                res.end('Could not read file');
            } 
            
            var arr = JSON.parse(file);

            arr.push(data);

            fs.writeFile(jsonPath, JSON.stringify(arr), function(err, success) {
                if (err) {
                    res.writeHead(500);
                res.end('Couldn\'t successfully store data');
                } else {
                    res.writeHead(201, 'Created');
                    res.end(JSON.stringify(arr));
                }
            });
        });
    } else if (req.method === 'GET' && parsedUrl.pathname.indexOf('/chirps/one/') > -1) {

        var lastSlashIndex = parsedUrl.pathname.lastIndexOf('/');

        var id = parsedUrl.pathname.slice(lastSlashIndex + 1);
         
        fs.readFile(jsonPath, 'utf-8', function(err, file) {
            if (err) {
                res.writeHead(500);
                res.end('Could not read file');
            }

            var arr = JSON.parse(file);
            var result;

            arr.forEach(function(a) {
                if (a.id === id) {
                    result = a;
                }
            });

            if (result === undefined) {
                res.writeHead(404, 'NOT FOUND');
                res.end();
            } else {
                res.writeHead(200, 'OK');
                res.end(JSON.stringify(result));
            }
        });
    } 
})
.listen(3000);