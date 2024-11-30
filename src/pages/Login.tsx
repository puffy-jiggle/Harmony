import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import React, {useState, useEffect } from 'react'
import e from 'cors'

interface FormInput {

    userName: string
    email: string
    password: string

}

const Login:React.FC = () => {
    const { control, handleSubmit, formState: { errors } } = useForm<FormInput>();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    //Form submit handler
    const onSubmit: SubmitHandler<FormInput> = async(data) => {
     
        console.log('data check', data)
        try {
            // Send a POST request with the form data
            const response = await fetch('/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: data.userName,
                    email: data.email,
                    password: data.password,
                }),
            });
           
            // if(!response.ok) {
            //   throw new Error(`HTTP error! status: ${response.status}`)
            // }
            const responseData = await response
            console.log('Login successful:', responseData);

            setIsLoggedIn(true)
        } catch (error) {
            console.error('Login failed:', error);
            setErrorMessage('Login failed!')
        }
    }

    useEffect(()=> {
        if(isLoggedIn) {
            console.log('User logged in successfully!');
        }
    }, [isLoggedIn])

return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto text-center mb-4">
            <h1 className="text-2x1 font-semibold text-gray-700">Hello, Welcome!</h1>
        <div className="max-w-md w-full mt-4 bg-white p-8 border border-gray-300 shadow-lg">
           <form onSubmit={handleSubmit(onSubmit)}>
            {/* User Input */}
            <div className="mb-4">
                <label htmlFor="useName" className="block text-gray-700">Username</label>
           <Controller
                name="userName"
                control={control}
                rules={{ required: "Username is requred"}}
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

             {/* Email Input */}
             <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: "Invalid email address"
                }
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  id="email"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">Password</label>
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
      </div>
    </div>
</div>
)
}
export default Login;
