const request = require('supertest')

const app = require('../app')

const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.ensureAuthenticated(req).isAdmin) {
        return next()
      }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }

  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', authenticated, restController.getRestaurants)

  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
  // Create
  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)

  app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)

  // Read
  app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)

  // Update
  app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)

  app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)

  // Delete
  app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)

  // Signup & in
  app.get('/signup', userController.signUpPage)

  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signInPage)

  app.post('/signin', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }), userController.signIn)

  app.get('/logout', userController.logout)
}

describe('# 測試環境初始化', function() {
    
  context('# First Test Case', () => {

    it(" GET /admin/users ", (done) => {
        request(app)
          .get('/')
          .end(function(err, res) {
            done()
        });
    });

  })
})