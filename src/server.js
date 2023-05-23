import http from 'http';
import login from './login.js';
import AnalyzeCardData from './ingame.js';

const hostname = '127.0.0.1';
const port = 9000;
let resultMessage = "";

const server = http.createServer((req, res) => {
  console.log("req.method:", req.method);
  let data = '';
  if (req.method === "POST") {
    req.on('data', chunk => {
      data += chunk;
    });
  }
  const decodedString = decodeURIComponent(data);
  const receiveData = JSON.parse(decodedString);
  if (req.url === "/login") {
    if (req.method === "POST") {
      req.on('end', () => {
        login(receiveData.id, receiveData.password, res);
      });
    }
    else if (req.url === "/ingame") {
      if (req.method === "POST") {
        req.on('end', () => {
          resultMessage = AnalyzeCardData(receiveData);
        });
      }
    }
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});