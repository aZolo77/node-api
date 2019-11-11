const http = require('http');

const todos = [
  { id: 1, text: 'TODO 1' },
  { id: 2, text: 'TODO 2' },
  { id: 3, text: 'TODO 3' }
];

const server = http.createServer((req, res) => {
  const { method, url } = req;

  let body = [];
  req
    .on('data', chunk => {
      body.push(chunk);
    })
    .on('end', () => {
      body = Buffer.concat(body).toString();

      let status = 404;
      const response = {
        success: false,
        data: null
      };

      if (method === 'GET' && url === '/todos') {
        status = 200;
        response.success = true;
        response.data = todos;
      } else if (method === 'POST' && url === '/todos') {
        status = 200;
        const { id, text } = JSON.parse(body);
        todos.push({ id, text });
        status = 201;
        response.success = true;
        response.data = todos;
      }

      res.writeHead(status, {
        'Content-Type': 'application/json',
        'X-Powered-By': 'Node.js'
      });
      res.end(JSON.stringify(response));
    });
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
