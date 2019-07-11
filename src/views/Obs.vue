<template>
    <v-layout align-center justify-center class="mt-4">
        <v-flex xs12 sm8 md6>
            <v-card class="elevation-10 mx-auto round-card">
                <v-card-title class="justify-center">
                    Interactuar con OBS
                </v-card-title>
                <v-card-text>
                    <v-btn round block color="success">Conectar</v-btn>

                    <v-divider class="mt-2 mb-2"></v-divider>

                    <v-btn round block color="info">Generar Stream Key</v-btn>

                    <v-layout align-center justify-center>
                        <v-btn disabled round>gdgfgfhghf</v-btn>
                    </v-layout>

                    <v-divider class="mt-2 mb-2"></v-divider>

                    <v-card flat>
                        <v-card-title primary-title>Metadatos</v-card-title>
                        <v-form>
                            <v-container>
                                <v-layout row wrap>
                                    <v-flex xs12 sm6>
                                        <v-text-field color="green" label="Título" v-model="metadata.title" required></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm6>
                                        <v-text-field color="green" label="Descripción" v-model="metadata.description"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm6>
                                        <v-text-field color="green" label="Idioma" v-model="metadata.language"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm6>
                                        <v-text-field color="green" label="Licencia" v-model="metadata.license"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm6>
                                        <v-text-field color="green" label="Ponente" v-model="metadata.contributor" hint="Separar con comas"></v-text-field>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-form>
                    </v-card>

                    <v-divider class="mt-2 mb-2"></v-divider>

                    <v-btn outline round block color="info">Transmitir & Grabar</v-btn>
                    <v-btn outline round block color="error">Detener</v-btn>

                    <v-divider class="mt-2 mb-2"></v-divider>
                </v-card-text>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
export default {
    data(){
        return {
            metadata: {
                title: '',
                description: '',
                language: '',
                license: '',
                contributor: []
            }
        }
    },
    methods: {
        connect(){
            this.$connect('ws://localhost:4444')
        }
    }
}
</script>

<style scoped>
.round-card{
    border-radius: 10px;
}
</style>
