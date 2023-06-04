/**
 * @fileoverview /registerエンドポイントの処理を記載するファイル
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
    const defaultDeck = await conn.query(`SELECT deck FROM default_deck WHERE number = 0`);
    const setdeck = defaultDeck[0].deck;
    await conn.query(`INSERT INTO user_data(id,password,deck) VALUES('${id}','${password}','${setdeck}')`);
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