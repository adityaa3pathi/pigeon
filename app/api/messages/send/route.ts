import { fetchRedis } from "@/app/helpers/redis"
import { authOptions } from "@/app/libs/auth"
import { getServerSession } from "next-auth"
import {nanoid} from "nanoid"
import { db } from "@/app/libs/db"
import { Message, messageValidator } from "@/app/libs/validations/message"
import { pusherServer } from "@/app/libs/pusher"
import { toPusherKey } from "@/app/libs/utils"

export async function POST(req: Request) {
    try {
 
        const {text, chatId}: {text: string, chatId: string} = await req.json()
        const session = await getServerSession(authOptions)

        if(!session) return new Response('Unauthorized', { status: 401})

            const [userId1, userId2] = chatId.split('--')

            if(session.user.id !== userId1 && session.user.id !== userId2) {
                return new Response('Unauthorized', { status: 401})
            }

            const friendId = session.user.id === userId1 ? userId2 : userId1

            const friendsList = (await fetchRedis(
                'smembers',
                `user:${session.user.id}:friends`
            )) as string []
            const isFriend = friendsList.includes(friendId)

            if(!isFriend) {
                return new Response('Unauthorized', { status: 401})
            }

            const rawSender = await fetchRedis('get', `user:${session.user.id}`) as string
            
            const sender = JSON.parse(rawSender) as User


            const timestamp = Date.now()

            const  MessageData: Message = {
                id: nanoid(),
                senderId: session.user.id,
                text,
                timestamp,
            }

            const message = messageValidator.parse(MessageData)

            //notify all connected chat room clients

            pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'incoming-message', message)


            pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
                ...message,
                senderImg: sender.image,
                senderName: sender.name
            })

            // sending message to db after everything
            await db.zadd(`chat:${chatId}:messages`, {
                score: timestamp,
                member: JSON.stringify(message)
            })

            return new Response('OK')

    }
    catch(error) {
        if(error instanceof Error) {
            return new Response(error.message, {status: 500})
        } 

        return new Response('internal server error', {status: 500})
    }
}