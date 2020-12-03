import Vue from 'vue'
import Vuex from 'vuex'

import category from './modules/category'
import articles from './modules/articles'
import users from './modules/users'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    category,
    articles,
    users
  }
})
