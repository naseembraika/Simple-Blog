const { Article } = require('../models')
const { marked } = require('marked')
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const { ObjectId } = require('mongodb');
const createSlug = require('slugify');

const DOMPurify = createDOMPurify(new JSDOM('').window);
const clearAndMarked = (content) => DOMPurify.sanitize(marked.parse(content));

const renderIndexPage = async (req, res, next) => {
    try {
        const result = await Article.find({}, { 'sort': { 'created_at': -1 } });
        if (!result.status) return res.status(404).render('article/index', { articles: [] });
        res.status(200).render('article/index', { articles: result.data, username: req.username });
    } catch (error) {
        next(createError(500, error.message));
    }
}

const renderNewArticlePage = (req, res, next) => {
    res.render('article/new', { articleData: {} })
}

const renderArticlePage = async (req, res, next) => {
    try {
        const result = await Article.findOne({ slug: req.params.slug });
        if (!result.status) return res.status(404).json({ status: false, message: "Article not found" });
        let article = result.data;
        article.markdown = clearAndMarked(article.markdown);
        res.status(200).render('article/show', { article: result.data });
    } catch (error) {
        next(createError(500, error.message));
    }
}

const renderEditArticle = async (req, res, next) => {
    try {
        const result = await Article.findOne({ _id: new ObjectId(req.params.id) });
        if (!result.status) return res.status(404).redirect('/');
        res.status(200).render('article/edit', { articleData: result.data });
    } catch (error) {
        next(createError(500, error.message));
    }
}

const createNewArticle = async (req, res, next) => {
    let articleData = req.body;

    const validation = Article.validate(articleData);
    if (validation.error) return res.status(400).render('article/new', { articleData, errMessage: validation.error.message });


    articleData = formatData(articleData);
    const existsResult = await Article.isExists({ slug: articleData.slug });
    if (existsResult.status) return res.status(400).render('article/new', { articleData, errMessage: "Title already exists" });

    const article = new Article(articleData);
    article.save(error => {
        if (error) return next(createError(500, error.message));
        res.status(201).redirect(`/articles/${articleData.slug}`);
    })
}

const formatData = (articleData) => {
    return {
        slug: createSlug(articleData.title),
        title: articleData.title[0].toUpperCase().concat(articleData.title.slice(1)),
        description: articleData.description[0].toUpperCase().concat(articleData.description.slice(1)),
        markdown: articleData.markdown,
        created_at: new Date()
    }
}

const deleteArticleById = (req, res, next) => {
    Article.deleteOne({ _id: new ObjectId(req.params.id) }, undefined, (error) => {
        if (error) return next(createError(500, error.message));
        res.status(204).redirect('/');
    })
}

const updateArticle = (req, res, next) => {
    const validationResult = Article.validate(req.body);
    if (validationResult.error) return res.status(400).render('article/edit', { articleData: req.body, errMessage: validationResult.error.message });

    const updatedData = { slug: createSlug(req.body.title), ...req.body };
    Article.updateOne({ _id: new ObjectId(req.params.id) }, { '$set': updatedData }, undefined, (error) => {
        if (error) return next(createError(500, error.message));
        res.status(200).redirect(`/articles/${updatedData.slug}`);
    })
}

module.exports = {
    renderIndexPage,
    renderNewArticlePage,
    renderArticlePage,
    renderEditArticle,
    createNewArticle,
    updateArticle,
    deleteArticleById
}