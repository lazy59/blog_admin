import axios from 'axios'

// axios.defaults.baseURL = '/'; // 配置axios请求的地址
axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.crossDomain = true;
axios.defaults.withCredentials = true;  //设置cross跨域 并设置访问权限 允许跨域携带cookie信息
// axios.defaults.headers.common['Authorization'] = ''; // 设置请求头为 Authorization

//配置发送请求前的拦截器 可以设置token信息 
axios.interceptors.request.use(config => {
    config.url = /^\\/.test(config.url) ? config.url : '/api/' + config.url
    
    const token = window.localStorage.getItem("author_token");
    if (token) {
    // 判断是否存在token，如果存在的话，则每个http header都加上token
    // Bearer是JWT的认证头部信息
        config.headers.common["Authorization"] = "Bearer " + token;
    }

    return config;
}, error => {
    return Promise.reject(error);
})

 // 配置响应拦截器 
 axios.interceptors.response.use(res => {
     //loading结束
     //这里面写所需要的代码
    //  console.log(res, '-----')
     return Promise.resolve(res.data);
    }, error => {
        if(error.response.status == 401){
            window.localStorage.removeItem('author_token')
            window.location.href = '/#/login'
        }
     return Promise.reject(error);
 })
 
 export default axios;