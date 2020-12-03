import axios from "../../utils/http"

const state = {
    usersList: [],
    publicKey: '',
    userinfo: {}
}

const mutations = {
    INIT_USERS(state, users) {
        state.usersList = users
    },
    SET_KEY(state, publicKey) {
        state.publicKey = publicKey
    },
    INIT_USERINFO(state, info) {
        state.userinfo = info
    }
}

const actions = {
    getusers({ commit }) {
        axios.get('user/getusers').then( res => {
            commit('INIT_USERS', res)
        })
    },
    getKey({ commit, state }) {
        return axios.get('user/getkey').then( res => {
            if( state.publicKey ) {
                return state.publicKey
            }
            commit('SET_KEY', res.publicKey)
            return res
        })
    },
    getuserinfo({ commit }) {
        return axios.get('user/getuserinfo').then( res => {
            commit('INIT_USERINFO', res)
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