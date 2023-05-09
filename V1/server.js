const express = require('express');
const app = express();
const http = require("http");
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const tm = require( 'text-miner');
const mongoose = require('mongoose');
const userlogs = require('./db.js');

const port = process.env.PORT || 4000;
const server = http.createServer(app);

const mongoUrl = 'mongodb://172.104.174.187:27017/data_archive';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error connecting to MongoDB'));
db.once('open', () => console.log('Connected to MongoDB'));

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
  host: '172.104.174.187',
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
 
    // connection.connect((error) => {
    //   if(error) {
    //     console.log('Error connecting: ' + error.message);
    //     return;
    // }
    // console.log('Connection: Established sucessfully'); 
    // });

      // Check if the connection is already established
  if (connection.state === 'disconnected') {
    connection.connect((error) => {
      if (error) {
        console.log('Error on connect: ' + error.message);
        res.status(500).send('Internal server error');
        return;
      }

      console.log('Connection: Established sucessfully');
    });
  }

    const dBQuery = "SELECT id, email from users where username = ? and password = ?";
    // const values = `${loginUser},${loginPass}`;

    connection.query(dBQuery, [loginUser, loginPass], function (err, result) {
      if (err) {
          console.log('Error on query: ' + err.message);
          res.status(500).send('Internal server error');
          return;
      }
      // console.log("Query: Successful" + result.affectedRows);
      console.log("Query: Successful! Login Check");
      if (result.length === 0) {
        // No matching user found
        const failedObj = {
          userId: null,
          email: null,
          check: false,
          message: 'Invalid Username or Password'
        }
        res.status(401).json(failedObj);
        return; 
      }
  
      // User found, return the user object
      console.log(result)
      console.log("Authentication: Complete!")
      const foundObj = {
        userId: result[0].id,
        email: result[0].email,
        check: true,
        message: 'Valid Username or Password'
      }
      // dont end connection here as next page also requires connection (edit later)
      res.status(200).json(foundObj);
    });
})

app.post('/api/signup', function (req, res) {
  const { userName, email, passWord } = req.body;
  console.log('User Details: ', req.body);
  if (connection.state === 'disconnected') {
    connection.connect((error) => {
      if (error) {
        console.log('Error on connect: ' + error.message);
        res.status(500).send('Internal server error');
        return;
      }

      console.log('Connection: Established sucessfully');
    });
  }

  const dBQuery = "INSERT INTO users (username, email, password) VALUES ?";
  const values = [[`${userName}`,`${email}`, `${passWord}`]];

  connection.query(dBQuery, [values], function (err, result) {
    if (err) {
      console.log('Error on query: ' + err.message);
      res.status(500).send('Internal server error');
        return;
    }
    // console.log("Query: Successful" + result.affectedRows);
    console.log("Query: Successful! New User Created.");
  });
  res.send('API Successful');
});

app.post('/api/add-history', function (req, res) {
  const { id, con_type, timestamp } = req.body;
  
  if (connection.state === 'disconnected') {
    connection.connect((error) => {
      if (error) {
        console.log('Error on connect: ' + error.message);
        res.status(500).send('Internal server error');
        return;
      }

      console.log('Connection: Established sucessfully');
    });
  }
  
  const dBQuery = "INSERT INTO users_history (user_id, con_type, timestamp) VALUES ?";
  const values = [[`${id}`,`${con_type}`, `${timestamp}`]];

  connection.query(dBQuery, [values], function (err, result) {
    if (err) {
      console.log('Error on query: ' + err.message);
      res.status(500).send('Internal server error');
        return;
    }
    // console.log("Query: Successful" + result.affectedRows);
    console.log("Query: Successful! Added History.");
  });
  res.send('API Added History');

});

app.post('/api/get-history', function (req, res) {
  const { id } = req.body;
  if (connection.state === 'disconnected') {
    connection.connect((error) => {
      if (error) {
        console.log('Error on connect: ' + error.message);
        res.status(500).send('Internal server error');
        return;
      }

      console.log('Connection: Established sucessfully');
    });
  }

  const dBQuery = "SELECT * from users_history where user_id = ?";
  const values = `${id}`;

  connection.query(dBQuery, [values], function (err, result) {
    if (err) {
      console.log('Error on query: ' + err.message);
      res.status(500).send('Internal server error');
        return;
    }
    // console.log("Query: Successful" + result.affectedRows);
    console.log("Query: Successful! User History Found.");
    res.status(200).json(result);
  });

});

app.post('/api/set/arch-logs', async (req, res) => {
  const { data_src, user_id, log_data } = req.body;
  try {

    const newLog = new userlogs({
      user_id: user_id,
      data_src: data_src,
      log_data: log_data,
    });
    newLog.save();
    console.log("Query: Successful! Data Archived.");

    return res.status(200).json('Data Archived!');
  } catch (err) {
      console.error(err);
      return res.status(500).json({message: 'Server error'});
  }
});

app.post('/api/get/arch-logs', async (req, res) => {
  const { user_id, data_src } = req.body;
  try {
  
    const fetched = await userlogs.find({ user_id: user_id, data_src: data_src}).select('log_data -_id');
    console.log("Query: Successful! Archived Data fetched.");
    return res.status(200).json(fetched);
  } catch (err) {
          console.error(err);
          return res.status(500).json({message: 'Server error'});
  }

});

process.on('exit', () => {
  connection.end();
});

app.listen(port, () => {
  console.log(`App started on port: ${port}`)
})

server.listen(3054, () => {
  console.log(`Socket port: ${3054}`)
})
