import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout/index'

Vue.use(Router)

export const routerConfig = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    meta: {
      hidden: true
    }
  },

  {
    path: '/',
    component: Layout,
    redirect: '/owner',
    children: [
      {
        path: '/owner',
        name: '个人中心',
        component: () => import('@/views/owner/index'),
        meta: {
          roles: ['editor', 'admin']
        }
      }
    ]
  },

  {
    path: '/',
    component: Layout,
    redirect: '/usersettings',
    children: [
      {
        path: '/usersettings',
        name: '用户管理',
        component: () => import('@/views/usersetting/index'),
        meta: {
          roles: ['admin']
        }
      }
    ]
  },
  
  {
    path: '/',
    component: Layout,
    redirect: '/category',
    children: [
      {
        path: '/category',
        name: '分类管理',
        component: () => import('@/views/category/index'),
        meta: {
          roles: ['admin']
        }
      }
    ]
  },

  {
    path: '/',
    component: Layout,
    redirect: '/articles',
    name: '文章管理',
    children: [
      {
        path: '/articles',
        name: '我的文章',
        component: () => import('@/views/articles/index'),
        meta: {
          roles: ['editor', 'admin']
        }
      },
      {
        path: '/allarticles',
        name: '所有文章',
        component: () => import('@/views/allarticles/index'),
        meta: {
          roles: ['admin']
        }
      },
      // 新增文章和管理文章共用
      {
        path: '/addarticle/:id?',
        name: '新增文章',
        component: () => import('@/views/addarticle/index'),
        meta: {
          roles: ['editor', 'admin'],
          hidden: true
        }
      }
    ]
  },

]

export default new Router({
  routes: routerConfig
})
