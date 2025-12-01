exports.up = function (knex) {
  return knex.schema.createTable('sales', (table) => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable();
    table.integer('quantity').unsigned().notNullable();
    table.decimal('total_price', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // relacionamento
    table.foreign('product_id').references('id').inTable('products');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('sales');
};
