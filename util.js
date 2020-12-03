const fs = require('fs')
const qiniu = require('qiniu')
const multer = require('koa-multer')

const { qiniuConfig } = require('./config')

// 生成响应报文
const createReponse = (errcode, msg) => {
    if(!errcode) {
        return { errcode: 0}
    } else {
        if(typeof errcode === 'number') {
            return {
                errcode,
                msg: msg || ''
            }
        } else {
            return {
                errcode: 1,
                msg: errcode || ''
            }
        }
    }
}

const trimBody = body => {
    for (const key in body) {
        if (body.hasOwnProperty(key)) {
            const item = body[key];
            if(typeof body[key] === 'string')
            body[key] = ( '' + item ).trim()
        }
    }
}

// 初始化上传函数
function initUpload( savePath ) {
  const storage = multer.diskStorage({
      // 文件保存路径
      destination: (req, file, cb) => {
          cb(null, savePath)
      },
      // 修改文件名称
      filename: (req, file, cb) => {
          const fileFormat = file.originalname.split('.')
          // console.log(fileFormat, fileFormat[fileFormat.length - 1].substr(0, 15))
          cb(null, Date.now() + '.' + fileFormat[fileFormat.length - 1])
      }
  })
  // 加载上传配置
  const upload = multer({ storage })
  return upload
}

function getSuffix (fileName) {
    return fileName.split('.').pop()
}
   
// 重命名
function Rename (fileName) {
    return Math.random().toString(16).substr(2) + '.' + getSuffix(fileName)
}
  // 删除文件
function removeTemImage (path) {
    fs.unlink(path, (err) => {
      if (err) {
        throw err
      }
    })
}


// 上传到七牛
function upToQiniu (filePath, key) {
    const accessKey = qiniuConfig.accessKey // 你的七牛的accessKey
    const secretKey = qiniuConfig.secretKey // 你的七牛的secretKey
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
   
    const options = {
      scope: qiniuConfig.scope // 你的七牛存储对象
    }
    const putPolicy = new qiniu.rs.PutPolicy(options)
    const uploadToken = putPolicy.uploadToken(mac)
   
    const config = new qiniu.conf.Config()
    // 空间对应的机房
    config.zone = qiniu.zone.Zone_z2
    const localFile = filePath
    const formUploader = new qiniu.form_up.FormUploader(config)
    const putExtra = new qiniu.form_up.PutExtra()
    // 文件上传
    return new Promise((resolved, reject) => {
      formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
        // console.log(respErr, respBody, respInfo)
        if (respErr) {
          reject(respErr)
          return
        }
        if (respInfo.statusCode == 200) {
          resolved(respBody)
        } else {
          // TODO 应该有异常处理
          resolved(respBody)
        }
      })
    })
}

// 删除七牛云图片
function deleteQiniu(key) {
  const mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey);
  const config = new qiniu.conf.Config();
  //config.useHttpsDomain = true;
  config.zone = qiniu.zone.Zone_z2;
  const bucketManager = new qiniu.rs.BucketManager(mac, config);
  return new Promise( (resolve, reject) => {
    bucketManager.delete(qiniuConfig.scope, key, function(err, respBody, respInfo) {
      if (err) {
        console.log(err);
        resolve(true)
        //throw err;
      } else {
        console.log('deleteQiniu:', respInfo.statusCode);
        console.log('deleteQiniu:', respBody);
        resolve(false)
      }
    });
  })
}
  
module.exports = {
    createReponse,
    trimBody,
    initUpload,
    removeTemImage,
    upToQiniu,
    Rename,
    deleteQiniu
}