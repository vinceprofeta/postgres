exports.up = function(knex, Promise) {
  return knex.transaction(function(trx) {
    return trx.schema
      .table('users', function(table) {
        table.text('timezone');
      });
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('timezone');
  });
};