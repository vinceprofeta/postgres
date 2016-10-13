exports.up = function(knex, Promise) {  
  return Promise.all([

    knex.schema.createTable('users', function(table) {
      table.increments();
      table.string('first_name').notNullable()
    })

  ])
};

exports.down = function(knex, Promise) {  
  
};

