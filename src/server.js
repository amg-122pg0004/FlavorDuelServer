/**
 * @fileoverview サーバープログラムのエントリーポイント
 *               httpでPOST/GETを受け付けて各エンドポイントの処理を呼び出します
 */

import http from 'http';
import login from './login.js';
import register from './register.js';
import { matchingPost } from './matching.js';
import { ingamePost } from './ingame.js';
const hostname = '127.0.0.1';
const port = 9000;
let resultMessage = "";

/**
 * httpサーバの作成
 */
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
      else if (req.url === "/register") {
        register(receiveData.id, receiveData.password, res);
      }
      else if (req.url === "/matching") {
        matchingPost(receiveData, res);
      }
      else if (req.url === "/ingame") {
        ingamePost(receiveData, res);
      }
    })
  }
  else if (req.method === "GET") {
  }
});

/**
 * httpの待ち受け
 */
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});