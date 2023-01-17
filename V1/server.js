const express = require('express');
const app = express();
const http = require("http");
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
// const readline = require("readline");
// const es = require('event-stream');
// const socketio = require('socket.io');

const port = process.env.PORT || 4000;

// const app = express();

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on('connection', (socket) => {
  console.log("connected");
  socket.on("data-logs", (data) => {
    // console.log(data);
    fs.createReadStream('file.txt')
    .on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (let i = 0; i < lines.length; i++) {
        setTimeout(() => {
          socket.emit('data-logs', lines[i]);
        }, i * 1500);
      }
    });
    // socket.emit("data-logs", "OKAY");
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

// const server = http.createServer(app);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.post('/api/login', (req, res) => {
    // res.addHeader("Access-Control-Allow-Origin", "*");
    // const data = req.body;
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
        // console.log('Data retrieved:\n');
        // console.log("user: ", data.loginUser, " pass: ", data.loginPass);
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

  // const dbQuery = `Insert into users VALUES (NULL, ${data.userName}, ${data.email}, ${data.passWord}, ${data.confirmPassword})`;
  const dBQuery = "INSERT INTO users (username, email, password, confirm_pass) VALUES ?";
  const values = [[`${userName}`,`${email}`, `${passWord}`, `${confirmPassword}`]];

  connection.query(dBQuery, [values], function (err, result) {
    if (err) {
        console.log('Error on query: ' + err.message);
        return;
    }
    console.log("Query: Successful\n" + result.affectedRows);
    // console.log('Data retrieved:\n');
    // console.log(result);

    // res.send('Sign up successful!');
    // connection.end();
  });


  // return res.send(`Api Successful. 
  // user: ${data.userName},
  // pass: ${data.passWord}`);
  
  return res.send('API Successful');
});

// app.get('/api/data-logs', (req, res) => {
//   // (1)
// // const lineNr = 0;
// //   fs.createReadStream('file.txt')
// //   .pipe(es.split())
// //   .pipe(es.mapSync((line) => {
// //     // s.pause();

// //     // lineNr += 1;
// //     // do something with the line
// //     setTimeout(() => {
// //       console.log(line);
// //       res.write(line);
// //     }, 1000);
// //     // console.log(line);
// //     // res.write(line);
// //   }))
// //   .on('error', (err) => {
// //     console.log('Error:', err);
// //   })
// //   .on('end', function(){
// //     console.log('Read entire file.')
// //     res.end();
// // })
// // 2
// // const fileStream = fs.createReadStream('file.txt', 'utf8');

// //   // Send each line of the file as a chunk of data
// //   fileStream.on('data', (line) => {
// //     res.write(line);
// //   });

// //   // When all the lines have been sent, end the response
// //   fileStream.on('end', () => {
// //     res.end();
// //   });
//   // 3
//   // Open the file
//   const fileStream = fs.createReadStream("file.txt");
//   const rl = readline.createInterface({
//     input: fileStream,
//     crlfDelay: Infinity
//   });

//   // Read the file line by line
//   rl.on("line", (line) => {
//     // Do something with the line
//     console.log(line);
//     res.write(line);

//     // Wait for 500 ms before reading the next line
//     setTimeout(() => {
//       rl.resume();
//     }, 2500);
//     rl.pause();
//   })
//   .on("close", () => {
//     res.end();
//     return;
//   });

//   // rl.on("end", res.end())
  
// });

app.listen(port, () => {
  console.log(`App started on port: ${port}`)
})

server.listen(3054, () => {
  console.log(`socket port: ${3054}`)
})
