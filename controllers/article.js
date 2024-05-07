const { Article } = require('../models')
const { mkdirSync, copyFileSync, existsSync, rmSync } = require('fs')
const { ObjectId } = require('mongodb')
const { join } = require('path')
const { JSDOM } = require('jsdom');
const { marked } = require('marked')
const slug = require('slug')
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const createArticle = (req, res, next) => {
    const articleData = req.body;

    if (!req.file) return res.status(400).render(`dashboard/articles/new`, { articleData, message: "Upload file" })

    const validation = Article.validate(articleData);
    if (validation.error) {
        rmSync(join('public', 'uploads', req.file.filename));
        return res.status(400).render(`dashboard/articles/new`, { articleData, message: validation.error.message })
    }

    createAuthorUploadsFolder(req, req.file.filename, next);
    const article = new Article({
        _author_id: new ObjectId(req.author._id),
        slug: slug(articleData.title),
        title: articleData.title,
        description: articleData.description,
        markdown: articleData.markdown,
        createdAt: new Date(),
        coverImageName: req.file.filename
    });
    article.save((error, insertedId) => {
        if (error) return next(createError(500, error.message));
        res.status(201).redirect(`/dashboard/articles/${article.articleData.slug}`)
    })
}

const createAuthorUploadsFolder = (req, filename, next) => {
    try {
        const authorCoversPath = join('public', 'uploads', req.author._id);
        (existsSync(authorCoversPath) == false) ? mkdirSync(authorCoversPath) : null;
        copyFileSync(join('public', 'uploads', filename), join(authorCoversPath, `${filename}`));
        rmSync(join('public', 'uploads', filename));
    } catch (error) {
        return next(createError(500, error.message))
    }
}

const getArticlesByAuthorId = async (id) => {
    return await Article.getArticles({ _author_id: new ObjectId(id) }, { sort: {createdAt: -1} });
}

const getArticleWithAuthorBySlug = async (slug) => {
    return await Article.getAggregate([
        {
            '$match': { slug }
        },
        {
            '$lookup': {
                from: 'authors',
                localField: '_author_id',
                foreignField: '_id',
                as: 'author'
            }
        },
        {
            '$addFields': { 'author': { '$arrayElemAt': ['$author', 0] } }
        },
        {
            '$project': {
                '_id': 0,
                'title': 1,
                'description': 1,
                'markdown': 1,
                'createdAt': 1,
                'coverImageName': 1,
                'author._id': 1,
                'author.name': 1
            }
        }
    ])
}

const getArticlesWithAuthor = async () => {
    return await Article.getAggregate([
        {
            '$lookup': {
                from: 'authors',
                localField: '_author_id',
                foreignField: '_id',
                as: 'author'
            }
        },
        {
            '$addFields': { 'author': { '$arrayElemAt': ['$author', 0] } }
        },
        {
            '$project': {
                '_id': 0,
                'title': 1,
                'slug': 1,
                'description': 1,
                'createdAt': 1,
                'author._id': 1,
                'author.name': 1
            }
        },
        { '$sort': { createdAt: -1 } }
    ])
}

const getArticleBySlug = async (slug) => {
    return await Article.getArticle({ slug });
}

const getArticleById = async (id) => {
    return await Article.getArticle({ _id: new ObjectId(id) });
}

const updateArticle = async (req, res, next) => {
    const validation = Article.validate(req.body);
    if (validation.error) return res.status(400).render(`dashboard/articles/edit`, { articleData: req.body })

    try {
        const oldArticle = await Article.getArticle({ _id: new ObjectId(req.params.id) });
        const updates = {
            slug: slug(req.body.title),
            title: req.body.title,
            description: req.body.description,
            markdown: req.body.markdown,
        }

        // Remove old photo and replace with new
        if (req.file) {
            const authorFolderPath = join('public', 'uploads', `${oldArticle._author_id.toString()}`)
            rmSync(join(authorFolderPath, `${oldArticle.coverImageName}`));
            copyFileSync(join('public', 'uploads', `${req.file.filename}`), join(authorFolderPath, `${req.file.filename}`));
            rmSync(join('public', 'uploads', `${req.file.filename}`));
            updates.coverImageName = req.file.filename;
        }

        Article.updateArticle(req.params.id, updates, (error) => {
            if (error) return next(createError(500, error.message));
            res.status(201).redirect(`/dashboard/articles/${updates.slug}`);
        })
    } catch (error) {
        next(createError(500, error.message))
    }
}

const deleteArticle = (req, res, next) => {
    Article.deleteArticle(req.params.id)
        .then(article => {
            rmSync(join('public', 'uploads', `${article._author_id.toString()}`, `${article.coverImageName}`))
            res.redirect('/dashboard')
        })
        .catch(error => next(createError(500, error.message)))
}

module.exports = {
    createArticle,
    getArticlesByAuthorId,
    getArticleBySlug,
    getArticleById,
    getArticlesWithAuthor,
    getArticleWithAuthorBySlug,
    updateArticle,
    deleteArticle
}