exports.up = function(knex, Promise) {  
  return Promise.all([
    knex.schema.createTable('resources', function(table){
      table.increments();
      table.string('resource_name').notNullable();
      table.integer('appFeePercentageTake').defaultTo(0);
      table.integer('appFeeFlatFeeTake').defaultTo(100);
      table.integer('bookingPercentTake').defaultTo(0);
      table.integer('bookingFlatFeeTake').defaultTo(0);
      table.string('description', 500);
      table.specificType('point', 'geometry(point, 4326)').notNullable().unique();
      table.integer('cancellationPolicyPercentTake').defaultTo(0).notNullable();
      table.integer('cancellationPolicyFlatFeeTake').defaultTo(0).notNullable();
      table.integer('cancellationPolicyWindow').defaultTo(0);
      table.string('street_address').notNullable().unique();
      table.string('city').notNullable();
      table.string('state').notNullable();
      table.integer('zipcode').notNullable();
      table.string('phone').notNullable();
      table.string('email').notNullable();
      table.string('website').notNullable();
      table.timestamps()

    }),
    
    // ________________________________________________________

    knex.schema.createTable('services', function(table){
      table.increments();
      table.string('serviceDescription', 500);
      table.integer('service_resource_id').references('resources.id').notNullable();
      table.string('serviceType').notNullable()
      table.string('serviceName').notNullable()
      table.boolean('active').notNullable().defaultTo(true)
      table.string('image')
      table.integer('serviceCapacity').notNullable().defaultTo(1);
      table.integer('serviceDuration').notNullable().defaultTo(60);
      table.integer('servicePrice').notNullable();
      table.timestamp('deleted')
      table.specificType('point', 'geometry(point, 4326)')
      table.timestamps() // updated and created at.

      // serviceName needs to be uniqe based on resource 
    }),

    // ________________________________________________________

    knex.schema.createTable('users', function(table) {
      table.increments();
      table.string('firstName').notNullable()
      table.string('lastName').notNullable()
      table.string('email').notNullable()
      table.string('bio')
      table.string('phone')
      table.string('password').notNullable()
      table.string('avatar')
      table.string('stripeCustomerId')
      table.timestamp('deleted')
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }),

    // ________________________________________________________

    knex.schema.createTable('roles', function(table) {
      table.increments();
      table.timestamp('deleted');
      table.string('roleName').defaultTo('user').unique().notNullable();
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
    }),

    // ________________________________________________________

    knex.schema.createTable('memberships', function(table) {
      table.increments();
      table.boolean('default').defaultTo(true);
      table.string('status').notNullable();
      table.integer('membership_resource_id').references('resources.id').notNullable();
      table.integer('membership_service_id').references('services.id').notNullable();
      table.integer('membership_role_id').references('roles.id').notNullable();
    }),

    // ________________________________________________________

    knex.schema.createTable('scheduleCalendar', function(table) {
      table.increments();
      table.string('scheduleType').notNullable();
      table.integer('typeId').notNullable();
      table.integer('repeatInterval');
      table.dateTime('startTime').notNullable();
      table.dateTime('endTime');
      table.integer('duration');
      // need duration or end time

    }),

    // ________________________________________________________

    knex.schema.createTable('events', function(table) {
      table.increments();
      table.string('eventName').notNullable();
      table.integer('event_resource_id').references('resources.id').notNullable();
      table.integer('event_agent_id').references('users.id').notNullable();
      table.specificType('point', 'geometry(point, 4326)').notNullable(); // 'this should default to resource location'
      table.string('eventImage');
      table.integer('description', 500);
      table.integer('eventPrice').notNullable();
      table.dateTime('eventDate').notNullable();
      table.dateTime('eventStart').notNullable();
      table.dateTime('eventEnd').notNullable();
      table.integer('notes', 500);
      table.jsonb('customData', 500);
      table.timestamp('deleted')
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }),

    // ________________________________________________________

    knex.schema.createTable('dismissedBookings', function(table) {
      table.increments();
      table.integer('dissmissedBooking_user_id').references('users.id').notNullable();
      table.integer('dissmissedBooking_booking_id').references('bookings.id').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }),

    // ________________________________________________________

    knex.schema.createTable('calendars', function(table) {
      table.increments();
      table.integer('calendar_resource_id').references('resources.id').notNullable();
      table.integer('calendar_agent_id').references('users.id').notNullable();
      table.integer('calendar_service_id').references('services.id');
      table.specificType('point', 'geometry(point, 4326)'); // 'this should default to resource location'
      table.integer('calendarCapacity').notNullable();
      table.integer('calendarPrice').notNullable();
      table.timestamp('deleted')      
    }),


    // ________________________________________________________

    knex.schema.createTable('enrolledUsers', function(table) {
      table.increments();
      table.integer('enrolledUsers_booking_id').references('bookings.id').notNullable();
      table.integer('enrolledUsers_event_id').references('events.id');
      table.integer('enrolledUsers_user_id').references('users.id');
      table.string('status');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

      // need an index to make sure we have either a booking or event id
    }),


  // ________________________________________________________

    knex.schema.createTable('bookings', function(table) {
      table.increments();
      table.integer('bookings_resource_id').references('resources.id').notNullable();
      table.integer('bookings_agent_id').references('users.id').notNullable();
      table.integer('bookings_service_id').references('services.id');

      table.dateTime('bookingDate').notNullable();
      table.dateTime('bookingStart').notNullable();
      table.dateTime('bookingEnd').notNullable();
      table.integer('bookingDuration');

      table.integer('bookingCapacity').notNullable();
      table.integer('bookingPrice').notNullable();

      table.string('bookingStatus');
      table.integer('notes', 500);
      table.jsonb('customData', 500);
      // table.timestamp('deleted')
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }),


    // ________________________________________________________

    knex.schema.createTable('paymentMethods', function(table) {
      table.increments();
      table.jsonb('card').notNullable();
      table.integer('paymentMethod_user_id').references('users.id').notNullable();
      table.string('processorId').notNullable();
      table.string('processor').notNullable();
      table.string('customer').notNullable();
      table.timestamp('deleted')
      table.boolean('default')
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    }),


    // ________________________________________________________

    knex.schema.createTable('transactions', function(table) {
      table.increments();
      table.integer('user_charged_id').references('users.id').notNullable();
      table.integer('transaction_resource_id').references('resources.id').notNullable();
      table.jsonb('metadata');
        // METADATA VALUES.
        // table.integer('agent_id').references('users.id').notNullable();
        // table.integer('service_id').references('services.id');
        // table.integer('product_id').references('products.id');
        // table.integer('booking_id').references('bookings.id');
        // table.integer('event_id').references('events.id');

      table.string('description', 500).notNullable();      
      table.string('currency').notNullable();
      table.jsonb('charge');

      table.string('processor').notNullable(); // currently will only be stripe
      table.integer('amountAfterProcessor').notNullable();
      table.integer('amountAfterProcessorAndApp').notNullable();
      table.integer('amount').notNullable();

      table.jsonb('refunded');
      table.string('type').notNullable();
      table.string('status').notNullable();

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
    }),

    // ________________________________________________________

    knex.schema.createTable('usersConversations', function(table) {
      table.increments();
      table.integer('conversation_id').references('conversations.id').notNullable();
      table.integer('conversation_user_id').references('users.id').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.unique(['conversation_id', 'conversation_user_id']);
    }),

    // ________________________________________________________

    knex.schema.createTable('chats', function(table) {
      table.increments();
      table.integer('chat_conversation_id').references('conversations.id').notNullable();
      table.integer('chat_user_id').references('users.id').notNullable();
      table.string('log', 5000).notNullable();
      table.timestamp('deleted')
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }),




  ])
};

exports.down = function(knex, Promise) {  
  
};

