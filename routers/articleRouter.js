
const path = require('path')
const fs = require('fs')
const router = require('koa-router')

const { createReponse, trimBody, initUpload, removeTemImage, upToQiniu, deleteQiniu } = require('../util')
const { imageUrl, pageSize } = require('../config')
const articleModel = require('../models/articleModel')
const categoryModel = require('../models/categoryModel')
const userModel = require('../models/userModel')

// 加载上传配置
const tempPath = path.join(__dirname, '../upload/temp')
const upload = initUpload(tempPath)

const articleRouter = new router({
    prefix: '/api/article'
})

// {}, 'title desc category time '
articleRouter.get('/getallarticles', async (ctx) => {
    const size = +ctx.request.query.pageSize || pageSize
    const currentPage = +ctx.request.query.currentPage || 0
    const total = await articleModel.find({}, '_id').count()
    let data = await articleModel.find({}, 'title desc category time publish authorId').limit(size).skip(currentPage*size).populate('authorId', '-_id name').sort({time: -1})
    // TODO authorId拆分
    ctx.body = {
        total,
        currentPage,
        data: data || []
    }
})

// 前端展示用
articleRouter.get('/getshowarticles', async (ctx) => {
    const size = +ctx.request.query.pageSize || pageSize
    const currentPage = +ctx.request.query.currentPage || 0
    const category = ctx.request.query.type
    const query = category ? {category, publish: true} : {publish: true}
    const total = await articleModel.find(query, '_id').countDocuments()
    let data = await articleModel.find(query, 'title desc category time publish authorId').limit(size).skip(currentPage*size).populate('authorId', '-_id name avatar').sort({time: -1})
    // TODO authorId拆分
    ctx.body = {
        total,
        currentPage,
        data: data || []
    }
})

// 前端查询用
articleRouter.get('/searcharticles', async (ctx) => {
    // const size = +ctx.request.query.pageSize || pageSize
    // const currentPage = +ctx.request.query.currentPage || 0
    const searchText = ctx.request.query.searchText || ''
    let reg = new RegExp(searchText, 'i')
    // const query = {$text: {$search: searchText}}
    const query = {$or: [{title: {$regex: reg}}, {desc: {$regex: reg}}]}
    const total = await articleModel.find(query, '_id').countDocuments()
    let data = await articleModel.find(query, 'title desc category time publish authorId').populate('authorId', '-_id name avatar').sort({time: -1})
    // TODO authorId拆分
    ctx.body = {
        total,
        data: data || []
    }
})

articleRouter.get('/getarticles', async (ctx) => {
    const size = +ctx.request.query.pageSize || pageSize
    const currentPage = +ctx.request.query.currentPage || 0
    const { id } = ctx.state.user.data
    const total = await articleModel.find({authorId: id}, '_id').count()
    let data = await articleModel.find({authorId: id}, 'title desc category publish time').limit(size).skip(currentPage*size).sort({time: -1})
    // TODO authorId拆分
    ctx.body = {
        total,
        currentPage,
        data: data || []
    }
})

articleRouter.get('/getarticleinfo', async (ctx) => {
    const { id } = ctx.request.query
    // const authorId= ctx.state.user.data.id
    let data = await articleModel.findOne({_id: id}, 'title desc category publish time content authorId').populate('authorId', '-_id name avatar')
    // if(authorId == data.authorId) {
        ctx.body = data
    // } else {
    //     ctx.body = createReponse('无权限')
    // }
})

articleRouter.post('/delete', async ctx => {
    // TODO 做鉴权
    const _id = ctx.request.body._id
    if(!_id) {
        ctx.body = createReponse('id is required')
    } else {
        try {
            const rep = await articleModel.deleteOne({_id})
            if(rep.n) {
                ctx.body = createReponse()
            } else {
                ctx.body = createReponse("article isn't exist")
            }
        } catch(err) {
            ctx.body = createReponse(1)
        }
    }
})

articleRouter.post('/addimage', upload.single('file') , async ctx => {
    const filename = ctx.req.file.filename
    try {
        // const userInfo = await userModel.findOne({ _id: ctx.state.user.data.id })
        // 存储图片到临时路径，由upload完成
        // 上传图片到七牛
        const imagePath = path.join(tempPath, filename)
        const result = await upToQiniu(imagePath, filename)
        // 删除临时文件
        removeTemImage(imagePath)
        ctx.body = {
            errcode: 0,
            url: `${imageUrl}/${filename}`
        }
        console.log('upload:', result)
    } catch(err) {
        console.log('addimage:', err)
        ctx.body = createReponse(1)
    }
})

articleRouter.post('/delimage', async ctx => {
    const { filename } = ctx.request.body
    const key = filename.replace(`${imageUrl}/`, '')
    await deleteQiniu(key)
    // 删除成功与否均返回成功
    ctx.body = createReponse()
})

articleRouter.post('/add', async ctx => {
    trimBody(ctx.request.body)
    let { title, desc, content, publish, category } = ctx.request.body
    const { id } = ctx.state.user.data
    if( [title, desc, content, category].some( item => !item) || ! await categoryModel.findOne({category})) {
        // console.log('add:', title, desc, content, category, [title, desc, content, category].some( item => !item))
        ctx.body = createReponse('参数不合法')
        return
    }
    
    try {
        console.log('publish',typeof publish, Boolean(publish))
        const addArticle = new articleModel({
            title,
            desc,
            content,
            category,
            publish: Boolean(publish),
            authorId: id
        })
        await addArticle.save()
        ctx.body = createReponse()
    } catch(err) {
        console.log('addArticle:', err)
    }
})

articleRouter.post('/edit', async ctx => {
    trimBody(ctx.request.body)
    let { title, desc, content, publish, category, articleId, update } = ctx.request.body
    const authorId= ctx.state.user.data.id
    if( [articleId, title, desc, content, category].some( item => !item) || ! await categoryModel.findOne({category})) {
        // console.log('add:', title, desc, content, category, [title, desc, content, category].some( item => !item))
        ctx.body = createReponse('参数不合法')
        return
    }
    let data = await articleModel.findOne({_id: articleId}, 'authorId')
    if(authorId != data.authorId) {
        ctx.body = createReponse('无权限')
        return
    }
    try {
        let newData = {
            title,
            desc,
            content,
            publish,
            category
        }
        if(update) {
            newData.time = Date.now()
        }
        await articleModel.updateOne({_id: articleId}, {$set: newData})
        ctx.body = createReponse()
    } catch(err) {
        console.log('addArticle:', err)
    }
})

// ;(async () => {
//     const data = await articleModel.find({}, 'title desc category time authorId').populate('authorId', '-_id name').sort({time: -1})
//     console.log(data)
// })()

module.exports = articleRouter