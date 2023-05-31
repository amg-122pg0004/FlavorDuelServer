import mariadb from 'mariadb';
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'testdb',
    port: 3306,
    connectionLimit: 5,
  });

const login = async(id,password,res)=>{
  let conn;
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
  export default login;