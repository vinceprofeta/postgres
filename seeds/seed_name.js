var knex = require('../db/knex');
var st = require('knex-postgis')(knex);
var user1;
var user2;
var user3;
var user4;
var conversation;
var conversation2;
exports.seed = function(knex, Promise) {
    return Promise.join(
            knex('services').del(),
            knex('resources').del(),
            knex('users').del(),
            knex('roles').del(),
            knex('usersConversations').del(),
            knex('conversations').del(),
            knex('chats').del()
        )
        // ROLES
        .then(function() {
            return Promise.join(
                knex('roles').insert({
                  roleName: 'user'
                }).returning('id')
            );
        })
        .then(function() {
            return Promise.join(
                knex('roles').insert({
                  roleName: 'agent'
                }).returning('id')
            );
        })
        .then(function() {
            return Promise.join(
                knex('roles').insert({
                  roleName: 'resource-admin'
                }).returning('id')
            );
        })
        .then(function() {
            return Promise.join(
                knex('roles').insert({
                  roleName: 'app-owner'
                }).returning('id')
            );
        })
        // Users
        .then(function() {
            return Promise.join(
                knex('users').insert({
                  firstName: 'Vinces',
                  lastName: 'Profeta',
                  email: 'vprofeta12@gmail.com',
                  bio: 'Worked in dev for mobile and web',
                  phone: '444-444-4444',
                  password: 'd',
                  avatar: 'TODO',
                  stripeCustomerId: '123'
                }).returning('id')
            );
        })
        .then(function(ids) {
            user1 = ids[0][0];
            return Promise.join(
                knex('users').insert({
                  firstName: 'James',
                  lastName: 'Harden',
                  email: 'James@gmail.com',
                  bio: 'Test master in web and mobile',
                  phone: '444-444-4444',
                  password: 'd',
                  avatar: 'TODO',
                  stripeCustomerId: '1234'
                }).returning('id')
            );
        })
        .then(function(ids) {
            user2 = ids[0][0];
            return Promise.join(
                knex('users').insert({
                  firstName: 'Lebron',
                  lastName: 'Hames',
                  email: 'lbj@gmail.com',
                  bio: 'Basketball Star',
                  phone: '444-444-4444',
                  password: 'd',
                  avatar: 'TODO',
                  stripeCustomerId: '1234'
                }).returning('id')
            );
        })
        .then(function(ids) {
            user3 = ids[0][0];
            return Promise.join(
                knex('users').insert({
                  firstName: 'Dana',
                  lastName: 'Gordon',
                  email: 'dana@gmail.com',
                  bio: 'Movie Star',
                  phone: '444-444-4444',
                  password: 'd',
                  avatar: 'TODO',
                  stripeCustomerId: '1234'
                }).returning('id')
            );
        })
        .then(function(ids) {
            user4 = ids[0][0];
            return Promise.join(
                knex('resources').insert({
                  resource_name: 'Vinces Spot',
                  appFeePercentageTake:  0,
                  appFeeFlatFeeTake: 100,
                  bookingPercentTake: 0,
                  bookingFlatFeeTake: 100,
                  description: 'This is a sample',
                  point: st.geomFromText('Point(-81.681290 41.505493)', 4326),
                  cancellationPolicyPercentTake: 0,
                  cancellationPolicyFlatFeeTake: 100,
                  cancellationPolicyWindow: 18,
                  street_address: '2941 lamplight ln',
                  city: 'Cleveland',
                  state: 'OH',
                  zipcode: 44094,
                  phone: '440-444-4444',
                  email: 'vprofeta12@gmail.com',
                  website: 'www.google.com',
                }).returning('id')
            );
        })
        .then(function(ids) {
          var resource = ids[0][0];
            return Promise.join(
                knex('services').insert({
                    serviceDescription: 'service description',
                    service_resource_id: resource,
                    serviceType: 'private',
                    serviceName: 'Privates',
                    active: true,
                    image: 'test',
                    serviceCapacity: 3,
                    serviceDuration: 30,
                    servicePrice: 60
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

