import axios from 'axios'

const sendMessage = async (url: string, chatId: string, message: string) => {
    try{
       await axios.post(url, { chat_id: chatId, text: message, parse_mode: 'MarkdownV2' })
    }catch(error){
        console.log(error)
    }
}

export const telegram = {
    sendMessage,
}
