'use client'
import * as React from "react";
import { createContext, FC, PropsWithChildren, Dispatch, SetStateAction, useState, useMemo, useCallback } from "react";

// type TypeContext = {
//     user: IUser,
//     setUser: Dispatch<SetStateAction<IUser>>
// }

// export const AuthContext = createContext<TypeContext>({
//     user: null,
//     setUser: () => {}
// });

const AuthProvider : FC<PropsWithChildren<unknown>> = ({children }) => {
    // const [user, setUser] = useState<IUser>(null);
    return(
        <></>
        // <AuthContext.Provider value={{user, setUser}}>
        //     {children}
        // </AuthContext.Provider>
    )
}

export default AuthProvider;