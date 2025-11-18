
import { fetchRedis } from "@/app/helpers/redis"
import { authOptions } from "@/app/libs/auth"
import { db } from "@/app/libs/db"
import { getServerSession } from "next-auth"
import z from "zod"

export  async function POST (req: Request) {


try {
    const body = await req.json()

    const {id: idToAdd} = z.object({id: z.string() }).parse(body)

    const session = await getServerSession(authOptions)

    if(!session) {
        return new Response('unauthorized', {status: 401 })
    }

    const isAlreadyFriends = await fetchRedis('sismember', `users:${session.user.id}:friends`, idToAdd)

    if(isAlreadyFriends) return new Response('Already Added', {status: 400})
  

        const hasAlreadyRequest = await fetchRedis('sismember',  `user:${session.user.id}:incoming_friend_requests`, idToAdd)

        if(!hasAlreadyRequest) {
            return new Response('NO friend request', {status: 400})
        }


        await db.sadd(`user:${session.user.id}:friends`, idToAdd)
        await db.sadd(`user:${idToAdd}:friends`, session.user.id)

        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd     
        )
        console.log('job finished')
        return new Response('OK')
}

catch (error) {
    if (error instanceof z.ZodError) {
        return new Response('Invalid request payload', {status: 422 })
    } 

    return new Response ("invalid request", {status: 400})
}

}