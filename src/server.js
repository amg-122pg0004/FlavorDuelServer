import { Configuration, OpenAIApi } from "openai";
import http from 'http';
import mariadb from 'mariadb';
import dotenv from 'dotenv';
dotenv.config();
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

const hostname = '127.0.0.1';
const port = 9000;
let resultMessage = "";

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '0000',
  database:'testdb',
  port: 3306,
  connectionLimit: 5,
});

let conn;
const login = async(id,password,res)=>{
  try{
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM user_data WHERE id = "${id}" AND password = "${password}"`);
    
    if (rows.length === 0) {
      res.writeHead(401, { error: 'Invalid credentials' });
      res.end('post received:');
    } else {
      const user = rows[0];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(user));
      res.end('post received:');
    }

    return rows;
  } catch(error){
    console.error('MariaDB query error:', error);
    res.writeHead(500, { error: 'Internal server error' });
    res.end('post received:');
  }finally{
    if(conn){
      conn.release();
    }
  }
}

const server = http.createServer((req, res) => {
  console.log("req.method:", req.method);
  if(req.url==="/login"){
    if (req.method === "POST") {
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', () => {
        const decodedString = decodeURIComponent(data);
        const receiveData = JSON.parse(decodedString);
        login(receiveData.id,receiveData.password,res);
      });
    }
  }else{
    if (req.method === "GET") {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Hello, World!\n');
    } else if (req.method === "POST") {
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', () => {
        const decodedString = decodeURIComponent(data);
        console.log(decodedString);
        resultMessage = testFunction( JSON.parse(decodedString));
      });
      };
      async function testFunction(input) {
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: `
          Json形式で回答しなさい。回答は"{"で始め"}"で終わりなさい。
          "attack"と,"defense"と"reason"をキーとした回答のみしなさい。
          カードの名前とその設定や世界観を示すテキストがあります。
  
          名前:${input.name}
          テキスト:${input.text}
          
          名前とテキストを参考にカードの"attack"と,"defense"を設定します。
          "attack"と,"defense"は0から10の間です。平均的な"attack"と,"defense"の値は5です。
          "atatck"はカードの名前とテキストの中に、強暴な気性、武器を持つ、鋭利な形状を持つ、攻撃的な能力を持つなどの要素を持つほど高く設定します。
          それらが無い場合は低く設定します。
          "defense"はカードの名前とテキストの中に、大らかな気性、鎧を身に着ける、盾を持つ、固い鱗や殻に覆われている、防御的な能力を持つなどの要素を持つほど高く設定します。
          それらが無い場合は低く設定します。
          そのカードの"atatck"と"defense"を設定した理由を"reason"として50代男性のくだけた口調で話す。
          短く一言でまとめる。「あいつは」という時は代わりに「そいつは」と言う。
          数字は話してはいけない。`,
          temperature: 0.6,
          max_tokens: 1500,
        });
        console.log(input.name);
        console.log(input.text);
        console.log(completion.data.choices[0].text);
  
        res.writeHead(200, { 'Content-Type': 'application/json' });
        const encodeData = encodeURI(completion.data.choices[0].text);
        res.write(encodeData);
        res.end('post received:');
        return completion;
      }
  } 
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});