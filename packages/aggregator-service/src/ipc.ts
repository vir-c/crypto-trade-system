import { BroadcastChannel } from 'broadcast-channel'

const channel = new BroadcastChannel('IPC')

const relayToDeciderService = () => {
    channel.postMessage("go decider, it's your turn")
}

export default {
    relayToDeciderService,
}
