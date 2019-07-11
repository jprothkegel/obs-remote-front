import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import VueNativeSocket from 'vue-native-websocket'
import Axios from 'axios'

Vue.config.productionTip = false

Vue.use(VueNativeSocket, 'ws://localhost:4444',{
  connectManually: true,
  store: store,
  format: 'json'
})

Vue.prototype.$http = Axios
const token = localStorage.getItem('token')

if(token){
  Vue.prototype.$http.defaults.headers.common['Authorization'] = 'Bearer ' + token
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
