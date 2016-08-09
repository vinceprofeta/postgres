
exports.up = function(knex, Promise) {
  return knex.schema.createTable('resources', function(table) {
    table.increments();
    table.string('name');
    table.string('address');
  })
  .createTable('services', function(table) {
    table.increments();
    table.string('name');
    table.text('description');
    table.integer('resource_id').references('resources.id');
  });
};

exports.down = function(knex, Promise) {
  
};
