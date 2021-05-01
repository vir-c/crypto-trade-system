import { BroadcastChannel } from 'broadcast-channel'

const channel = new BroadcastChannel('IPC')

const executeOnMessage = (fnc) => {
    channel.onmessage = () => fnc()
}

export default {
    executeOnMessage,
}
