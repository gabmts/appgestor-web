/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('category'); // vinho, espumante, prato, etc.
    table.decimal('purchase_price', 10, 2).notNullable(); // preço de compra
    table.decimal('sale_price', 10, 2).notNullable();     // preço de venda
    table.integer('stock_current').notNullable().defaultTo(0); // estoque atual
    table.integer('stock_min').notNullable().defaultTo(0);     // estoque mínimo
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('products');
};
