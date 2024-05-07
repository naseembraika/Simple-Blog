const { Router } = require('express')
const { blogController } = require('../controllers')

const router = Router();

router.get('/', blogController.renderHomePage)
router.get('/about', blogController.renderAboutPage)
router.get('/contact', blogController.renderContactPage)

router.get('/author/:id', blogController.renderAuthorPage)
router.get('/article/:slug', blogController.renderArticlePage);

module.exports = router;