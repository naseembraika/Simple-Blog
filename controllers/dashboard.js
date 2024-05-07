const { createArticle, getArticlesByAuthorId, getArticleBySlug, getArticleById, deleteArticle, updateArticle } = require('./article')
const { getAuthorById, updateAuthorData } = require('./author')
const { JSDOM } = require('jsdom');
const { marked } = require('marked')
const createDOMPurify = require('dompurify');
const { ObjectId } = require('mongodb');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const renderIndexPage = async (req, res, next) => {
    try {
        const articles = await getArticlesByAuthorId(req.author._id.toString());
        res.status(200).render('dashboard/articles/index', { articles, author: req.author })
    } catch (error) {
        next(createError(500, error.message));
    }
};

const renderNewArticlePage = (req, res, next) => {
    res.render('dashboard/articles/new', { articleData: {} });
}

const renderArticleBySlug = async (req, res, next) => {
    try {
        const article = await getArticleBySlug(req.params.slug);
        if (!article) return res.status(404).json({ message: "Page not found" })
        article.markdown = DOMPurify.sanitize(marked(article.markdown));
        res.status(200).render('dashboard/articles/show', { articleData: article })
    } catch (error) {
        next(createError(500, error.message))
    }
}

const renderArticleById = async (req, res, next) => {
    try {
        const article = await getArticleById(req.params.id);
        res.render('dashboard/articles/edit', { articleData: article })
    } catch (error) {
        next(createError(500, error.message))
    }
}

const renderUpdateAdminPage = async (req, res, next) => {
    try {
        const author = await getAuthorById(new ObjectId(req.params.id));
        res.render('dashboard/admins/edit_profile', { author })
    } catch (error) {
        next(createError(500, error.message))
    }
}

const logout = (req, res, next) => {
    res.clearCookie('token')
    res.redirect('/auth/login');
}

module.exports = {
    createArticle,
    renderIndexPage,
    renderNewArticlePage,
    renderUpdateAdminPage,
    renderArticleBySlug,
    renderArticleById,
    updateArticle,
    updateAuthorData,
    deleteArticle,
    logout
}