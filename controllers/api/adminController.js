const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminController = {
  // Read
  getRestaurants: (req, res) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category] // include 拉關聯資料
    }).then(restaurants => {
      return res.json({ restaurants })
    })
  }
}

module.exports = adminController