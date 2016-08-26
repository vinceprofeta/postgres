var knex = require('../db/knex');
var st = require('knex-postgis')(knex);
var moment = require('moment');
var resource;
var resource2;
var service1;
var service2;
var service3;
var service4;
var calendar1;
var calendar2;
var calendar3;
var calendar4;
var calendar5;
var calendar6;

var calendarRecurringDay1;
var calendarRecurringDay2;
var calendarRecurringDay3;

var calendarRecurringDay4;
var calendarRecurringDay5;
var calendarRecurringDay6;

var calendarRecurringDay7;
var calendarRecurringDay8;
var calendarRecurringDay9;

var calendarRecurringDay10;
var calendarRecurringDay11;
var calendarRecurringDay12;

// var calendarRecurringDay13;
// var calendarRecurringDay14;
// var calendarRecurringDay15;

var calendarRecurringTime1;
var calendarRecurringTime2;
var calendarRecurringTime3;
var calendarRecurringTime4;
var calendarRecurringTime5;
var calendarRecurringTime6;
var calendarRecurringTime7;
var calendarRecurringTime8;
var calendarRecurringTime9;
var calendarRecurringTime10;
var calendarRecurringTime11;
var calendarRecurringTime12;
var calendarRecurringTime13;
var calendarRecurringTime14;
var calendarRecurringTime15;
var calendarRecurringTime16;
var calendarRecurringTime17;
var calendarRecurringTime18;
var calendarRecurringTime19;

var calendarScheduleOverride1;
var calendarScheduleOverride2;
var calendarScheduleOverride3;
var calendarScheduleOverride4;

var booking1;

var user1;
var user2;
var user3;
var user4;
var conversation;
var conversation2;
var skill1;
exports.seed = function(knex, Promise) {
    return Promise.join(
            knex('calendarScheduleOverride').del(),
            knex('bookings').del(),
            knex('enrolledUsers').del(),
            knex('calendars').del(),
            knex('calendarRecurringTime').del(),
            knex('calendarRecurringDay').del(),
            knex('services').del(),
            knex('resources').del(),
            knex('roles').del(),
            knex('usersConversations').del(),
            knex('conversations').del(),
            knex('chats').del(),
            knex('skills').del(),
            knex('users').del()
        )

        // SKILLS

        .then(function(ids) {
            return Promise.join(
                knex('skills').insert({
                  name: 'Soccer',
                  rank: 1,
                  description: 'soccer drills desc',
                  image: 'https://images.unsplash.com/photo-1451256656121-9ffc0c898a49?crop=entropy&fit=crop&fm=jpg&h=275&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=400',
                }).returning('id')
            );
        })
        .then(function(ids) {
            skill1 = ids[0][0];
            console.log(skill1)
            return Promise.join(
                knex('skills').insert({
                  name: 'Science',
                  rank: 2,
                  image: 'https://images.unsplash.com/photo-1453733190371-0a9bedd82893?crop=entropy&fit=crop&fm=jpg&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=400',
                  description: 'Science problems'
                }).returning('id')
            );
        })
        .then(function(ids) {
            return Promise.join(
                knex('skills').insert({
                  name: 'Guitar',
                  rank: 3,
                  image: 'https://images.unsplash.com/photo-1459305272254-33a7d593a851?crop=entropy&fit=crop&fm=jpg&h=275&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=400',
                  description: 'Guitar drills'
                }).returning('id')
            );
        })




        // ROLES
        .then(function() {
            return Promise.join(
                knex('roles').insert({
                  role_name: 'user'
                }).returning('id')
            );
        })
        .then(function() {
            return Promise.join(
                knex('roles').insert({
                  role_name: 'agent'
                }).returning('id')
            );
        })
        .then(function() {
            return Promise.join(
                knex('roles').insert({
                  role_name: 'resource-admin'
                }).returning('id')
            );
        })
        .then(function() {
            return Promise.join(
                knex('roles').insert({
                  role_name: 'app-owner'
                }).returning('id')
            );
        })
        // Users
        .then(function() {
            return Promise.join(
                knex('users').insert({
                  first_name: 'Vinces',
                  last_name: 'Profeta',
                  email: 'vprofeta12@gmail.com',
                  bio: 'Worked in dev for mobile and web',
                  phone: '444-444-4444',
                  password: 'd',
                  avatar: 'TODO',
                  stripe_customer_id: '123'
                }).returning('id')
            );
        })
        .then(function(ids) {
            user1 = ids[0][0];
            return Promise.join(
                knex('users').insert({
                  first_name: 'James',
                  last_name: 'Harden',
                  email: 'James@gmail.com',
                  bio: 'Test master in web and mobile',
                  phone: '444-444-4444',
                  password: 'd',
                  avatar: 'TODO',
                  stripe_customer_id: '1234'
                }).returning('id')
            );
        })
        .then(function(ids) {
            user2 = ids[0][0];
            return Promise.join(
                knex('users').insert({
                  first_name: 'Lebron',
                  last_name: 'Hames',
                  email: 'lbj@gmail.com',
                  bio: 'Basketball Star',
                  phone: '444-444-4444',
                  password: 'd',
                  avatar: 'TODO',
                  stripe_customer_id: '1234'
                }).returning('id')
            );
        })
        .then(function(ids) {
            user3 = ids[0][0];
            return Promise.join(
                knex('users').insert({
                  first_name: 'Dana',
                  last_name: 'Gordon',
                  email: 'dana@gmail.com',
                  bio: 'Movie Star',
                  phone: '444-444-4444',
                  password: 'd',
                  avatar: 'TODO',
                  stripe_customer_id: '1234'
                }).returning('id')
            );
        })
        .then(function(ids) {
            user4 = ids[0][0];
            return Promise.join(
                knex('resources').insert({
                  resourceName: 'Vinces Spot',
                  app_fee_percentage_take:  0,
                  app_fee_flat_fee_take: 100,
                  booking_percent_take: 0,
                  booking_flat_fee_take: 100,
                  description: 'This is a sample',
                  point: st.geomFromText('Point(-81.681290 41.505493)', 4326),
                  cancellation_policy_percent_take: 0,
                  cancellation_policy_flat_fee_take: 100,
                  cancellation_policy_window: 18,
                  street_address: '2941 lamplight ln',
                  city: 'Cleveland',
                  state: 'OH',
                  zipcode: 44094,
                  phone: '440-444-4444',
                  email: 'vprofeta12@gmail.com',
                  website: 'www.google.com',
                  timezone: 'bs'
                }).returning('id')
            );
        })
        .then(function(ids) {
            resource = ids[0][0];
            return Promise.join(
                knex('resources').insert({
                  resourceName: 'Spot Number 2',
                  app_fee_percentage_take:  0,
                  app_fee_flat_fee_take: 100,
                  booking_percent_take: 0,
                  booking_flat_fee_take: 100,
                  description: 'Spot 2',
                  point: st.geomFromText('Point(-81.6831290 41.5305493)', 4326),
                  cancellation_policy_percent_take: 0,
                  cancellation_policy_flat_fee_take: 100,
                  cancellation_policy_window: 18,
                  street_address: '901 lamplight ln',
                  city: 'Austin',
                  state: 'Tx',
                  zipcode: 44094,
                  phone: '440-444-4444',
                  email: 'vprofeta12@gmail.com',
                  website: 'www.google.com',
                  timezone: 'bs'
                }).returning('id')
            );
        })
        .then(function(ids) {
            resource2 = ids[0][0];
            return Promise.join(
                knex('services').insert({
                    service_description: 'Service 1',
                    service_resource_id: resource,
                    service_type: 'Service 1',
                    service_name: 'Service 1',
                    active: true,
                    image: 'test',
                    service_capacity: 3,
                    service_duration: 30,
                    service_price: 60,
                    service_skill_id: skill1
                }).returning('id')
            );
        })
        .then(function(ids) {
            service1 = ids[0][0];
            return Promise.join(
                knex('services').insert({
                    service_description: 'Service 2',
                    service_resource_id: resource,
                    service_type: 'Service 2',
                    service_name: 'Service 2',
                    active: true,
                    image: 'test',
                    service_capacity: 3,
                    service_duration: 30,
                    service_price: 60,
                    service_skill_id: skill1
                }).returning('id')
            );
        })
        .then(function(ids) {
            service2 = ids[0][0];
            return Promise.join(
                knex('services').insert({
                    service_description: 'Service 3',
                    service_resource_id: resource2,
                    service_type: 'Service 3',
                    service_name: 'Service 3',
                    active: true,
                    image: 'test',
                    service_capacity: 3,
                    service_duration: 30,
                    service_price: 60,
                    service_skill_id: skill1
                }).returning('id')
            );
        })
        .then(function(ids) {
            service3 = ids[0][0];
            return Promise.join(
                knex('services').insert({
                    service_description: 'Service 4',
                    service_resource_id: resource2,
                    service_type: 'Service 4',
                    service_name: 'Service 4',
                    active: true,
                    image: 'test',
                    service_capacity: 3,
                    service_duration: 30,
                    service_price: 60,
                    service_skill_id: skill1
                }).returning('id')
            );
        })
        

        // ADD CALENDAR SEED
        .then(function(ids) {
            service4 = ids[0][0];
            return Promise.join(
              knex('calendars').insert({
                calendar_agent_id: user1,
                calendar_service_id: service1,
                // calendar_resource_id: 1,
                calendar_capacity: 3,
                calendar_price: 60,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendar1 = ids[0][0];
            return Promise.join(
              knex('calendars').insert({
                calendar_agent_id: user2,
                calendar_service_id: service1,
                // calendar_resource_id: 1,
                calendar_capacity: 1,
                calendar_price: 60,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendar2 = ids[0][0];
            return Promise.join(
              knex('calendars').insert({
                calendar_agent_id: user1,
                calendar_service_id: service2,
                // calendar_resource_id: 1,
                calendar_capacity: 1,
                calendar_price: 60,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendar3 = ids[0][0];
            return Promise.join(
              knex('calendars').insert({
                calendar_agent_id: user2,
                calendar_service_id: service2,
                // calendar_resource_id: 1,
                calendar_capacity: 1,
                calendar_price: 60,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendar4 = ids[0][0];
            return Promise.join(
              knex('calendars').insert({
                calendar_agent_id: user3,
                calendar_service_id: service3,
                // calendar_resource_id: 1,
                calendar_capacity: 1,
                calendar_price: 60,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendar5 = ids[0][0];
            return Promise.join(
              knex('calendars').insert({
                calendar_agent_id: user4,
                calendar_service_id: service4,
                // calendar_resource_id: 1,
                calendar_capacity: 1,
                calendar_price: 60,
              }).returning('id')
          );
        })


        .then(function(ids) {
            calendar6 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringDay').insert({
               calendar_id: calendar1,
               dow: 1,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendarRecurringDay1 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringDay').insert({
               calendar_id: calendar1,
               dow: 3,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendarRecurringDay2 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringDay').insert({
               calendar_id: calendar1,
               dow: 5,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendarRecurringDay3 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringDay').insert({
               calendar_id: calendar2,
               dow: 1,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendarRecurringDay4 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringDay').insert({
               calendar_id: calendar2,
               dow: 3,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendarRecurringDay5 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringDay').insert({
               calendar_id: calendar2,
               dow: 5,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendarRecurringDay6 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringDay').insert({
               calendar_id: calendar3,
               dow: 2,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendarRecurringDay7 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringDay').insert({
               calendar_id: calendar3,
               dow: 4,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendarRecurringDay8 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringDay').insert({
               calendar_id: calendar3,
               dow: 2,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendarRecurringDay9 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringDay').insert({
               calendar_id: calendar3,
               dow: 4,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendarRecurringDay10 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringDay').insert({
               calendar_id: calendar4,
               dow: 0,
              }).returning('id')
          );
        })

        .then(function(ids) {
            calendarRecurringDay11 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringDay').insert({
               calendar_id: calendar4,
               dow: 6,
              }).returning('id')
          );
        })









        .then(function(ids) {
            calendarRecurringDay12 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay1,
               start: '02:00',
               end: '05:00',
              }).returning('id')
          );
        })

      .then(function(ids) {
            calendarRecurringTime1 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay1,
               start: '07:00',
               end: '09:00',
              }).returning('id')
          );
        })



      .then(function(ids) {
            calendarRecurringTime2 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay2,
               start: '02:00',
               end: '05:00',
              }).returning('id')
          );
        })

      .then(function(ids) {
            calendarRecurringTime3 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay2,
               start: '07:00',
               end: '09:00',
              }).returning('id')
          );
        })



      .then(function(ids) {
            calendarRecurringTime4 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay3,
               start: '02:00',
               end: '05:00',
              }).returning('id')
          );
        })

      .then(function(ids) {
            calendarRecurringTime5 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay3,
               start: '07:00',
               end: '09:00',
              }).returning('id')
          );
        })



      .then(function(ids) {
            calendarRecurringTime6 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay4,
               start: '02:00',
               end: '05:00',
              }).returning('id')
          );
        })

      .then(function(ids) {
            calendarRecurringTime7 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay4,
               start: '07:00',
               end: '09:00',
              }).returning('id')
          );
        })



      .then(function(ids) {
            calendarRecurringTime8 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay5,
               start: '02:00',
               end: '05:00',
              }).returning('id')
          );
        })

      .then(function(ids) {
            calendarRecurringTime9 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay5,
               start: '07:00',
               end: '09:00',
              }).returning('id')
          );
        })


      .then(function(ids) {
            calendarRecurringTime10 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay6,
               start: '02:00',
               end: '05:00',
              }).returning('id')
          );
        })

      .then(function(ids) {
            calendarRecurringTime11 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay6,
               start: '07:00',
               end: '09:00',
              }).returning('id')
          );
        })


      .then(function(ids) {
            calendarRecurringTime12 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay7,
               start: '04:30',
               end: '5:30',
              }).returning('id')
          );
        })

      .then(function(ids) {
            calendarRecurringTime13 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay7,
               start: '07:30',
               end: '09:00',
              }).returning('id')
          );
        })


      .then(function(ids) {
            calendarRecurringTime14 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay8,
               start: '04:30',
               end: '08:30',
              }).returning('id')
          );
        })

      .then(function(ids) {
            calendarRecurringTime15 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay8,
               start: '09:00',
               end: '10:00',
              }).returning('id')
          );
        })


      .then(function(ids) {
            calendarRecurringTime16 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay9,
               start: '02:00',
               end: '8:00',
              }).returning('id')
          );
        })


      .then(function(ids) {
            calendarRecurringTime17 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay10,
               start: '02:00',
               end: '8:00',
              }).returning('id')
          );
        })


      .then(function(ids) {
            calendarRecurringTime18 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay11,
               start: '02:00',
               end: '8:00',
              }).returning('id')
          );
        })


      .then(function(ids) {
            calendarRecurringTime19 = ids[0][0];
            return Promise.join(
              knex('calendarRecurringTime').insert({
               calendar_recurring_day_id: calendarRecurringDay12,
               start: '02:00',
               end: '08:00',
              }).returning('id')
          );
        })


      .then(function(ids) {
            calendarRecurringTime20 = ids[0][0];
            return Promise.join(
              knex('calendarScheduleOverride').insert({
               available: true,
               calendar_id: calendar1,
               start: moment("2016-08-23T12:50:00-05:00").add(4, 'weeks').add(3, 'hours').format(),
               end: moment("2016-08-23T12:50:00-05:00").add(4, 'weeks').add(5, 'hours').format(),
              }).returning('id')
          );
        })

      .then(function(ids) {
            calendarScheduleOverride1 = ids[0][0];
            return Promise.join(
              knex('calendarScheduleOverride').insert({
               available: true,
               calendar_id: calendar1,
               start: moment("2016-08-23T12:50:00-05:00").add(1, 'days').add(4, 'weeks').add(3, 'hours').format(),
               end: moment("2016-08-23T12:50:00-05:00").add(1, 'days').add(5, 'hours').format(),
              }).returning('id')
          );
        })


      .then(function(ids) {
            calendarScheduleOverride2 = ids[0][0];
            return Promise.join(
              knex('calendarScheduleOverride').insert({
               available: true,
               calendar_id: calendar1,
               start: moment("2016-08-23T12:50:00-05:00").add(2, 'days').add(4, 'weeks').add(3, 'hours').format(),
               end: moment("2016-08-23T12:50:00-05:00").add(2, 'days').add(4, 'weeks').add(5, 'hours').format(),
              }).returning('id')
          );
        })


      .then(function(ids) {
            calendarScheduleOverride3 = ids[0][0];
            return Promise.join(
              knex('calendarScheduleOverride').insert({
               available: true,
               calendar_id: calendar1,
               start: moment("2016-08-23T12:50:00-05:00").add(2, 'days').add(4, 'weeks').add(3, 'hours').format(),
               end: moment("2016-08-23T12:50:00-05:00").add(2, 'days').add(4, 'weeks').add(5, 'hours').format(),
              }).returning('id')
          );
        })








      .then(function(ids) {
            calendarScheduleOverride4 = ids[0][0];
            return Promise.join(
              knex('bookings').insert({
               booking_calendar_id: calendar1,
               bookings_agent_id: user1,
               start: moment("2016-08-23T13:31:25-05:00").add(3, 'days').set('hour', 3),
               end: moment("2016-08-23T13:31:25-05:00").add(3, 'days').set('hour', 4),
              }).returning('id')
          );
        })


      .then(function(ids) {
            booking1 = ids[0][0];
            return Promise.join(
              knex('enrolledUsers').insert({
               booking_id: booking1,
               booking_user_id: user2,
               status: 'confirmed'
              }).returning('id')
          );
        })

      









        .then(function(ids) {
            return Promise.join(
                knex('conversations').insert({
                }).returning('id')
            );
        })
        .then(function(ids) {
            conversation = ids[0][0];
            return Promise.join(
                knex('conversations').insert({
                }).returning('id')
            );
        })
        .then(function(ids) {
            conversation2 = ids[0][0];
            return Promise.join(
                knex('usersConversations').insert({
                  conversation_id: conversation,
                  conversation_user_id: user1
                }).returning('id')
            );
        })
        .then(function(ids) {
            return Promise.join(
                knex('usersConversations').insert({
                  conversation_id: conversation,
                  conversation_user_id: user2
                }).returning('id')
            );
        })
        .then(function(ids) {
            return Promise.join(
                knex('usersConversations').insert({
                  conversation_id: conversation2,
                  conversation_user_id: user3
                }).returning('id')
            );
        })
        .then(function(ids) {
            return Promise.join(
                knex('usersConversations').insert({
                  conversation_id: conversation2,
                  conversation_user_id: user4
                }).returning('id')
            );
        })
        .then(function(ids) {
            return Promise.join(
                knex('chats').insert({
                  chat_conversation_id: conversation,
                  chat_user_id: user1,
                  log: 'Chat 1'
                }).returning('id')
            );
        })
        .then(function(ids) {
            return Promise.join(
                knex('chats').insert({
                  chat_conversation_id: conversation2,
                  chat_user_id: user2,
                  log: 'Chat 2'
                }).returning('id')
            );
        })
        .then(function(ids) {
            return Promise.join(
                knex('chats').insert({
                  chat_conversation_id: conversation,
                  chat_user_id: user3,
                  log: 'CHAT 3'
                }).returning('id')
            );
        })
        .then(function(ids) {
            return Promise.join(
                knex('chats').insert({
                  chat_conversation_id: conversation2,
                  chat_user_id: user4,
                  log: 'CHAT 4'
                }).returning('id')
            );
        })
        .then(function(ids) {
            return Promise.join(
                knex('chats').insert({
                  chat_conversation_id: conversation2,
                  chat_user_id: user4,
                  log: 'CHAT 4'
                }).returning('id')
            );
        })
};

