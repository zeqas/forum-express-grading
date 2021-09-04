'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Restaurants', 'CategoryId', {
      type: Sequelize.INTEGER,
    }),
      await queryInterface.addConstraint('Restaurants', {
        fields: ['CategoryId'],
        type: 'foreign key',
        references: {
          table: 'Categories',
          field: 'id'
        },
        onDelete: 'cascade', 
        onUpdate: 'cascade'
      });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Restaurants', 'CategoryId')
  }
};