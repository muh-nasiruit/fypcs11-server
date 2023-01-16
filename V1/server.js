const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const port = process.env.PORT || 4000;

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
app.get('/api/login', (req, res) => {
    // res.addHeader("Access-Control-Allow-Origin", "*");

      
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
          console.log('Data retrieved:\n');
          console.log(result);
          const dbRes = { 
            username: result.pop().confirm_pass,
            password: result.pop().password,
          };
          // connection.end();
          res.send(dbRes);
        });
//     console.log("this api works you are just insecure")
//        res.send("HELLO WORLD");
})

app.post('/api/signup', function (req, res) {
  const data = req.body;
  console.log('user details: ', data);
  connection.connect((error) => {
    if(error) {
      console.log('Error connecting: ' + error.message);
      return;
  }
  console.log('Connection: Established sucessfully'); 
  });

  // const dbQuery = `Insert into users VALUES (NULL, ${data.userName}, ${data.email}, ${data.passWord}, ${data.confirmPassword})`;
  const dBQuery = "INSERT INTO users (username, email, password, confirm_pass) VALUES ?";
  const values = [[`${data.userName}`,`${data.email}`, `${data.passWord}`, `${data.confirmPassword}`]];

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


app.listen(port, () => {
  console.log(`App started on port: ${port}`)
})
