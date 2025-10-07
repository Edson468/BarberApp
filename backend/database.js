const sqlite3 = require('sqlite3').verbose();

// O nome do arquivo do banco de dados
const DB_SOURCE = 'barberapp.db';

const db = new sqlite3.Database(DB_SOURCE, (err) => {
  if (err) {
    // Não foi possível abrir o banco de dados
    console.error(err.message);
    throw err;
  } else {
    console.log('Conectado ao banco de dados SQLite.');
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      telefone TEXT,
      senha TEXT NOT NULL
    )`, (err) => {
      if (err) {
        // Tabela já criada
      } else {
        console.log('Tabela "usuarios" criada com sucesso.');
      }
    });
  }
});

module.exports = db;