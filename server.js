const http = require('http');

const todos = [
  { id: 1, text: 'TODO 1' },
  { id: 2, text: 'TODO 2' },
  { id: 3, text: 'TODO 3' }
];

const server = http.createServer((req, res) => {
  res.writeHead(400, {
    'Content-Type': 'application/json',
    'X-Powered-By': 'Node.js'
  });

  // console.log(req.headers.authorization);

  let body = [];
  req
    .on('data', chunk => {
      body.push(chunk);
    })
    .on('end', () => {
      body = Buffer.concat(body).toString();
      console.log(body);
    });

  res.end(
    JSON.stringify({
      success: false,
      error: 'Please add email',
      data: null
    })
  );
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
