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
  console.log("Socket Connected");
  socket.on("data-logs", (data) => {
    console.log("=== creating stream ===");
    fs.createReadStream('file.txt')
    .on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          console.log('Lines streamed: ', i+1);
          socket.emit('data-logs', { a: lines[i], b: i + 1});
        }, i * data);
      }
    });

    
    socket.on("analysis", (d) => {
        console.log("=== analysis requested ===");
        const my_corpus = new tm.Corpus();
        my_corpus.addDoc(d);
        const terms = new tm.DocumentTermMatrix( my_corpus );
        const res = terms.findFreqTerms(1);
        console.log('Data Analysed Successfully!'); 
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
  socketPath: '/var/run/mysqld/mysqld.sock'
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.post('/api/login', (req, res) => {
    const { loginUser, loginPass } = req.body;
    console.log(`User logging in: ${loginUser}`); 
//     connection.on('error', (err) => {
//     if (err.fatal) {
//       console.log('A fatal error occurred: ' + err.message);
//       // Attempt to reconnect
//       connection.connect();
//     }
//      });
 
    connection.connect((error) => {
      if(error) {
        console.log('Error connecting: ' + error.message);
        return;
    }
    console.log('Connection: Established sucessfully'); 
    });

    const dBQuery = "SELECT id, username, password from users where username = ? and password = ?";
    // const values = `${loginUser},${loginPass}`;

    connection.query(dBQuery, [loginUser, loginPass], function (err, result) {
      if (err) {
          console.log('Error on query: ' + err.message);
          return;
      }
      // console.log("Query: Successful" + result.affectedRows);
      console.log("Query: Successful! Login Check");
      if (result.length === 0) {
        // No matching user found
        const failedObj = {
          userId: null,
          check: false,
          message: 'Invalid Username or Password'
        }
        return res.status(401).json(failedObj);
      }
  
      // User found, return the user object
      console.log(result)
      console.log("Authentication: Complete!")
      const foundObj = {
        userId: result[0].id,
        check: true,
        message: 'Valid Username or Password'
      }
      //       connection.end()
      return res.status(200).json(foundObj);
    });
})

app.post('/api/signup', function (req, res) {
  const { userName, email, passWord } = req.body;
  console.log('User Details: ', req.body);
  connection.connect((error) => {
    if(error) {
      console.log('Error connecting: ' + error.message);
      return;
  }
  console.log('Connection: Established sucessfully'); 
  });

  const dBQuery = "INSERT INTO users (username, email, password) VALUES ?";
  const values = [[`${userName}`,`${email}`, `${passWord}`]];

  connection.query(dBQuery, [values], function (err, result) {
    if (err) {
        console.log('Error on query: ' + err.message);
        return;
    }
    // console.log("Query: Successful" + result.affectedRows);
    console.log("Query: Successful! New User Created.");
  });

  return res.send('API Successful');
});

app.listen(port, () => {
  console.log(`App started on port: ${port}`)
})

server.listen(3054, () => {
  console.log(`Socket port: ${3054}`)
})
