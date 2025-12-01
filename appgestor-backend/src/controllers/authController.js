// src/controllers/authController.js

const db = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

module.exports = {
  // ---------------------------------------------------------------------------
  // REGISTRO DE USUÁRIO
  // POST /auth/register
  // ---------------------------------------------------------------------------
  async register(req, res) {
    try {
      let { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }

      // Higienizar dados básicos
      name = String(name).trim();
      email = String(email).trim().toLowerCase();

      if (!email.includes('@')) {
        return res.status(400).json({ error: 'E-mail inválido' });
      }

      // Verificar se e-mail já existe
      const existing = await db('users').where({ email }).first();
      if (existing) {
        return res.status(409).json({ error: 'E-mail já cadastrado' });
      }

      const password_hash = await hashPassword(password);

      // Define role padrão caso não venha
      const finalRole = role || 'ATENDENTE';

      // ---------------------------------------------------------
      // CORREÇÃO DE COMPATIBILIDADE (SQLite & PostgreSQL)
      // ---------------------------------------------------------
      
      // 1. Inserimos o usuário (sem tentar pegar o ID do retorno direto)
      await db('users').insert({
        name,
        email,
        password_hash,
        role: finalRole,
      });

      // 2. Buscamos o usuário recém-criado pelo e-mail (que é único)
      // Isso garante que teremos o ID correto em qualquer banco de dados.
      const newUser = await db('users')
        .where({ email })
        .select('id', 'name', 'email', 'role')
        .first();

      return res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: newUser, // Retorna o objeto completo vindo do banco
      });

    } catch (error) {
      console.error('Erro em register:', error);
      return res
        .status(500)
        .json({ error: 'Erro interno ao registrar usuário' });
    }
  },

  // ---------------------------------------------------------------------------
  // LOGIN
  // POST /auth/login
  // ---------------------------------------------------------------------------
  async login(req, res) {
    try {
      let { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Informe e-mail e senha' });
      }

      email = String(email).trim().toLowerCase();

      const user = await db('users').where({ email }).first();
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const valid = await comparePassword(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      const token = generateToken(user);

      return res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Erro em login:', error);
      return res.status(500).json({ error: 'Erro ao fazer login' });
    }
  },
};