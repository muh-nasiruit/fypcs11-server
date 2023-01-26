const express = require('express');
const app = express();
const http = require("http");
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const tm = require( 'text-miner');

const port = process.env.PORT || 4000;

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on('connection', (socket) => {
  console.log("socket connected");
  socket.on("data-logs", (data) => {
    fs.createReadStream('file.txt')
    .on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (let i = 0; i < data; i++) {
        setTimeout(() => {
          socket.emit('data-logs', lines[i]);
        }, i * 1500);
      }
    });

    
    socket.on("analysis", (d) => {
        // console.log("Analysis: ", d);
        const my_corpus = new tm.Corpus();
        my_corpus.addDoc(d);
        const terms = new tm.DocumentTermMatrix( my_corpus );
        const res = terms.findFreqTerms(1);
        // console.log('res: ',res); 
        socket.emit('analysis', res);
    });

  });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
});

const connection = mysql.createConnection({
  user: 'root',
  host: 'localhost',
  password: 'password',
  database: 'users',
  insecureAuth : true,
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.post('/api/login', (req, res) => {
    const { loginUser, loginPass } = req.body;
    console.log(loginUser, loginPass); 
    connection.connect((error) => {
      if(error) {
        console.log('Error connecting: ' + error.message);
        return;
    }
    console.log('Connection: Established sucessfully'); 
    });
    connection.query("SELECT * from users", function (err, result) {
        if (err) {
            console.log('Error on query: ' + err.message);
            return;
        }
        console.log("Query: Successful");
        const records = result;
        const recordsSearch = records.find(item => item.username === loginUser && item.password === loginPass);
        let ans = false;
        if (recordsSearch) ans = true;
        res.send(ans);
      });
})

app.post('/api/signup', function (req, res) {
  const { userName, email, passWord, confirmPassword } = req.body;
  console.log('user details: ', req.body);
  connection.connect((error) => {
    if(error) {
      console.log('Error connecting: ' + error.message);
      return;
  }
  console.log('Connection: Established sucessfully'); 
  });

  const dBQuery = "INSERT INTO users (username, email, password, confirm_pass) VALUES ?";
  const values = [[`${userName}`,`${email}`, `${passWord}`, `${confirmPassword}`]];

  connection.query(dBQuery, [values], function (err, result) {
    if (err) {
        console.log('Error on query: ' + err.message);
        return;
    }
    console.log("Query: Successful\n" + result.affectedRows);
  });

  return res.send('API Successful');
});

app.listen(port, () => {
  console.log(`App started on port: ${port}`)
})

server.listen(3054, () => {
  console.log(`socket port: ${3054}`)
})
