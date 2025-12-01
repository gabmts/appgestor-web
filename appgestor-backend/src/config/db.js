const knex = require('knex');
// Importa o arquivo de configurações que acabamos de arrumar
const knexfile = require('../../knexfile');

// Define o ambiente atual. 
// Se existir a variável NODE_ENV (o Render define como 'production'), usa ela.
// Se não existir (seu PC), usa 'development'.
const env = process.env.NODE_ENV || 'development';

// Seleciona a configuração correta do objeto knexfile
const config = knexfile[env];

// Inicializa o banco com a configuração dinâmica
const db = knex(config);

module.exports = db;

// ---------------------------------------------------------
// LOGS DE DEBUG (Útil para ver o que está acontecendo)
// ---------------------------------------------------------
db.on('query', (queryData) => {
  // Em produção, evitamos logs excessivos, mas em dev é ótimo
  if (env === 'development') {
    console.log("🟦 SQL:", queryData.sql);
  }
});

db.on('query-error', (err) => {
  console.error("❌ ERRO SQL:", err);
});