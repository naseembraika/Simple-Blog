const { Router } = require('express')
const { dashboardController } = require('../controllers')
const multer = require('multer')

const imgMimeTypes = ['image/jpeg', 'image/png'];
const upload = multer({
    dest: 'public/uploads',
    fileFilter: function (req, file, callback) {
        callback(null, imgMimeTypes.includes(file.mimetype));
    }
})

const router = Router();

router.get('/', dashboardController.renderIndexPage);
router.get('/articles/new', dashboardController.renderNewArticlePage)
router.get('/logout', dashboardController.logout)
router.get('/admin/update/:id', dashboardController.renderUpdateAdminPage)
router.get('/articles/:slug', dashboardController.renderArticleBySlug)
router.get('/articles/edit/:id', dashboardController.renderArticleById)
router.get('/:url', (req, res, next) => {
    res.redirect('/dashboard')
})

router.post('/articles/new', upload.single('cover'), dashboardController.createArticle);

router.put('/articles/edit/:id', upload.single('cover'), dashboardController.updateArticle)
router.put('/admin/update/:id', upload.single('cover_profile'), dashboardController.updateAuthorData)

router.delete('/articles/:id', dashboardController.deleteArticle)

module.exports = router;