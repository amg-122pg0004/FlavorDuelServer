import http from 'http';
import login from './login.js';
import * as matching from './matching.js';

const hostname = '127.0.0.1';
const port = 9000;
let resultMessage = "";

let list = matching.matchingIdList;

const server = http.createServer((req, res) => {
  console.log("req.method:", req.method);
  let reveiveData = '';
  if (req.method === "POST") {
    req.on('data', chunk => {
      reveiveData += chunk;
    });
    req.on('end', () => {
      if (reveiveData != "") {
        const decodedString = decodeURIComponent(reveiveData);
        reveiveData = JSON.parse(decodedString);
      }
      if (req.url === "/login") {
        login(reveiveData.id, reveiveData.password, res);
      }
      else if (req.url === "/matching") {
        resultMessage = matching.Post(reveiveData, res);
      }
      else if (req.url === "/ingame") {
        resultMessage = analyzeCardData(reveiveData);
      }
    })
  }
  else if (req.method === "GET") {
    if (req.url === "/matching") {
      resultMessage = matching.Get(res);
    }
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});