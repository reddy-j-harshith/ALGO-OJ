import { createContext, useState, useEffect } from 'react'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export default AuthContext;


export const AuthProvider = ({children}) => {
    let [authTokens, setAuthTokens] = useState(()=> localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null)
    let [user, setUser] = useState(()=> localStorage.getItem('authTokens') ? jwtDecode(localStorage.getItem('authTokens')) : null)
    let [admin, setAdmin] = useState(false)

    const navigate = useNavigate()

    let loginUser = async (e )=> {
        e.preventDefault()
        let response = await fetch('http://127.0.0.1:8000/api/token/', {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({'username':e.target.username.value, 'password':e.target.password.value})
        })
        let data = await response.json()

        if(response.status === 200){
            setAuthTokens(data)
            setUser(jwtDecode(data.access))
            setAdmin(jwtDecode(data.access).is_staff)
            // isAdmin();
            localStorage.setItem('authTokens', JSON.stringify(data))
            navigate('/')
        }else if(response.status === 401){
            alert('Invalid credentials')
        }
    }


    let logoutUser = () => {
        setAuthTokens(null)
        setUser(null)
        setAdmin(false)
        localStorage.removeItem('authTokens')
        navigate('/login')
    }


    let updateToken = async ()=> {

        let response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({'refresh':authTokens?.refresh})
        })

        let data = await response.json()
        
        if (response.status === 200){
            setAuthTokens(data)
            setUser(jwtDecode(data.access))
            setAdmin(jwtDecode(data.access).is_staff)
            console.log(jwtDecode(data.access).is_staff)
            localStorage.setItem('authTokens', JSON.stringify(data))
        }else{
            logoutUser()
        }

    }


    let contextData = {
        authTokens: authTokens,
        user: user,
        loginUser: loginUser,
        logoutUser: logoutUser,
        admin: admin
    }


    useEffect(()=> {

        let fourSeconds = 1000 * 4

        let interval =  setInterval(()=> {
            if(authTokens){
                updateToken()
            }
        }, fourSeconds)
        return ()=> clearInterval(interval)

    }, [authTokens])

    return(
        <AuthContext.Provider value={contextData} >
            {children}
        </AuthContext.Provider>
    )
}