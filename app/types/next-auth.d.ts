import type { Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"

type UserId = string


declare module 'next-auth/jwt' { // here we are augmenting( extending) the  existing types from  the
                                 //  next-auth package
    interface JWT {
        id: UserId
    }
}


declare module 'next-auth' {  // here we are augmenting( extending) the  existing types from  the
                              //           next-auth package
    interface Session {
       user: User & {
        id: UserId
       } 
    }
}