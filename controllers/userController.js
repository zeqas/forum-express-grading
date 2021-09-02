const bcrypt = require('bcryptjs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helper = require('../_helpers')

const db = require('../models')
const User = db.User

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
    return User.findByPk(id).then(user => {
      console.log('-------------------------')
      console.log(user) // 加入 console 觀察資料的變化
      console.log('-------------------------')
      console.log('-------------------------')
      return res.render('user', {
        user: user.toJSON()
      })
    })
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
    
    // if (!name) {
    //   console.log(name)
    //   req.flash('error_messages', "name didn't exist")
    //   return res.redirect('back')
    // }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(id)
          .then((user) => {
            user.update({
              name,
              image: file ? img.data.link : user.image
            })
              .then((restaurant) => {
                req.flash('success_messages', 'Your profile was successfully up-to-date')
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
          })
            .then((user) => {
              req.flash('success_messages', 'Your profile was successfully up-to-date')
              res.redirect(`/users/${id}`)
            })
        })
    }
  }
}

module.exports = userController