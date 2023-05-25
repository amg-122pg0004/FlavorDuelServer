import http from 'http';
import login from './login.js';
import * as matching from './matching.js';
import * as ingame from './ingame.js';
const hostname = '127.0.0.1';
const port = 9000;
let resultMessage = "";

const server = http.createServer((req, res) => {
  console.log("req.method:", req.method);
  let receiveData = '';
  if (req.method === "POST") {
    req.on('data', chunk => {
      receiveData += chunk;
    });
    req.on('end', () => {
      if (receiveData != "") {
        const decodedString = decodeURIComponent(receiveData);
        receiveData = JSON.parse(decodedString);
      }
      if (req.url === "/login") {
        login(receiveData.id, receiveData.password, res);
      }
      else if (req.url === "/matching") {
        resultMessage = matching.Post(receiveData, res);
      }
      else if (req.url === "/ingame") {
        resultMessage = ingame.post(receiveData,res);
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