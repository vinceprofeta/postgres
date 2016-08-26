exports.up = function(knex, Promise) {  
  return Promise.all([

    knex.schema.createTable('users', function(table) {
      table.increments();
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('email').notNullable().unique();
      table.string('bio')
      table.string('phone')
      table.string('password').notNullable()
      table.string('avatar')
      table.string('stripe_customer_id')
      table.timestamp('delete_date')
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

      table.jsonb('facebook_credentials') //REMOVE
      table.string('facebook_user_id') //REMOVE
    }),

    // ________________________________________________________


    knex.schema.createTable('resources', function(table){
      table.increments();
      table.string('resourceName').notNullable();
      table.integer('app_fee_percentage_take').defaultTo(0);
      table.integer('app_fee_flat_fee_take').defaultTo(100);
      table.integer('booking_percent_take').defaultTo(0);
      table.integer('booking_flat_fee_take').defaultTo(0);
      table.string('description', 500);
      table.specificType('point', 'geometry(point, 4326)').notNullable().unique();
      table.integer('cancellation_policy_percent_take').defaultTo(0).notNullable();
      table.integer('cancellation_policy_flat_fee_take').defaultTo(0).notNullable();
      table.integer('cancellation_policy_window').defaultTo(0);
      table.string('street_address').notNullable().unique();
      table.string('city').notNullable();
      table.string('state').notNullable();
      table.integer('zipcode').notNullable();
      table.string('phone').notNullable();
      table.string('email').notNullable();
      table.string('website').notNullable();
      table.string('timezone').notNullable();
      table.boolean('require_membership').defaultTo(false);
      table.timestamp('delete_date')
      table.timestamps()

    }),
    
    // ________________________________________________________

    knex.schema.createTable('services', function(table){
      table.increments();
      table.string('service_description', 500);
      table.integer('service_resource_id').references('resources.id').notNullable();
      table.string('service_type').notNullable()
      table.string('service_name').notNullable()
      table.boolean('active').notNullable().defaultTo(true)
      table.string('image')
      table.integer('service_capacity').notNullable().defaultTo(1);
      table.integer('service_duration').notNullable().defaultTo(60);
      table.integer('service_price').notNullable();
      table.timestamp('delete_date')
      table.specificType('point', 'geometry(point, 4326)')
      
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

      // serviceName needs to be uniqe based on resource 
      table.integer('service_skill_id').references('skills.id').notNullable(); // REMOVEABLE
    }),

    // ________________________________________________________

    knex.schema.createTable('calendars', function(table) {
      table.increments();
      table.integer('calendar_agent_id').references('users.id').notNullable();
      table.integer('calendar_service_id').references('services.id');
      table.specificType('point', 'geometry(point, 4326)'); // 'this should default to resource location'
      table.integer('calendar_capacity') //.notNullable();
      table.integer('calendar_price') //.notNullable();
      table.timestamp('delete_date')
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());    
    }),


    // ________________________________________________________

    knex.schema.createTable('calendarRecurringDay', function(table) {
      table.increments();
      table.integer('calendar_id').references('calendars.id').notNullable();
      table.enu('dow', [0,1,2,3,4,5,6]).notNullable();
    }),

    // ________________________________________________________

    knex.schema.createTable('calendarRecurringTime', function(table) {
      table.increments();
      table.integer('calendar_recurring_day_id').references('calendarRecurringDay.id').notNullable();
      table.time('start').notNullable();
      table.time('end').notNullable();
    }),


    // ________________________________________________________

    knex.schema.createTable('calendarScheduleOverride', function(table) {
      table.increments();
      table.integer('calendar_id').references('calendars.id').notNullable();
      table.boolean('available').notNullable();
      table.dateTime('start').notNullable();
      table.dateTime('end').notNullable();
    }),



    // ________________________________________________________

    knex.schema.createTable('bookings', function(table) {
      table.increments();
      table.integer('bookings_agent_id').references('users.id').notNullable();
      table.integer('booking_calendar_id').references('calendars.id').notNullable();

      table.dateTime('start').notNullable();
      table.dateTime('end').notNullable();

      table.integer('booking_capacity') //.notNullable();

      table.string('booking_status');
      table.integer('notes', 500);
      table.jsonb('custom_data', 500);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

      // # Statuses
      //   # // upcoming
      //   # // complete
      //   # // cancelled
      //   # // needs_attention
    }),





    // ________________________________________________________

    knex.schema.createTable('dismissedBookings', function(table) {
      table.increments();
      table.integer('booking_id').references('bookings.id').notNullable();
      table.integer('event_id').references('events.id');
      table.integer('booking_user_id').references('users.id');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }),


    // ________________________________________________________

    knex.schema.createTable('enrolledUsers', function(table) {
      table.increments();
      table.integer('booking_id').references('bookings.id').notNullable();
      table.integer('event_id').references('events.id');
      table.integer('booking_user_id').references('users.id');
      table.string('status');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

      // need an index to make sure we have either a booking or event id
    }),






    // ________________________________________________________

    knex.schema.createTable('roles', function(table) {
      table.increments();
      table.timestamp('delete_date');
      table.string('role_name').defaultTo('user').unique().notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    }),

    // ________________________________________________________

    knex.schema.createTable('photos', function(table) {
      table.increments();
      table.boolean('default').defaultTo(true);
      table.string('url', 500).notNullable();
      table.integer('photo_resource_id').references('resources.id');
      table.integer('photo_service_id').references('services.id');
      // index service or resource needs to be.

      table.integer('photo_skill_id').references('skills.id'); // REMOVEABLE
    }),

    // ________________________________________________________

    knex.schema.createTable('memberships', function(table) {
      table.increments();
      table.boolean('default').defaultTo(true);
      table.string('status').notNullable();
      table.integer('membership_resource_id').references('resources.id') //.notNullable();
      table.integer('membership_service_id').references('services.id')
      table.integer('membership_role_id').references('roles.id').notNullable();
      table.integer('membership_user_id').references('users.id').notNullable();
      // table.unique(['membership_user_id', 'membership_role_id', 'membership_resource_id', 'membership_service_id'])
      // Status types
        // pending_approval
        // approved
        // blocked
    }),


    // ________________________________________________________


    knex.schema.createTable('events', function(table) {
      table.increments();
      table.integer('event_resource_id').references('resources.id').notNullable();
      table.integer('event_agent_id').references('users.id').notNullable();

      table.string('event_name').notNullable();
      table.specificType('point', 'geometry(point, 4326)').notNullable(); // 'this should default to resource location'
      table.string('event_image');
      table.integer('description', 500);
      table.integer('event_price').notNullable();
      table.dateTime('event_start').notNullable();
      table.integer('duration').notNullable();

      table.jsonb('notes');
      table.jsonb('custom_data');
      table.timestamp('delete_date')

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }),

    










    // ________________________________________________________

    knex.schema.createTable('paymentMethods', function(table) {
      table.increments();
      table.jsonb('card').notNullable();
      table.integer('user_id').references('users.id').notNullable();
      table.string('processor_id').notNullable();
      table.string('processor').notNullable();
      table.string('customer').notNullable();
      table.timestamp('delete_date')
      table.boolean('default')
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    }),


    // ________________________________________________________

    knex.schema.createTable('transactions', function(table) {
      table.increments();
      table.integer('user_charged_id').references('users.id').notNullable();
      table.integer('resource_id').references('resources.id').notNullable();

      table.string('description', 500).notNullable();      
      table.string('currency').notNullable();
      table.jsonb('confirmation_blob');

      table.string('processor').notNullable(); // currently will only be stripe
      table.integer('amount_after_processor').notNullable();
      table.integer('amount_after_processor_and_app').notNullable();
      table.integer('amount').notNullable();

      table.string('transaction_reason').notNullable();
      table.string('status').notNullable();

      table.jsonb('metadata');
        // METADATA VALUES.
        // table.integer('agent_id').references('users.id').notNullable();
        // table.integer('service_id').references('services.id');
        // table.integer('product_id').references('products.id');
        // table.integer('booking_id').references('bookings.id');
        // table.integer('event_id').references('events.id');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    }),

    // ________________________________________________________

    knex.schema.createTable('refunds', function(table) {
      table.increments();
      table.integer('transaction_id').references('transactions.id').notNullable();
      table.jsonb('confirmation_blob');
      table.string('status').notNullable();
      table.string('refund_reason', 500).notNullable();
      table.integer('amount');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    }),


    // ________________________________________________________

    knex.schema.createTable('favorites', function(table) {
      table.increments();
      table.integer('user_id').references('users.id').notNullable();
      table.integer('favorites_service_id').references('services.id');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    }),

    // ________________________________________________________

    knex.schema.createTable('conversations', function(table) {
      table.increments();
      table.boolean('repliable').defaultTo(true);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.integer('last_message').references('chats.id');
    }),

    // ________________________________________________________

    knex.schema.createTable('usersConversations', function(table) {
      table.increments();
      table.integer('conversation_id').references('conversations.id').notNullable();
      table.integer('conversation_user_id').references('users.id').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }),

    // ________________________________________________________

    knex.schema.createTable('chats', function(table) {
      table.increments();
      table.integer('chat_conversation_id').references('conversations.id').notNullable();
      table.integer('chat_user_id').references('users.id').notNullable();
      table.string('log', 5000).notNullable();
      table.timestamp('delete_date')
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }),

    // ________________________________________________________

    knex.schema.createTable('skills', function(table) { // REMOVEABLE
      table.increments();
      table.string('description', 5000).notNullable();
      table.string('name', 200).notNullable().unique();
      table.string('image', 500).notNullable()
      table.integer('rank').unique();
      table.timestamp('delete_date')
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    })



  ])
};

exports.down = function(knex, Promise) {  
  
};

