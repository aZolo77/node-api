const http = require('http');

const todos = [
  { id: 1, text: 'TODO 1' },
  { id: 2, text: 'TODO 2' },
  { id: 3, text: 'TODO 3' }
];

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Powered-By', 'Node.js');
  res.end(
    JSON.stringify({
      success: true,
      todos
    })
  );
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
