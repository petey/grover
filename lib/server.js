var http = require('http'),
    util = require('./index'),
    path = require('path'),
    url = require('url'),
    fs = require('fs'),
    exists = fs.exists || path.exists,
    existsSync = fs.existsSync || path.existsSync,
    server;

exports.stop = function() {
    server.close();
};

exports.start = function(options) {
    var pre = '/',
        root = options.server;

    if (!options.silent && !options.quiet) {
        util.log('  starting grover server');
        util.log('  assuming server root as ' + process.cwd());
    }
    if (options.prefix) {
        pre = options.prefix;
    }
    options.prefix = 'http:/'+'/127.0.0.1:' + options.port;

    options.paths.forEach(function(url, key) {
        url = url.replace(root, ''); //If they are full filesytem paths, we replace the root
        options.paths[key] = options.prefix + path.join(pre, url);
    });

    server = http.createServer(function (req, res) {
        var u = url.parse(req.url),
            p = path.join(root, u.pathname);
        
        exists(p, function(x) {
            if (!x) {
                res.statusCode = 404;
                res.end('Not Found', 'utf8');
            } else {
                fs.readFile(p, 'utf8', function(err, data) {
                    if (err) {
                        res.statusCode = 404;
                        res.end('Not Found', 'utf8');
                    } else {
                        res.statusCode = 200;
                        res.end(data, 'utf8');
                    }
                });
            }
        });
    }).listen(options.port);
};