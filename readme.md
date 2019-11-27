# DevCamper API

## Links:

- [Digitalocean](https://cloud.digitalocean.com/) - hosting

## Environment:

- Node (NPM)
- Git
- [Postman](https://www.getpostman.com/)
- [MongoDB](https://www.mongodb.com/)
  > using Compass as GUI in Development mode and MongoDB.Atlas as cloud for DB

## Extensions:

- [Maps](https://developer.mapquest.com/)
- [Mailtrap](https://mailtrap.io/) - catching sended emails (fake smtp server)
- [Docgen](https://github.com/thedevsaddam/docgen) - generate documentation

## Dependencies:

- [mongoose](https://mongoosejs.com/) - works with MongoDB
- [slugify](https://www.npmjs.com/package/slugify) - creates user friendly strings
- [colors](https://www.npmjs.com/package/colors) - adds colors in console logs
- [morgan](https://www.npmjs.com/package/morgan) - logger middleware
- [dotenv](https://www.npmjs.com/package/dotenv) - loads environment variables from a .env file
- [node-geocoder](http://nchaulet.github.io/node-geocoder/) - library for geocoding
- [express-fileupload](https://www.npmjs.com/package/express-fileupload) - for uploading files
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - for encrypting passwords
- [jsonwebtoken](https://jwt.io/) - creating json web tokens
- [cookie-parser](https://www.npmjs.com/package/cookie-parser) - parse Cookie header and populate req.cookies with an object keyed by the cookie names
- [crypto](https://nodejs.org/api/crypto.html#crypto_crypto) - provides cryptographic functionality
- [nodemailer](https://nodemailer.com/about/) - email sending
- [express-mongo-sanitize](https://www.npmjs.com/package/mongo-sanitize) - sanitizes inputs against query selector injection attacks
- [helmet](https://helmetjs.github.io/) - setting various HTTP security headers (ex: cross-site scripting attacks)
- [xss-clean](https://www.npmjs.com/package/xss-clean) - sanitizes user input coming from POST body, GET queries, and url params
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) - limits repeated requests to public API
- [hpp](https://www.npmjs.com/package/hpp) - protect against HTTP Parameter Pollution attacks ( selects the last parameter value)
- [cors](https://github.com/expressjs/cors) - allows resources to be requested from another domain outside the domain from which the first resource was served (Cross-origin resource sharing)

## Auxiliary:

- [Synchronize Settings](https://artslab.info/vscode/sync-vs-code-settings-between-devices)
- [Settings Gist](https://gist.github.com/aZolo77/50d2806dc21a142c0a6dad3288b48673)
- [Generate Token](https://github.com/settings/tokens/)

## Usage

> Rename "./config/config.env.env" to "./config/config.env" and update the values/settings to your own

### Algorithm:

- install dependencies

        npm i

- run app

  - run in dev mode

          npm run dev

  - run in prod mode

          npm start

- Version: 1.0.0
- License: ISC
