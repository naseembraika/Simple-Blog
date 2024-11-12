const Joi = require('joi')

module.exports = {
    articleValidate: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        markdown: Joi.string().required()
    })
}