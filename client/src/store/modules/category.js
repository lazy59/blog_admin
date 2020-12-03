import axios from "../../utils/http"

const state = {
    categories: []
}

const mutations = {
    INIT_CATEGORY(state, categories) {
        state.categories = categories
    }
}

const actions = {
    getcategories({ commit }) {
        axios.get('category').then( res => {
            commit('INIT_CATEGORY', res)
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}