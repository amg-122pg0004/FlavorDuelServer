/**
 * @fileoverview /registerエンドポイントの処理を記載するファイル
 */
import mariadb from 'mariadb';
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '0000',
  database: 'testdb',
  port: 3306,
  connectionLimit: 5,
});

/**
 * ユーザー登録を行う
 * エラーの場合はエラーコードをレスポンスとして返す 想定する登録失敗はユーザーIDの重複
 * 
 * @param {string} id 登録しようと試みるユーザーID
 * @param {string} password 登録しようと試みるパスワード
 * @param {*} res httpレスポンス
 */
const register = async (id, password, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      `INSERT INTO user_data(id,password) VALUES('${id}','${password}')`);
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
export default register;