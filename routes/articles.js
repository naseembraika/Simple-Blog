const { Router } = require('express')
const { articlesController } = require('../controllers')

const router = Router();

router.get('/', articlesController.renderIndexPage)
router.get('/new', articlesController.renderNewArticlePage)
router.get('/:slug', articlesController.renderArticlePage)
router.get('/edit/:id', articlesController.renderEditArticle)

router.post('/new', articlesController.createNewArticle)

router.put('/edit/:id', articlesController.updateArticle)

router.delete('/delete/:id', articlesController.deleteArticleById)

module.exports = router;