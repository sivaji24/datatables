
const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.post('/write-json', (req, res) => {
    const data = JSON.stringify(req.body, null, 2);
    fs.writeFile('objects.json', data, (err) => {
        if (err) {
            res.status(500).send('Error writing file');
        } else {
            res.status(200).send('File written successfully');
        }
    });
});
app.get('/read-file', (req, res) => {
     fs.readFile('objects.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
        } else {
            res.send(data);
        }
    });
});
const PORT = 3005;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
