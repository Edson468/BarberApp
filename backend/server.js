const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./database.js');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Endpoint de Cadastro
app.post('/api/cadastro', (req, res) => {
  const { nome, email, telefone, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const senhaHash = bcrypt.hashSync(senha, salt);

  const sql = 'INSERT INTO usuarios (nome, email, telefone, senha) VALUES (?,?,?,?)';
  const params = [nome, email, telefone, senhaHash];

  db.run(sql, params, function(err) {
    if (err) {
      // Verifica se o erro é de email duplicado
      if (err.message.includes('UNIQUE constraint failed: usuarios.email')) {
        return res.status(409).json({ error: 'Este email já está cadastrado.' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      userId: this.lastID
    });
  });
});

// Endpoint de Login
app.post('/api/login', (req, res) => {
    const { login, senha } = req.body;

    if (!login || !senha) {
        return res.status(400).json({ error: 'Login e senha são obrigatórios.' });
    }

    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    db.get(sql, [login], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const senhaValida = bcrypt.compareSync(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: 'Senha inválida.' });
        }

        res.status(200).json({ message: 'Login bem-sucedido!', user: { id: user.id, nome: user.nome, email: user.email } });
    });
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});