
const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();

const url = 'mongodb://localhost:27017';
const dbName = 'Userdb';
let db;

async function connectToMongoDB() {
  try {
    const client = await MongoClient.connect(url);
    db = client.db(dbName);
    console.log('MongoDB connected.');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

connectToMongoDB();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png" && file.mimetype !== "image/jpg" && file.mimetype !== "application/pdf") {
            return cb("Invalid file type.");
        }
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 } 
});

app.get('/register', (req, res) => {
    res.send(`
      <form action="/register" method="POST" enctype="multipart/form-data">
        Name:
        <input type="text" name="name" required><br/><br/>
        Email:
        <input type="email" name="email" required><br/><br/>
        Upload Files:
        <input type="file" name="files" multiple required><br>
        <button type="submit">Register</button>
      </form>
    `);
});

app.post('/register', upload.array('files', 5), async (req, res) => {
    const { name, email } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).send('No files uploaded.');
    }

    const user = {
        name,
        email,
        files: files.map(file => ({
            filename: file.filename,
            originalname: file.originalname
        }))
    };

    try {
      const result = await db.collection('users').insertOne(user);
      
      res.send(`
            <h1>User registered with multiple files upload!</h1>
            <p><a href="/files">Click here to view the uploaded files</a></p>
        `);
    } catch (err) {
      console.error('Error inserting user:', err);
      res.status(500).send('Error registering user.');
    }
});

app.get('/files', async (req, res) => {
    try {
        const results = await db.collection('users').find().toArray();
        let fileList = '<h2>Uploaded Files</h2><ul>';
        fileList += `<table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>File Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>`;
        
        results.forEach(user => {
          if (user.files && user.files.length > 0) {
            user.files.forEach(file => {

              fileList += `<tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${file.originalname}</td>
                        <td>
                            <form action="/download/${file.filename}" method="GET" style="display:inline;">
                                <button type="submit">Download</button>
                            </form>
                        </td>
                    </tr>`;
            });
          } 
        });
        fileList += '</ul>';
        res.send(fileList);
    } catch (err) {
        console.error('Error fetching files:', err);
        res.status(500).send('Error fetching files.');
    }
});

app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

app.listen(3005, () => {
    console.log('Server started on port 3005');
});
