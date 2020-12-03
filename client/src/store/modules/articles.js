import axios from "../../utils/http"

const state = {
    allArticles: [],
    allTotal: 0,
    allCurrentPage: 1,
    pageSize: 5,
    articles: [],
    total: 0,
    currentPage: 1
}

const mutations = {
    INIT_ALL_ARTICLES(state, res) {
        const { total, data, currentPage } = res
        state.allArticles = data
        state.allTotal = total
        state.allCurrentPage = currentPage + 1
    },
    INIT_ARTICLES(state, res) {
        const { total, data, currentPage } = res
        state.articles = data
        state.total = total
        state.currentPage = currentPage + 1
    },
    DEL_ARTICLE(state, {_id,all}){
        const list = all ? 'allArticles' : 'articles'
        state[list] = state[list].filter( item => item._id !== _id )
    }
}

const actions = {
    getallarticles({ commit, state }, page) {
        return axios.get('article/getallarticles', {params: {
            currentPage: page,
            pageSize: state.pageSize
        }}).then( res => {
            commit('INIT_ALL_ARTICLES', res)
            return res
        })
    },
    getarticles({ commit }, page) {
        return axios.get('article/getarticles', {params: {
            currentPage: page,
            pageSize: state.pageSize
        }}).then( res => {
            commit('INIT_ARTICLES', res)
            return res
        })
    },
    deleteArticle({ commit }, _id) {
        return axios.post('article/delete', {_id}).then( res => {
            if( res.errcode === 0 ) {
                commit('DEL_ARTICLE', {_id, all: true})
            }
            return res
        })
    },
    deleteOwnerArticle({ commit }, _id) {
        return axios.post('article/delete', {_id}).then( res => {
            if( res.errcode === 0 ) {
                commit('DEL_ARTICLE', { _id, all: false})
            }
            return res
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}