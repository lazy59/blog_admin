module.exports.AES_KEY = "Lazy_blog-test";
module.exports.JWT_KEY = "Lazy_blog-test_jwt";
module.exports.pageSize = 10;
// 图片大小限定
module.exports.IMG_SIZE = 300 * 1024;

// 七牛配置项
module.exports.qiniuConfig = {
  accessKey: "9Bf2zjkVrH3DZ7caAIE7R_66xUfxu61zNGyUcx9c",
  secretKey: "yS5r9cV49S7wutf3nYAobUiXxJdZzM546-bAQQH2",
  scope: "lazy-blog",
};

// 七牛图片域名配置
module.exports.imageUrl = "http://blog.image.lazyzzd.cn";

// 白名单配置
module.exports.apiAuth = [
  {
    roles: [2],
    apis: [
      "/api/category/add",
      "/api/category/edit",
      "/api/category/delete",
      "/api/user/add",
      "/api/user/edit",
      "/api/user/delete",
    ],
  },
];
