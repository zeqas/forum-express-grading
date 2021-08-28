const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant

const adminController = {
  // Read
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true }).then(restaurants => {
      return res.render('admin/restaurants', { restaurants })
    })
  },
  // Create
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },
  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null
        }).then((restaurant) => {
          req.flash('success_messages', 'restaurant was successfully created')
          return res.redirect('/admin/restaurants')
        })
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null
      }).then((restaurant) => {
        req.flash('success_messages', 'restaurant was successfully created')
        return res.redirect('/admin/restaurants')
      })
    }
  },
  // Read the restaurant
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      raw: true
    }).then(restaurant => {
      return res.render('admin/restaurant', {
        restaurant: restaurant
      })
    })
  },
  // Update
  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      raw: true
    }).then(restaurant => {
      return res.render('admin/create', { restaurant: restaurant })
    })
  },
  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image
            })
              .then((restaurant) => {
                req.flash('success_messages', 'restaurant was successfully to update')
                res.redirect('/admin/restaurants')
              })
          })
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image
          })
            .then((restaurant) => {
              req.flash('success_messages', 'restaurant was successfully to update')
              res.redirect('/admin/restaurants')
            })
        })
    }
  },
  // Delete
  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            res.redirect('/admin/restaurants')
          })
      })
  },
  // switch Users
  getUsers: (req, res) => {
    return User.findAll({ raw: true }).then(users => {
      return res.render('admin/users', { users })
    })
  },
  // toggleAdmin
  toggleAdmin: (req, res) => {
    // const id = req.params.id
    // User.findByPk(id)
    //   .then(user => {
    //     switch (user.isAdmin) {
    //       case true:
    //         user.update({
    //           isAdmin : false
    //         })
    //         req.flash('success_messages', 'admin change to user successfully')
    //         res.redirect('/admin/users')
    //         break
    //       case false:
    //         user.update({
    //           isAdmin: true
    //         })
    //         req.flash('success_messages', 'user change to admin successfully')
    //         res.redirect('/admin/users')
    //         break
    //     }
    //   })

    // if (isAdmin) {
    //   return User.findByPk(req.params.id)
    //     .then((user) => {
    //       user.update({
    //         isAdmin: isAdmin ? false : true
    //       })
    //         .then((user) => {
    //           req.flash('success_messages', 'user was successfully to update')
    //           res.redirect('/admin/users')
    //         })
    //     })
    // }
    const id = req.params.id
    User.findByPk(id)
      .then((user) => {
        const isAdmin = user.isAdmin ? false : true
        user.update({
          isAdmin
        })
          .then((user) => {
            let message = ''
            if (user.isAdmin) {
              message = '權限已設定為 Admin'
            } else { message = '權限已設定為 User' }
            req.flash('success_messages', message)
            res.redirect('/admin/users')
          })
          .catch(error => console.log(error))
      })
      .catch(err => console.log(err))

  },

}

module.exports = adminController