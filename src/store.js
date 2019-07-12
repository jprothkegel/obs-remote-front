import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import jwt from 'jsonwebtoken'

Vue.use(Vuex)

const backUrl = 'http://192.168.0.82:3000/'
const opencastUrl = 'http://192.168.0.67:8080'
const nginxUrl = 'http://192.168.0.82'

export default new Vuex.Store({
  state: {
    status: '',
    token: localStorage.getItem('token') || '',
    user: {},
    nginxStatus: {},
    opencastStatus: {},
    backStatus: {},
    statusLoading: false,
    socket: {
      isConnected: false,
      message: '',
      reconnectError: false
    }
  },
  mutations: {
    SOCKET_ONOPEN(state, event){
      Vue.prototype.$socket = event.currentTarget
      state.socket.isConnected = true
    },
    SOCKET_ONCLOSE(state, event){
      state.socket.isConnected = false
    },
    SOCKET_ONERROR(state, event){
      console.error(state, event)
    },
    SOCKET_ONMESSAGE(state, message){
      state.socket.message = message
    },
    auth_request(state){
      state.status = 'loading'
    },
    auth_success(state, token, user){
      state.status = 'success'
      state.token = token
      state.user = user
    },
    auth_error(state){
      state.status = 'error'
    },
    logout(state){
      state.status = ''
      state.token= ''
    },
    setLoadingStatus(state,payload){
      state.statusLoading = payload
    },
    nginxRequest(state, nginxState){
      state.nginxStatus = nginxState
    },
    opencastRequest(state, opencastState){
      state.opencastStatus = opencastState
    },
    backRequest(state, backState){
      state.backStatus = backState
    }
  },
  actions: {
    login({commit}, user){
      return new Promise((resolve, reject) => {
        commit('auth_request')
        axios({
          url: backUrl + 'user/login',
          data: user,
          method: 'POST'
        })
        .then(resp => {
          const token = resp.data.token
          const user = resp.data.user
          localStorage.setItem('token', token)
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
          commit('auth_success', token, user)
          resolve(resp)
        })
        .catch(err => {
          commit('auth_error')
          localStorage.removeItem('token')
          reject(err)
        })
      })
    },
    logout({commit}) {
      return new Promise((resolve) => {
        commit('logout')
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        resolve()
      })
    },
    getNginxStatus({commit}){
      let didTimeOut = false
      commit('setLoadingStatus', true)
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          didTimeOut = true
          commit('nginxRequest', {
            title: 'Nginx',
            icon: 'warning',
            color: 'error'
          })
          commit('setLoadingStatus', false)
          reject(new Error('Request timed out'))
        }, 3000)

        fetch(nginxUrl, {
          cache: 'no-store',
          mode: 'no-cors'
        })
        .then(resp => {
          clearTimeout(timeout)
          if(!didTimeOut) {
            commit('nginxRequest', {
              title: 'Nginx',
              icon: 'done',
              color: 'success'
            })
            commit('setLoadingStatus', false)
            resolve(resp)
          }
        })
        .catch(err => {
          if (didTimeOut) return
          reject(err)
        })
      })
    },
    getOpencastStatus({commit}){
      let didTimeOut = false 
      commit('setLoadingStatus', true)
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          didTimeOut = true
          commit('opencastRequest', {
            title: 'Opencast',
            icon: 'warning',
            color: 'error'
          })
          commit('setLoadingStatus', false)
          reject(new Error('Request timed out'))
        }, 3000)
        fetch(opencastUrl, {
          cache: 'no-store',
          mode: 'no-cors'
        })
        .then(resp => {
          clearTimeout(timeout)
          if(!didTimeOut){
            commit('opencastRequest', {
              title: 'Opencast',
              icon: 'done',
              color: 'success'
            })
            commit('setLoadingStatus', false)
            resolve(resp)
          }
        })
        .catch(err => {
          if (didTimeOut) return
          reject(err)
        })
      })
    },
    getBackStatus({commit}){
      return new Promise((resolve, reject) => {
        axios({
          url: backUrl + 'obs/status',
          method: 'GET',
          timeout: 3000
        })
        .then(resp => {
          commit('backRequest', {
            title: 'Backend',
            icon: 'done',
            color: 'success'
          })
          resolve(resp)
        })
        .catch(err => {
          commit('backRequest', {
            title: 'Backend',
            icon: 'warning',
            color: 'error'
          })
          reject('El Back End no está corriendo')
        })
      })
    },
    generateStreamKey(){
      return new Promise((resolve, reject) => {
        const decoded = jwt.verify(localStorage.getItem('token'), 'secret')
        axios({
          url: backUrl + 'streamKey/generate',
          method: 'POST',
          data: {
            userId: decoded.userId
          }
        })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err.response.data.message)
        })
      })
    },
    getStreamKey(){
      return new Promise((resolve, reject) => {
        const decoded = jwt.verify(localStorage.getItem('token'), 'secret')
        axios({
          url: backUrl + 'streamKey/' + decoded.userId,
          method: 'GET'
        })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
      })
    },
    createVideo({commit}, data){
      return new Promise((resolve, reject) => {
        axios({
          url: backUrl + 'video/create',
          method: 'POST',
          data: data
        })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
      })
    },
    changeVideoStatus({}, data){
      return new Promise((resolve, reject) => {
        axios({
          url: backUrl +'video/update',
          data: data,
          method: 'POST'
        })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
      })
    }
  },
  getters: {
    isLoggedIn: state => !!state.token,
    authStatus: state => state.status,
    nginx: state => state.nginxStatus,
    opencast: state => state.opencastStatus,
    backend: state => state.backStatus,
    obsStatus: state => state.socket.isConnected,
    statusLoading: state => state.statusLoading
  }
})
