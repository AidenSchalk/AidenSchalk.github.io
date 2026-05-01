const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require("mongodb");
require('dotenv').config();

const prnt = (txt) => console.log(txt);

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let DLCcollection;
let userscollect;
async function connectDB() {
    try {
        await client.connect();
        DLCcollection = client.db("test").collection("dlcs");
        userscollect = client.db("test").collection("users");
        console.log("Connected to MongoDB");
    } catch (e) {
        console.error("MongoDB connection failed:", e);
        process.exit(1);
    }
}


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
    else if(req.url === '/api/dlcs'){

            DLCcollection.find({}).toArray()
                .then(results => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(results));
                })
                .catch(err => {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Failed to fetch books" }));
                });
    }
    else if(req.url === '/api/users'){

            userscollect.find({}).toArray()
                .then(results => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(results));
                })
                .catch(err => {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Failed to fetch books" }));
                });
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

connectDB().then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});