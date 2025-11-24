import AddFriendButton from '@/app/components/AddFriendButton'
import { FC } from 'react'



const page: FC = async () => {

  await new Promise((resolve) => setTimeout(resolve, 2500));

  return (
    <main className='pt-8'>
        <h1 className='font-bold text-5xl mb-8'> 
        Add a friend</h1>
        <AddFriendButton/>
    </main>
  )
}

export default page