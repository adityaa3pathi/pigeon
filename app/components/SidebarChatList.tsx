"use client"

import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { chatHrefConstructor } from '../libs/utils'

interface SidebarChatListProps {
  friends: User[]
  sessionId: string
}

const SidebarChatList: FC<SidebarChatListProps> = ({friends, sessionId}) => {

    const router = useRouter()
    const pathname = usePathname()
const [unseenMessages, setUnseenMessages] = useState<Message[]>([])

useEffect(() => {
    if(pathname?.includes('chat')) {
        setUnseenMessages((prev) => {
            return prev.filter((msg) => !pathname.includes(msg.senderId))
        })
    }
}, [pathname]) // daymn this logic is goooood
  return <ul role='list' className='max-h-100 overflow-y-auto -mx-2 space-y-1'>
  {friends.sort().map((friend) => {

    

    const unSeenMessagesCount = unseenMessages.filter((unseenMsg) => {
        return unseenMsg.senderId === friend.id
    }).length
    return <li key={friend.id}>
        <a href={`/dashboard/chat/${chatHrefConstructor(
            sessionId,
            friend.id
        )}`} 
        className='text-gray-700 hover: text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold '
        >{friend.name}
        {unSeenMessagesCount > 0 ? <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center' >{unSeenMessagesCount}</div> : null}
        </a>
    </li>
  })}
  </ul>
}

export default SidebarChatList