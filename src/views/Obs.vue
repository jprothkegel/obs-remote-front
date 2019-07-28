<template>
    <v-layout align-center justify-center class="mt-4">
        <v-flex xs10 sm8 md6 lg4>
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
                    <v-layout row wrap justify-center align-center v-if="this.streaming != true">
                        <v-flex xs12 class="text-xs-center">
                            <v-btn outline round color="#48b400" v-if="this.getStatus" icon>
                                <v-icon>play_arrow</v-icon>
                            </v-btn>
                            <v-btn disabled outline round color="#48b400" v-else icon>
                                <v-icon>play_arrow</v-icon>
                            </v-btn>
                        </v-flex>
                        <v-flex xs1></v-flex>
                    </v-layout>

                    <v-layout row wrap justify-center align-center v-else>
                        <v-flex xs12 class="text-xs-center">
                            <v-btn outline round color="error" icon>
                                <v-icon>stop</v-icon>
                                <div class="ringring2"></div>
                            </v-btn>
                        </v-flex>
                    </v-layout>
                    
                    <v-btn v-if="this.getStatus" @click="createVideo(streamKeyId,metadata,'Active', 'SR')" outline block round color="info">Transmitir & Grabar </v-btn>
                    
                    <v-btn v-else disabled outline round block color="info">Transmitir & Grabar </v-btn><v-spacer></v-spacer>
                    <v-btn v-if="this.getStatus" @click="stopStreamingRecording" outline round block color="error">Detener</v-btn>
                    <v-btn v-else disabled outline round block color="error">Detener</v-btn>

                    <v-btn @click="getStreamingStatus">get status</v-btn>
                    <p> {{getStreamingStatus2}} </p>

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
            },
            streaming: false
        }
    },
    methods: {
        getStreamingStatus(){
            this.$socket.sendObj({
                'request-type': 'GetStreamingStatus',
                'message-id': '10',
            })
            this.$options.sockets.onmessage = (data) => {
                console.log("DATA2: ",JSON.parse(data.data))
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
                            'key': this.streamKeyData
                        }
                    }
                })
                this.$socket.sendObj({
                    'request-type': 'StartRecording',
                    'message-id': '3'
                })
                this.$options.sockets.onmessage = (data) => console.log(data)
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
</style>
