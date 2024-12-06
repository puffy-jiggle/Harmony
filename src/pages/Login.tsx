import { useForm, SubmitHandler, Controller} from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface FormInput {
  userName: string;
  password: string;
}

const Login: React.FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormInput>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();




  // Form submit handler
  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    console.log('data check', data);

    try {
      // Send a POST request with the form data
      const response = await fetch('http://localhost:4040/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.userName,
          password: data.password,
        }),
      });

      console.log('response', response)
      // Handle response
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json()
      console.log('Login successful:', responseData);

      //Store JWT token in localStorage
      localStorage.setItem('jwtToken', responseData.token)
      localStorage.setItem('username', data.userName)

      setIsLoggedIn(true);
      setErrorMessage(null);
      navigate('/')
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Login failed!');
    }
  };

  // useEffect(() => {
  //   const token = localStorage.getItem('jwtToken');
  //   if(token) {
  //     setIsLoggedIn(true);
  //   }
  // },[])

  // Logout handler
  const handleLogout = () => {
    // Remove the JWT token from localStorage
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username')
    setIsLoggedIn(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          {isLoggedIn ? 'Welcome back!' : 'Hello, Welcome!'}
        </h1>

        {isLoggedIn ? (
          // If logged in, show a welcome message and logout button
          <div>
            <p className="text-gray-700 mb-4 text-center">You are logged in!</p>
            <button onClick={handleLogout}
              className="w-full py-2 mt-4 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* User Input */}
            <div className="mb-4">
              <label htmlFor="userName" className="block text-gray-700 text-sm font-medium">Username</label>
              <Controller
                name="userName"
                control={control}
                rules={{ required: "Username is required" }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="userName"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
              {errors.userName && <span className="text-red-500 text-sm">{errors.userName.message}</span>}
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium">Password</label>
              <Controller
                name="password"
                control={control}
                rules={{ required: "Password is required" }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    id="password"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
              {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 mt-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </button>
          </form>
        )}

        {/* Link to Register Page */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Do not have an account? 
            <Link to="/register" className="text-blue-500 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

}

export default Login;

//src/pages/Login.tsx