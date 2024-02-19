var bodyParser = require('body-parser');
import fs from 'fs'
import path from 'path'
import express from 'express'
import { runSocketServer } from './number-of-viewers';
import { getCurrentUserFromHttpHeaders } from './users';
import { upsertDemo } from './demo';
require('./database')


declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}


const app: express.Application = express()

if (process.env.NODE_ENV === 'production') {

  app.enable('trust proxy');

  // Add a handler to inspect the req.secure flag (see 
  // http://expressjs.com/api#req.secure). This allows us 
  // to know whether the request was via http or https.

  app.use(function (req, res, next) {
    if (req.secure) {
      // request was via https, so do no special handling
      next();
    } else {
      // request was via http, so redirect to https
      res.redirect('https://' + req.headers.host + req.url);
    }
  });
}

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {

  /*
  const ip = req.ip
  const url = req.url
  const method = req.method
  const params = req.params
  const query = req.query
  const userAgent = req.get('user-agent')

  notify('request', {ip, url, method, params, query, userAgent})
  */
  next()
})

app.use(getCurrentUserFromHttpHeaders)

app.use((req, _res, next) => {
  if (req.user) {
    console.log('user:', req.user)
  }
  next()
})

app.use(bodyParser.json())

var files = fs.readdirSync('./server/routes');
files.forEach(file => {
  var ext = path.extname(file);
  var name = file.split(ext)[0]
  if (name.charAt(0) !== '.') {
    app.use(`/api/${name}`, require(`./routes/${name}`));
  }
});

// Create link to Angular build directory
var distDir = __dirname + "/../client/html";
app.use(express.static(distDir));

app.all('/*', function (req, res) {
  res.sendFile('index.html', { root: __dirname + '/../client/html/' });
});


app.use(function(error: any, req: any, res: any, next: any) {
  console.error('--------------------------------------------')
  console.error('Error:')
  console.error(error)
  console.error('--------------------------------------------')
  //notify('error', JSON.stringify(error))
  res.status(500).json({error: 'Something went wrong.'})
});

var port = process.env.PORT || '9090'
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

runSocketServer(server)
upsertDemo() // Not sure if we want to open this up to the public.

//require('./find-poet')

process.on('SIGTERM', function() {
  console.log('bye bye');
  process.exit();
});

/*
clubModel.updateMany({}, { $rename: { owner: 'user' } }, { multi: true }, function(err, blocks) {
  if(err) { throw err; }
  console.log('Renaming owner to user is done!');
});
*/

//speedTest()