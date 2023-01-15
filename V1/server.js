const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');


// connection.end((error) => {
// });

const port = process.env.PORT || 3306;

// const server = http.createServer(app);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/api/login', (req, res) => {
    // res.addHeader("Access-Control-Allow-Origin", "*");
    const connection = mysql.createPool({
        host: 'localhost',
        user: 'root',
        database: 'user_test',
      });
      
      connection.connect((error) => {
        if(error) {
          console.log('Error connecting: ' + error.message);
          return;
      }
      console.log('Connection established sucessfully'); });
      connection.query("SELECT * from users", function (err, result) {
          if (err) {
              console.log('Error on query: ' + err.message);
              return;
          }
          console.log("Query Successful");
          console.log(result);
          const dbRes = { 
            username: result[0].username,
            password: result[0].password,
        };
          res.send(dbRes);
        });
    console.log("this api works you are just insecure")
       res.send("HELLO WORLD");
})

app.post('/api/signup', function (req, res) {
  const data = req.body;
  console.log('user details: ', data);


  return res.send('Api Successful');
});


app.listen(port, () => {
  console.log(`App started on port: ${port}`)
})
