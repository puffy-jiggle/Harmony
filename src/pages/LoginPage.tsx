import React, {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'

const LoginPage = () => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail]= useState('')
    const [isLoading, setIsLoading]= useState(false);
    const navigate = useNavigate();

    const handleLogin = async(e:React.FormEvent) => {
        e.preventDefault()
        if(!username || !email || !password) {
            console.log('Please fill in all field')
            return;
        }

        setIsLoading(true); // Show loading indicator

        try{
        const response = await fetch('/login' , {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({username,password,email})
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const responseData = await response.json();
        console.log('responseData', responseData)
        navigate('/')

    } catch(error) {
        console.log('error found from post request')
    } finally {
        setIsLoading(false);
    }
}




    return (
        <form onSubmit={handleLogin}>
        <input
        type="text"
        placeholder="Enter Username"
        className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={username}
        onChange={(e)=> setUsername(e.target.value)}
      />
        <input
        type="email"
        placeholder="Enter Email"
        className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={email}
        onChange={(e)=> setEmail(e.target.value)}
      />
      <input
      type="password"
       placeholder="Enter password"
      className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={password}
      onChange={(e)=> setPassword(e.target.value)}
    />
      <button type='submit' disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</button>
    </form>
  
    )
}

export default LoginPage;