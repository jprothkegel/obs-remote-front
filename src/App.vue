<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <v-avatar>
          <img :src="utfsm">
        </v-avatar>
        <span>ELO</span>
        <span class="font-weight-light">STREAM</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-badge v-if="$store.getters.isLoggedIn" bottom right overlap color="error">
        <span v-if="this.errors != 0" slot="badge"> {{this.errors}} </span>
        <v-menu offset-y lazy>
          <v-btn icon slot="activator">
            <v-icon v-if="$store.getters.statusLoading === false" large color="grey lighten-1">notifications</v-icon>
            <v-progress-circular indeterminate color="error" v-else></v-progress-circular>
          </v-btn>
          <v-list>
            <v-list-tile v-for="(item, i) in getState" :key="i" @click="getStatus">
              <v-list-tile-title> {{item.title}} </v-list-tile-title>
              <v-spacer></v-spacer>
              <v-list-tile-action>
                <v-spacer></v-spacer>
                <v-icon large :color="item.color"> {{item.icon}} </v-icon>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-badge>

      <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn v-if="$store.getters.isLoggedIn === true" flat v-on="on" icon @click="logout">
          <v-icon>exit_to_app</v-icon>
        </v-btn>
      </template>
      <span>Cerrar Sesión</span>
    </v-tooltip>

    </v-toolbar>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  data () {
    return {
      utfsm: require('./assets/logoelo.png'),
      errors: 0
    }
  },
  methods: {
    logout(){
      this.$store.dispatch('logout')
      .then(()=>this.$router.push('/login'))
    },
    getStatus(){
      this.errors = 0
      this.$store.dispatch('getNginxStatus')
      this.$store.dispatch('getOpencastStatus')
      this.$store.dispatch('getBackStatus')
    }
  },
  computed: {
    getState(){
      this.errors = 0
      var items = []
      items.push(this.$store.getters.nginx)
      items.push(this.$store.getters.opencast)
      items.push(this.$store.getters.backend)
      if(this.$store.getters.nginx.color === 'error'){
        this.errors += 1
      }
      if(this.$store.getters.opencast.color === 'error'){
        this.errors += 1
      }
      if(this.$store.getters.backend.color === 'error'){
        this.errors += 1
      }
      return items
    }
  },
  created(){
    this.$http.interceptors.response.use(undefined, err => {
      return new Promise((resolve, reject) => {
        if(err.response.status === 401 && err.response.config && !err.response.config.__isRetryRequest){
          this.$store.dispatch('logout')
          .then(() => {
            this.$router.push('/login')
          })
        }
        throw err
      })
    })
    this.$store.dispatch('getNginxStatus')
    this.$store.dispatch('getOpencastStatus')
    this.$store.dispatch('getBackStatus')
  }
}
</script>
