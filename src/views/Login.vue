<template>
    <v-content>
        <v-container fluid fill-height>
            <v-layout align-center justify-center>
                <v-flex xs12 sm8 md4>
                    <v-card class="elevation-10 mx-auto round-card" color="light-blue lighten-1">
                        <v-card-title class="white--text justify-center headline">
                            UTFSM Stream
                        </v-card-title>
                        <v-card-text>
                            <v-form>
                                <v-text-field dark prepend-icon="person" name="login" label="Email" type="text" v-model="email"></v-text-field>
                                <v-text-field dark prepend-icon="lock" name="password" label="Contraseña" type="password" v-model="password"></v-text-field>
                            </v-form>
                        </v-card-text>
                        <v-layout align-center justify-center>
                            <v-btn flat large round color="white" @click="login">Iniciar Sesión</v-btn>
                        </v-layout>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </v-content>
</template>

<script>
export default {
    data(){
        return{
            email: "",
            password: ""
        }
    },
    methods: {
        login(){
            let email = this.email
            let password = this.password
            this.$store.dispatch('login', {email, password})
            .then(() => this.$router.push('/obs'))
            .catch(err => {
                console.log(err)
            })
        }
    }
}
</script>

<style scoped>
.round-card{
    border-radius: 10px;
}
</style>
