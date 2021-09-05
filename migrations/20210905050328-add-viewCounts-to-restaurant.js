'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add altering commands here.
    await queryInterface.addColumn('Restaurants', 'viewCounts', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    })
  },

  down: async (queryInterface, Sequelize) => {
    // Add reverting commands here.
    await queryInterface.removeColumn('Restaurants', 'viewCounts')
  }
};