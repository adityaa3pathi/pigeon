"use client"

import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useMemo, useState } from 'react'
import { chatHrefConstructor, toPusherKey } from '../libs/utils'
import { pusherClient } from '../libs/pusher'
import toast from 'react-hot-toast'
import UNseenChatToast from './UNseenChatToast'

interface SidebarChatListProps {
  friends: User[]
  sessionId: string
}


interface ExtendedMessage extends Message {
    senderImg: string
    senderName: string
}
const SidebarChatList: FC<SidebarChatListProps> = ({friends, sessionId}) => {

    const router = useRouter()
    const pathname = usePathname()
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
    const [activeChats, setActiveChats] = useState<User[]>(friends)




useEffect(() => {

    if(!sessionId) return
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

    const newFriendHandler = (newFriend: User) => {
        setActiveChats((prev) => [...prev, newFriend])
    }

    const chatHandler = (message: ExtendedMessage) => {

        const shouldNotify = pathname !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`
        
        if(!shouldNotify) return

        toast.custom((t) => (
            <UNseenChatToast
            t={t}
            sessionId= {sessionId}
            senderId={message.senderId}
            senderImg={message.senderImg}
            senderMessage={message.text}
            senderName={message.senderName}

            />
        ))

        setUnseenMessages((prev) => [...prev, message])

        console.log("new message arrived", message)

    }

    pusherClient.bind('new_message', chatHandler)
    pusherClient.bind('new_request', newFriendHandler)



    return () => {
          pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
          pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

          pusherClient.unbind('new_message', chatHandler)
          pusherClient.unbind('new_request', newFriendHandler)
 
    }
}, [pathname, sessionId, router])




const isChatPage = pathname?.includes("chat");

const filteredMessages = useMemo(() => {
  if (!isChatPage) return unseenMessages;
  return unseenMessages.filter(msg => !pathname.includes(msg.senderId));
}, [pathname, unseenMessages]);



// useEffect(() => {

//     if(!pathname) return 
//     if(pathname?.includes('chat')) {
//         setUnseenMessages((prev) => {
//             return prev.filter((msg) => !pathname.includes(msg.senderId))
//         })
//     }
// }, [pathname]) // daymn this logic is goooood


  return <ul role='list' className='max-h-100 overflow-y-auto -mx-2 space-y-1'>
  {activeChats.sort().map((friend) => {

    

    const unSeenMessagesCount = unseenMessages.filter((unseenMsg) => {
        return unseenMsg.senderId === friend.id
    }).length
    return <li key={friend.id}>
        <a href={`/dashboard/chat/${chatHrefConstructor(
            sessionId,
            friend.id
        )}`} 
        className='text-gray-600 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold '
        >{friend.name}
        {unSeenMessagesCount > 0 ? <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center' >{unSeenMessagesCount}</div> : null}
        </a>
    </li>
  })}
  </ul>
}

export default SidebarChatList