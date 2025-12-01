// scripts/seedAdmin.js
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

async function main() {
  try {
    const email = 'admin@luna.com';
    const senha = '123456';

    // Verifica se já existe usuário com esse e-mail
    const existing = await db('users').where({ email }).first();
    if (existing) {
      console.log('Usuário admin já existe no banco ✅');
      console.log(`E-mail: ${email}`);
      return;
    }

    const hash = await bcrypt.hash(senha, 10);

    await db('users').insert({
      name: 'Administrador',
      email,
      password: hash,
    });

    console.log('Usuário admin criado com sucesso ✅');
    console.log(`E-mail: ${email}`);
    console.log(`Senha:  ${senha}`);
  } catch (err) {
    console.error('Erro ao criar usuário admin:', err);
  } finally {
    process.exit();
  }
}

main();
