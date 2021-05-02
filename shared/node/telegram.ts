import axios from 'axios'

const sendMessage = async (url: string, chatId: string, message: string, markdown?: boolean) => {
    const params = {
        chat_id: chatId,
        text: message,
    }

    if (markdown) params['parse_mode'] = 'MarkdownV2'

    try {
        await axios.post(url, params)
    } catch (error) {
        console.log(error)
    }
}

export const telegram = {
    sendMessage,
}
