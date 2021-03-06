const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const nodeMediaServer = require('./server/media_server');
const thumbnailGenerator = require('./utils/util').job;
const initSocket = require('./utils/socket');
const http = require('http');
const https = require('https');
const httpPort = 3000;
// const httpsPort = 3001;

const app = express();

// Http & Https credentials
const options = {
  key: fs.readFileSync('private.pem'),
  cert: fs.readFileSync('certChain.crt'),
};
const httpServer = http.createServer(app);
// const httpsServer = https.createServer(options, app);

// Set views engine and views engine files folder
app.set('views', './server/views');
app.set('view engine', 'ejs');

// Set body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'server')));

// CORS Control
app.use('/', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.set('Access-Control-Allow-Credentials', 'true');
  next();
});

// Routes Defining //
// EJS rendered routes
app.use(require('./server/routes/static_routes'));
// User logic related routes
app.use(require('./server/routes/user_routes'));
// Payment logic related routes
app.use(require('./server/routes/payment_routes'));
// Vods logic related routes
app.use(require('./server/routes/vod_routes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.log(err);
  res.render('error500');
});

// Render page not found when no related path is defined
app.get('*', (req, res) => {
  res.render('error404');
});

httpServer.listen(httpPort, () => {
  console.log(`HTTP Server is running on port ${httpPort}`);
});

// httpsServer.listen(httpsPort, () => {
//   console.log(`HTTPS Server is running on port ${httpsPort}`);
// });

// Start Node Media Server
nodeMediaServer.run();

// Start Socket Server
initSocket(httpServer);

// Cron Job to generate thumbnails every 20 seconds
// thumbnailGenerator.start();

module.exports = app;
