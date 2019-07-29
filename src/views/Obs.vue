<template>
    <v-layout align-center justify-center class="mt-4">
        <v-flex xs10 sm9 md8 lg7 xl6>
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
                                    <v-flex xs12 sm4>
                                        <v-text-field color="green" label="Título" v-model="metadata.title" required></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm4>
                                        <v-text-field color="green" label="Descripción" v-model="metadata.description"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm4>
                                        <v-text-field color="green" label="Idioma" v-model="metadata.language"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm4>
                                       <v-select v-model="metadata.license" color="green" label="Licencia" :items="licenses"></v-select>
                                    </v-flex>
                                    <v-flex xs12 sm4>
                                        <v-text-field color="green" label="Ponente" v-model="metadata.creator" hint="Separar con comas"></v-text-field>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-form>
                    </v-card>

                    <v-divider class="mt-2 mb-2"></v-divider>
                    <v-layout row wrap justify-center="" align-center="" v-if="this.getStatus">
                         <v-flex xs12 class="text-xs-center">
                            <v-btn color="#48b400" block outline round @click="getSourcesScreenshots">Obtener fuentes</v-btn>
                        </v-flex>
                        <v-flex xs6 class="text-xs-center">
                            <v-img class="round-img" aspect-ratio="1.5" :src="this.sourceImage2" />
                        </v-flex>
                        <v-flex xs6 class="text-xs-center">
                            <v-img class="round-img" aspect-ratio="1.5" :src="this.sourceImage1" />
                        </v-flex>
                    </v-layout>

                    <v-layout row wrap justify-center align-center v-if="this.streaming != true">   
                        <v-flex xs12 class="text-xs-center">
                            <v-btn @click="createVideo(streamKeyId, metadata, 'Active', 'SR')" large outline round color="#48b400" v-if="this.getStatus" icon>
                                <v-icon>fiber_manual_record</v-icon>
                            </v-btn>
                            <v-btn large disabled outline round color="#48b400" v-else icon>
                                <v-icon>fiber_manual_record</v-icon>
                            </v-btn>
                        </v-flex>
                        <v-flex xs1></v-flex>
                    </v-layout>

                    <v-layout row wrap justify-center align-center v-else>
                        <v-flex xs12 class="text-xs-center">
                            <v-btn @click="stopStreamingRecording" large outline round color="error" icon>
                                <v-icon>stop</v-icon>
                                <div class="ringring2"></div>
                            </v-btn>
                        </v-flex>
                    </v-layout>
                    <v-divider class="mt-2 mb-2"></v-divider>
                </v-card-text>
            </v-card>
            <v-snackbar v-model="snackbar" :color="snackColor" :timeout=4000>
                {{snackText}}
            </v-snackbar>
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
            },
            streaming: false,
            sourceImage1: '',
            sourceImage2: '',
            snackbar: false,
            snackColor: '',
            snackText: '',
            licenses: ["Todos los derechos reservados", "CC BY", "CC BY-SA", "CC BY-ND", "CC BY-NC", "CC BY-NC-SA", "CC BY-NC-ND", "CC0"]
        }
    },
    methods: {
        getSourcesScreenshots(){
            this.$socket.sendObj({
                'request-type': 'TakeSourceScreenshot',
                'message-id': '11',
                'sourceName': 'screen',
                'embedPictureFormat': 'png',
                'height': 500
            })
            this.$options.sockets.onmessage = (data) => {
                if(JSON.parse(data.data).img != undefined && JSON.parse(data.data).sourceName === 'screen'){
                    this.sourceImage1 = JSON.parse(data.data).img
                    this.snackbar=true
                    this.snackText="Fuente cargada con éxito"
                    this.snackColor="success"
                } 
            }
            this.$socket.sendObj({
                'request-type': 'TakeSourceScreenshot',
                'message-id': '12',
                'sourceName': 'multi',
                'embedPictureFormat': 'png',
                'height': 500
            })
            this.$options.sockets.onmessage = (data) => {
                if(JSON.parse(data.data).img != undefined && JSON.parse(data.data).sourceName === 'multi'){
                    this.sourceImage2 = JSON.parse(data.data).img
                    this.snackbar=true
                    this.snackText="Fuente cargada con éxito"
                    this.snackColor="success"
                }
            }  
        },
        getStreamingStatus(){
            this.$socket.sendObj({
                'request-type': 'GetStreamingStatus',
                'message-id': '10',
            })
            this.$options.sockets.onmessage = (data) => {
                this.streaming = JSON.parse(data.data).streaming
            }
        },
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
                            'server': 'http://200.1.17.128/live',
                            'key': this.streamKeyData
                        },
                        'type' : 'rtmp_custom'
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
                this.snackbar = true
                this.snackColor = "success"
                this.snackText = "El vídeo fue creado con éxito"
                this.getStreamingStatus()
            })
            .catch(err => {
                console.log(err)
                this.snackbar = true
                this.snackColor = "error"
                this.snackText = "Hubo un error al crearse el vídeo"
            })
        }
    },
    computed: {
        getStatus(){
            return this.$store.getters.obsStatus
        },
        getStreamingStatus2(){
            return this.streaming
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

.ring-container{
    position: relative;
    margin: auto;
    left: 40%;
    margin-bottom: 40%;
}

.circle {
    width: 15px;
    height: 15px;
    background-color: #48b400;
    border-radius: 50%;
    position: absolute;
    top: 5px;
    left: 5px;
    z-index: 500000000000000;
}

.ringring{
    border: 3px solid #48b400;
    -webkit-border-radius: 30px;
    height: 25px;
    width: 25px;
    position: absolute;
    /* left: 15px;
    top: 15px; */
    -webkit-animation: pulsate 1s ease-out;
    -webkit-animation-iteration-count: infinite;
    opacity: 0.0;
    z-index: 50000000000;
}

.ringring2{
    border: 3px solid #ff0000;
    -webkit-border-radius: 30px;
    height: 50px;
    width: 50px;
    position: absolute;
    /* left: 15px;
    top: 15px; */
    -webkit-animation: pulsate 1s ease-out;
    -webkit-animation-iteration-count: infinite;
    opacity: 0.0;
    z-index: 50000000000;
}

@-webkit-keyframes pulsate{
    0% {-webkit-transform: scale(0.1, 0.1); opacity: 0.0;}
    50% {opacity: 1.0;}
    100% {-webkit-transform: scale(1.2,1.2); opacity: 0.0;}
}

.round-img {
    border-radius: 8px;
}
</style>
