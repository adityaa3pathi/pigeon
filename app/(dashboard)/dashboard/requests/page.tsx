import FriendRequests from '@/app/components/FriendRequests'
import { fetchRedis } from '@/app/helpers/redis'
import { authOptions } from '@/app/libs/auth'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { FC } from 'react'



const page = async ({}) => {
    const session = await getServerSession(authOptions)
    if(!session) notFound()

        //ids of user who have sent current logged in user friend request

        const incomingSenderIds = (await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`)) as string[]

        const incomingFriendRequests  = await Promise.all(
            incomingSenderIds.map(async (senderId) => {
                const sender = await fetchRedis('get', `user:${senderId}`) as string
                const parsedSender = JSON.parse(sender) as User
                return {
                    senderId,
                    senderEmail: parsedSender.email,
                }
            })
        )
  return ( <main className='pt-8'>
            <h1 className='font-bold text-5xl mb-8'>
        Add a friend</h1>
          <div className='flex flex-col gap-4'>
            <FriendRequests  incomingFriendRequests={incomingFriendRequests} sessionId={session.user.id}/>
            </div>  
    </main>)
}

export default page