//=======[ Settings, Imports & Data ]==========================================
/*
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'mysql-server',
    port     : '3306',
    user     : 'root',
    password : 'userpass',
    database : 'smart_home'
});

//=======[ Main module code ]==================================================

connection.connect(function(err) {
    if (err) {
        console.error('Error while connect to DB: ' + err.stack);
        return;
    }
    console.log('Connected to DB under thread ID: ' + connection.threadId);
});

module.exports = connection;

//=======[ End of file ]=======================================================

const mysql = require('mysql');

// Config the connection to DB
const connectWithRetry = () => {
  const connection = mysql.createConnection({
    host     : 'mysql-server',
    port     : '3306',
    user     : 'root',
    password : 'userpass',
    database : 'smart_home'
  });
  
  connection.connect((err) => {
    if (err) {
      console.error('Error conectando a la base de datos:', err);
      setTimeout(connectWithRetry, 10000); // Reintenta después de 5 segundos
    } else {
      console.log('Conectado a la base de datos');
    }
  });
};

connectWithRetry();
*/

//=======[ Settings, Imports & Data ]==========================================

const mysql = require('mysql');

// Config the connection to DB
const connection = mysql.createConnection({
  host     : 'mysql-server',
  port     : '3306',
  user     : 'root',
  password : 'userpass',
  database : 'smart_home'
});

// Function to try connection
const connectWithRetry = () => {
  connection.connect((err) => {
    if (err) {
      console.error('Error conectando a la base de datos:', err)
      setTimeout(connectWithRetry, 10000); // Try after  10 seconds
    } else {
      console.log('Conectado a la base de datos');
    }
  });
};

// Initializing connection
connectWithRetry();

// Export the connection and consulting method
module.exports = {
  query: (sql, params, callback) => {
    return connection.query(sql, params, callback);
  }
};
//=======[ End of file ]=======================================================