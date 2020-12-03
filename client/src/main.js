import Vue from 'vue'
import 'normalize.css/normalize.css'
import './assets/css/public.less'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import App from './App.vue'
import router from './router'
import store from './store/index'
import axios from './utils/http'

Vue.use(ElementUI);

Vue.config.productionTip = false

Vue.prototype.$http = axios

// 全局拦截
router.beforeEach( async (to, from, next) => {
  if(to.path === '/login') {
    next()
    return
  }
  if(!window.localStorage.author_token) {
    next({path: '/login'})
    return
  }
  if(!to.meta || !to.meta.roles) {
    next()
    return
  }
  const redirectPath = from && from.path || '/owner'
  try {
    let loginRole = store.state.users.userinfo.role
    if( typeof loginRole === 'undefined' ) {
      const { role } = await store.dispatch('users/getuserinfo')
      loginRole = role
    }
    const roleName = ['editor', 'admin'][loginRole-1]
    if(to.meta.roles.indexOf(roleName) >= 0) {
      next()
    } else {
      next(redirectPath)
    }
  }catch(err){
    next(redirectPath)
  }
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
