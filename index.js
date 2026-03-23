const http = require('http');
const fs = require('fs');
const path = require('path');

const prnt = (txt) => console.log(txt);

const server = http.createServer( (req, res) => {
    if(req.url === '/'){
        // res.end("<h1> Home Page</h1>");
        fs.readFile( path.join(__dirname, 'public', 'index.html'),
            (err, content) => {
                if(err) throw err;
                res.writeHead(200, {'content-type': 'text/html'})
                res.end(content);
            }
        )

    }
    else if(req.url === '/api'){
            fs.readFile( path.join(__dirname, 'public', 'db.json'),
            (err, content) => {
                if(err) throw err;
                res.writeHead(200, {'content-type': 'application/json'}) //quiz question: what is the content type for db.json
                res.end(content);
            }
        )
    }
    else{
        fs.readFile( path.join(__dirname, 'public', '404.html'),
            (err, content) => {
                if(err) throw err;
                res.writeHead(404, {'content-type': 'text/html'})
                res.end(content);
            }
        )

    }

    prnt(req.url)

}

)
server.listen(5959, ()=>prnt("Yay our server is running"));

