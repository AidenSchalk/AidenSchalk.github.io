const http = require('http');
const fs = require('fs');
const path = require('path');

const prnt = (txt) => console.log(txt);

const server = http.createServer( (req, res) => {
    if(req.url === '/'){
        // res.end("<h1> Home Page</h1>");
        fs.readFile( path.join(__dirname, 'index.html'),
            (err, content) => {
                if(err) throw err;
                res.writeHead(200, {'content-type': 'text/html'})
                res.end(content);
            }
        )

    }
    else if(req.url === '/api'){
            fs.readFile( path.join(__dirname, 'db.json'),
            (err, content) => {
                if(err) throw err;
                res.writeHead(200, {'content-type': 'application/json'}) //quiz question: what is the content type for db.json
                res.end(content);
            }
        )
    }
    else if (
    req.url.endsWith('.css') ||
    req.url.endsWith('.js') ||
    req.url.endsWith('.png') ||
    req.url.endsWith('.jpg')
    ){
    const filePath = path.join(__dirname, req.url);

    fs.readFile(filePath, (err, content) => {
        if (err) throw err;
            const ext = path.extname(filePath);

            let contentType;
            if (ext === '.css') contentType = 'text/css';
            if (ext === '.js') contentType = 'text/javascript';
            if (ext === '.png') contentType = 'image/png';
            if (ext === '.jpg') contentType = 'image/jpeg';

            res.writeHead(200, {'content-type': contentType});
            res.end(content);
        
    });
}

    prnt(req.url)

}

)
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log("Server running"));
