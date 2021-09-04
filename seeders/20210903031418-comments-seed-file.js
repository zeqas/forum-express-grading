'use strict';

const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 15 }).map((d, i) => ({
        text: faker.lorem.sentence(),
        UserId: Math.floor(Math.random() * 3) * 5 + 5,
        RestaurantId: Math.floor(Math.random() * 50) *10 + 5,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      ), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
}