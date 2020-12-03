
const router = require('koa-router')
const { createReponse } = require('../util')
const categoryModel = require('../models/categoryModel')

const categoryRouter = new router({
    prefix: '/api/category'
})

categoryRouter.get('/', async ctx => {
    try {
        const categories = await categoryModel.find({}, '-_id category')
        ctx.body = categories.map(item => item.category)
    } catch(err) {
        ctx.body = []
    }
})

categoryRouter.post('/add', async ctx => {
    const name = (ctx.request.body.category || '').trim()
    if(!name) {
        ctx.body = createReponse('category is required')
    } else {
        try {
            const oldname = await categoryModel.findOne({category: name})
            if(!oldname) {
                const newData = new categoryModel({
                    category: name
                })
                await newData.save()
            }
            ctx.body = createReponse()
        } catch(err) {
            ctx.body = createReponse(1)
        }
    }
})

categoryRouter.post('/edit', async ctx => {
    const name = (ctx.request.body.oldCategory || '').trim()
    const newName = (ctx.request.body.category || '').trim()
    if(!name || !newName) {
        ctx.body = createReponse('categories is required')
    } else {
        try {
            const rep = await categoryModel.updateOne({category: name}, {$set: {category: newName}})
            if(rep.n) {
                ctx.body = createReponse()
            } else {
                ctx.body = createReponse("category isn't exist")
            }
        } catch(err) {
            ctx.body = createReponse(1)
        }
    }
})

categoryRouter.post('/delete', async ctx => {
    const name = (ctx.request.body.category || '').trim()
    if(!name) {
        ctx.body = createReponse('category is required')
    } else {
        try {
            const rep = await categoryModel.deleteOne({category: name})
            if(rep.n) {
                ctx.body = createReponse()
            } else {
                ctx.body = createReponse("category isn't exist")
            }
        } catch(err) {
            ctx.body = createReponse(1)
        }
    }
})

module.exports = categoryRouter