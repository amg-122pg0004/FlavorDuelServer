/**
 * @fileoverview /loginエンドポイントの処理を記載するファイル
 */
import mariadb from 'mariadb';
import dotenv from 'dotenv';
dotenv.config();
const pool = mariadb.createPool({
  host: process.env.MARIADB_HOST,
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DBNAME,
  port: process.env.MARIADB_PORT,
  connectionLimit: process.env.MARIADB_CONNECTION_LIMIT,

});
console.log(process.env.MARIADB_HOST);
console.log(process.env.MARIADB_USER);
console.log(process.env.MARIADB_PASSWORD);
console.log(process.env.MARIADB_DBNAME);
console.log(process.env.MARIADB_PORT);
console.log(process.env.MARIADB_CONNECTION_LIMIT);
/**
 * ログイン処理
 * ログインに成功すればプレイヤーデータ,失敗したらエラーコードをレスポンスとして返す
 * @param {string} id 入力ID
 * @param {string} password 入力パスワード
 * @param {*} res httpレスポンス
 */
const login = async (id, password, res) => {
  let conn;
  try {
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
  } catch (error) {
    console.error('MariaDB query error:', error);
    res.writeHead(500, { error: 'Internal server error' });
    res.end('post received:');
  } finally {
    if (conn) {
      conn.release();
    }
  }
}
export default login;