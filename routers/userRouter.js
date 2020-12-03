
const path = require('path')
const fs = require('fs')
const router = require('koa-router')
const NodeRSA = require('node-rsa')
const crypto = require('crypto');
const jwt = require('jsonwebtoken')
const multer = require('koa-multer')

const { createReponse, trimBody, initUpload } = require('../util')
const { AES_KEY, JWT_KEY } = require('../config')
const userModel = require('../models/userModel')

const key = new NodeRSA({b: 512})  
key.setOptions({encryptionScheme: 'pkcs1'})

// 加载上传配置
const upload = initUpload(path.join(__dirname, '../upload/avatar'))

function aesEncrypt(data, key) {
    const cipher = crypto.createCipher('aes192', key);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function aesDecrypt(encrypted, key) {
    const decipher = crypto.createDecipher('aes192', key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

const userRouter = new router({
    prefix: '/api/user'
})

userRouter.get('/getkey',  (ctx) => {
    let publicKey = key.exportKey('public')  //生成公钥
    ctx.body = {
      publicKey:publicKey
    }
})

userRouter.get('/getusers', async (ctx) => {
    const data = await userModel.find({}, 'name role')
    ctx.body = data || []
})

userRouter.post('/add', async ctx => {
    trimBody(ctx.request.body)
    let { name, password, role } = ctx.request.body
    if( !name || !password || [1, 2].indexOf(+role) === -1 ) {
        ctx.body = createReponse('variable is required')
    } else {
        try {
            password = key.decrypt(password.replace(/\s+/g, '+'), 'utf8')
            const addUser = new userModel({
                name,
                password: aesEncrypt(password, AES_KEY),
                role: +role
            })
            await addUser.save()
            ctx.body = createReponse()
        } catch(err) {
            ctx.body = createReponse(1)
        }
    }
})

userRouter.post('/edit', async ctx => {
    trimBody(ctx.request.body)
    let { name, password, role, _id } = ctx.request.body
    const tokenId = ctx.state.user.data.id
    const tokenRole = ctx.state.user.data.role
    if( !name || typeof role !== 'undefined' && [1, 2].indexOf(+role) === -1 ) {
        ctx.body = createReponse('variable is required')
    } else if ( tokenRole == 1 && tokenId !== _id) {
        ctx.body = createReponse('修改失败')
    } else {
        try {
            password = password ? key.decrypt(password.replace(/\s+/g, '+'), 'utf8') : ''
            let newData = {name, role: +(role || tokenRole)}
            if(password)
            newData.password = aesEncrypt(password, AES_KEY)
            const rep = await userModel.updateOne({_id}, {
                $set: newData
            })
            if(rep.n) {
                ctx.body = createReponse()
            } else {
                ctx.body = createReponse("user isn't exist")
            }
        } catch(err) {
            console.log(err)
            ctx.body = createReponse(1)
        }
    }
})

userRouter.post('/delete', async ctx => {
    const _id = ctx.request.body._id
    if(!_id) {
        ctx.body = createReponse('id is required')
    } else {
        try {
            const rep = await userModel.deleteOne({_id})
            if(rep.n) {
                ctx.body = createReponse()
            } else {
                ctx.body = createReponse("user isn't exist")
            }
        } catch(err) {
            ctx.body = createReponse(1)
        }
    }
})

userRouter.post('/avatar', upload.single('file') , async ctx => {
    const filename = ctx.req.file.filename
    const avatarPath = `/avatar/${filename}`
    try {
        const userInfo = await userModel.findOne({ _id: ctx.state.user.data.id })
        if(userInfo.avatar) {
            fs.unlink(path.join(__dirname, `../upload/${userInfo.avatar}`), err => {
                if(err) console.log('unlink-avatar:', err)
            })
        }
        await userModel.updateOne({ _id: ctx.state.user.data.id }, { $set: {
            avatar: avatarPath
        }})
        ctx.body = createReponse()
    } catch(err) {
        console.log('avatar', err)
        ctx.body = createReponse(1)
    }
})

userRouter.post('/login', async ctx => {
    let {name, password} = ctx.request.body
    if(!name || !password) {
        ctx.body = createReponse('用户名或者密码不能为空')
    } else {
        try {
            password = key.decrypt(password.replace(/\s+/g, '+'), 'utf8')
            let userInfo = await userModel.findOne({name})
            if(userInfo && password === aesDecrypt(userInfo.password, AES_KEY)) {
                ctx.body = {
                    errcode: 0,
                    token: jwt.sign(
                        {
                            data: {
                                name: userInfo.name,
                                id: userInfo._id,
                                role: userInfo.role
                            },
                            exp: Math.floor(Date.now() / 1000) + 2 * 60 * 60
                        },
                        JWT_KEY
                    )
                }
            } else {
                ctx.body = createReponse('用户名或者密码错误')
            }
        } catch(err) {
            console.log(err)
            ctx.body = createReponse(1)
        }
    }
})

// 获取个人信息
userRouter.get('/getuserinfo', async ctx => {
    const { id } = ctx.state.user.data
    ctx.body = await userModel.findOne({ _id: id }, '_id name avatar role')
})

module.exports = userRouter