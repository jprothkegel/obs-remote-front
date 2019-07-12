<template>
    <v-layout align-center justify-center class="mt-4">
        <v-flex xs12 sm8 md6>
            <v-card class="elevation-10 mx-auto round-card">
                <v-card-title class="justify-center">
                    Interactuar con OBS
                </v-card-title>
                <v-card-text>
                    <v-btn v-if="this.getStatus" round block color="success" disabled>Conectar</v-btn>
                    <v-btn v-else round block color="success" @click="connect">Conectar</v-btn>

                    <v-divider class="mt-2 mb-2"></v-divider>

                    <v-btn v-if="this.streamKeyData === ''" @click="streamKey" round block color="info">Generar Stream Key</v-btn>
                    <v-btn v-else disabled round block color="info">Generar Stream Key</v-btn>

                    <v-layout align-center justify-center>
                        <v-btn disabled round> {{this.streamKeyData}} </v-btn>
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
                                        <v-text-field color="green" label="Ponente" v-model="metadata.creator" hint="Separar con comas"></v-text-field>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-form>
                    </v-card>

                    <v-divider class="mt-2 mb-2"></v-divider>

                    <v-btn v-if="this.getStatus" @click="createVideo(streamKeyId,metadata,'Active', 'SR')" outline round block color="info">Transmitir & Grabar</v-btn>
                    <v-btn v-else disabled outline round block color="info">Transmitir & Grabar</v-btn>

                    <v-btn v-if="this.getStatus" @click="stopStreamingRecording" outline round block color="error">Detener</v-btn>
                    <v-btn v-else disabled outline round block color="error">Detener</v-btn>

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
            streamKeyData: '',
            streamKeyId: '',
            metadata: {
                title: '',
                description: '',
                language: '',
                license: '',
                creator: []
            }
        }
    },
    methods: {
        connect(){
            this.$connect('ws://localhost:4444')
        },
        streamKey(){
            this.$store.dispatch('generateStreamKey')
            .then(resp => {
                this.streamKeyData = resp.data.result.key
            })
            .catch(err => {
                console.log(err)
            })
        },
        startStreamingRecording(){
            if(this.metadata.title != ''){
                this.$socket.sendObj({
                    'request-type': 'StartStreaming',
                    'message-id': '1',
                    'stream': {
                        'settings': {
                            'key': this.streamKeyData
                        }
                    }
                })
                this.$socket.sendObj({
                    'request-type': 'StartRecording',
                    'message-id': '3'
                })
            } else {
                console.log("No hay título")
            }
        },
        stopStreamingRecording(){
            this.changeStatusVideo(this.streamKeyId)
            this.$socket.sendObj({
                'request-type': 'StopStreaming',
                'message-id': '2'
            })
            this.$socket.sendObj({
                'request-type': 'StopRecording',
                'message-id': '4'
            })
        },
        changeStatusVideo(streamKeyId){
            this.$store.dispatch('changeVideoStatus', {
                id: streamKeyId
            })
            .then(resp => {})
            .catch(err => {
                console.log(err)
            })
        },
        createVideo(streamKeyData, metadata, status, streamType){
            this.$store.dispatch('createVideo', {
                streamKeyData,
                metadata,
                status,
                streamType
            })
            .then(resp => {
                this.startStreamingRecording()
            })
            .catch(err => {
                console.log(err)
            })
        }
    },
    computed: {
        getStatus(){
            return this.$store.getters.obsStatus
        }
    },
    mounted() {
        this.$store.dispatch('getStreamKey')
        .then(resp => {
            this.streamKeyData = resp.data.key
            this.streamKeyId = resp.data.id
        })
        .catch( err => {
            console.log(err)
        })
    }
}
</script>

<style scoped>
.round-card{
    border-radius: 10px;
}
</style>
