const bcrypt = require('bcryptjs')
const imgur = require('imgur-node-api')

const helper = require('../_helpers')

const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const IMGUR_CLIENT_ID = 'a05a96597689f57'

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants') // 用 Passport 的 middleware 來處理，所以不必自己實作
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  // User Profile
  getUser: (req, res) => {
    const id = req.params.id
    const loginUserId = helper.getUser(req).id
    const whereQuery = {}

    if (req.query.restaurantId) {
      restaurantId = Number(req.query.userId)
      whereQuery.userId = restaurantId
    }

    // 尋找相關評論
    Comment.findAndCountAll({
      include: Restaurant,
      where: { UserId: id }
    })
      .then((result) => {
        const commentNum = result.count
        const commentRestaurants = result.rows
        const data = commentRestaurants.map(r => ({
          ...r.dataValues,
          restaurantImage: r.dataValues.Restaurant.image
        }))

        Restaurant.findAll({
          raw: true,
          nest: true,
          where: whereQuery
        }).then(() => {
          User.findByPk(id)
            .then((user) => {
              const userProfile = user.toJSON()
              return res.render('user', {
                data,
                restaurants: data,
                userProfile,
                loginUserId,
                commentNum,
              })
            })
        })
      })
      .catch(err => console.log(err))
  },

  editUser: (req, res) => {
    const id = req.params.id
    return User.findByPk(id, { raw: true })
    .then(user => {
      res.render('userEdit', { user })
    })
    .catch(err => console.log(err))
  },

  putUser: (req, res) => {
    const { name } = req.body
    const id = req.params.id
    
    if (Number(id) !== helper.getUser(req).id) {
      req.flash('error_messages', "cannot edit other user's profile")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(id)
          .then((user) => {
            user.update({
              name,
              image: file ? img.data.link : user.image
            }).then(() => {
              req.flash('success_messages', 'user was successfully to update')
              res.redirect(`/users/${id}`)
            })
          })
      })
    } else {
      return User.findByPk(id)
        .then((user) => {
          user.update({
            name,
            image: user.image
          }).then(() => {
            req.flash('success_messages', 'user was successfully to update')
            res.redirect(`/users/${id}`)
          })
        })
    }
  },

  // Favorite 
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return res.redirect('back')
      })
  },
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            return res.redirect('back')
          })
      })
  },

  // Like
  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return res.redirect('back')
      })
  },
  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((Like) => {
        Like.destroy()
          .then((restaurant) => {
            return res.redirect('back')
          })
      })
  },

  getTopUser:(req, res) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      // 依追蹤者人數排序清單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
  }
}

module.exports = userController