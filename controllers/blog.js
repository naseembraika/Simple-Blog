const { getArticlesWithAuthor, getArticleWithAuthorBySlug } = require('./article')
const { getAuthorById } = require('./author')
const { JSDOM } = require('jsdom');
const { marked } = require('marked')
const { join } = require('path')
const createDOMPurify = require('dompurify');
const { ObjectId } = require('mongodb');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const renderHomePage = async (req, res, next) => {
    try {
        let result = await getArticlesWithAuthor();
        res.render('blog/index', { articles: result.data, coverPath: 'blog/assets/img/home-bg.jpg' })
    } catch (error) {
        next(createError(500, error.message))
    }
};

const renderAboutPage = (req, res, next) => {
    res.render('blog/about');
}

const renderAuthorPage = async (req, res, next) => {
    try {
        let author = await getAuthorById(new ObjectId(req.params.id));
        author.description = DOMPurify.sanitize(marked(author.description || ''));
        author.coverProfile = `uploads/${author._id.toString()}/${author.cover_profile_name}`;
        res.status(200).render('blog/author', { author })
    } catch (error) {
        next(createError(500, error.message))
    }
}

const renderContactPage = (req, res, next) => {
    res.render('blog/contact')
}

const renderArticlePage = async (req, res, next) => {
    try {
        const result = await getArticleWithAuthorBySlug(req.params.slug);
        if (result.data.length == 0) return res.status(404).json({ message: "Page not found" });
        let article = result.data[0];
        article.markdown = DOMPurify.sanitize(marked(article.markdown));
        const coverPath = `uploads/${article.author._id.toString()}/${article.coverImageName}`;
        res.status(200).render('blog/post', { article, coverPath })
    } catch (error) {
        next(createError(500, error.message))
    }
}

module.exports = {
    renderHomePage,
    renderAboutPage,
    renderAuthorPage,
    renderContactPage,
    renderArticlePage
}