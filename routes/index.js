const helpers = require('../_helpers')

const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')

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
      if (helpers.getUser(req).isAdmin) { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }

  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', authenticated, restController.getRestaurants)

  // Admin main page
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

  // admin toggle
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)

  app.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)

  // Signup & in
  app.get('/signup', userController.signUpPage)

  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signInPage)

  app.post('/signin', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }), userController.signIn)

  app.get('/logout', userController.logout)
  
  // Category - Read
  app.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)

  // Category - Create
  app.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)

  // Category - Update
  app.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
  app.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)

  // Category - Delete
  app.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

  // User - Read
  app.get('/restaurants/:id', authenticated, restController.getRestaurant)

  // Comments
  app.post('/comments', authenticated, commentController.postComment)
}