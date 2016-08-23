var knex = require('../db/knex');
var st = require('knex-postgis')(knex);
var resource;
var user1;
var user2;
var user3;
var user4;
var conversation;
var conversation2;
var skill1;
exports.seed = function(knex, Promise) {
    return Promise.join(
            knex('services').del(),
            knex('resources').del(),
            knex('users').del(),
            knex('roles').del(),
            knex('usersConversations').del(),
            knex('conversations').del(),
            knex('chats').del(),
            knex('skills').del()
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
                knex('services').insert({
                    service_description: 'service description',
                    service_resource_id: resource,
                    service_type: 'private',
                    service_name: 'Privates',
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
            return Promise.join(
                knex('services').insert({
                    service_description: '2 service description 2',
                    service_resource_id: resource,
                    service_type: '2 private 2',
                    service_name: '2 Privates 2',
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
          var service = ids[0][0];
            return Promise.join(
              knex('calendars').insert({
                calendar_agent_id: user1,
                calendar_service_id: service,
                // calendar_resource_id: 1,
                calendar_capacity: 3,
                calendar_price: 60,
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

