const { Router } = require('express')
const { authController } = require('../controllers')

const router = Router();

router.get('/login', authController.renderLoginPage)
router.get('/signup', authController.renderSignupPage)
router.get('/forgot-password', authController.renderForgotPassword)
router.get('/reset/:token', authController.renderResetPassword)

router.post('/login', authController.login)
router.post('/signup', authController.signup)
router.post('/reset', authController.forgotPassword)

router.put('/reset/:token', authController.resetPassword)

module.exports = router;