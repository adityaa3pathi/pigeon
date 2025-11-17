import { authOptions } from "@/app/libs/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { Children, ReactNode } from "react";



interface LayoutProps {
    children: ReactNode
}

const Layout = async ({children}: LayoutProps) => {
    const session = await getServerSession(authOptions)
    if(!session) notFound()

        return (
            <div>
                {children}
            </div>
        )
}

export default Layout