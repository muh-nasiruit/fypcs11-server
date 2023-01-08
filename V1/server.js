const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');


// connection.end((error) => {
// });

const port = process.env.PORT || 4000;

// const server = http.createServer(app);
app.use(cors());
app.get('/login', (req, res) => {
    // res.addHeader("Access-Control-Allow-Origin", "*");
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'user_test',
        insecureAuth : true,
      });
      
      connection.connect((error) => {
        if(error) {
          console.log('Error connecting: ' + error.message);
          return;
      }
      console.log('Connection established sucessfully');
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
    });
})

app.listen(port, () => {
  console.log(`App started on port: ${port}`)
})