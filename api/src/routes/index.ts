import middleware from '@blocklet/sdk/lib/middlewares';
import { Router } from 'express';
import { verbose } from 'sqlite3';
import path from 'path';

const router = Router();
const sqlite3 = verbose();

const dbPath = path.resolve(__dirname, 'database.db');

// Initialize SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  email TEXT,
  phone TEXT
)`);

router.get('/profile', (_, res) => {
  db.get('SELECT * FROM profile WHERE id = 1', (err, row) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      if (row) {
        // 如果查询到数据，直接返回数据
        res.status(200).json(row);
      } else {
        // 如果没有查询到数据，返回包含空值的字段
        res.status(200).json({ id: null, username: '', email: '', phone: '' });
      }
    }
  });
});

router.post('/profile', (req, res) => {
  const { username, email, phone } = req.body;

  // 首先检查是否存在记录
  db.get(`SELECT 1 FROM profile WHERE id = 1`, (err, row) => {
    if (err) {
      res.status(400).send(err.message);
      return;
    }

    if (row) {
      // 如果存在，执行更新操作
      db.run(
        `UPDATE profile SET username = ?, email = ?, phone = ? WHERE id = 1`,
        [username, email, phone],
        function (err) {
          if (err) {
            res.status(400).send(err.message);
          } else {
            res.status(200).send('Profile Updated');
          }
        }
      );
    } else {
      // 如果不存在，执行插入操作
      db.run(
        `INSERT INTO profile (id, username, email, phone) VALUES (1, ?, ?, ?)`,
        [username, email, phone],
        function (err) {
          if (err) {
            res.status(400).send(err.message);
          } else {
            res.status(200).send('Profile Created');
          }
        }
      );
    }
  });
});

router.use('/user', middleware.user(), (req, res) => res.json(req.user || {}));

export default router;
