import React, { useState } from 'react';

// Define types for form fields
interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  // Initialize form state with empty values
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Error state for form validation
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Simple form validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
        setIsSubmitting(true);
        setSubmissionError(null);  // Reset previous errors
      // Process the registration logic here
      console.log('Form data submitted:', formData);

    try {
    const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)

    });

    const data = await response
    console.log('Registration success:', data)

      // Reset form after successful submission
      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    } catch(error) {
        console.error('Error during registration:', error);
        setSubmissionError('An error occurred during registration. Please try again.');
    } finally {
        setIsSubmitting(false)
    }
  };
}

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <span>{errors.username}</span>}
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span>{errors.email}</span>}
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <span>{errors.password}</span>}
        </div>

        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && <span>{errors.confirmPassword}</span>}
        </div>

        <div>
          <button type="submit">Register</button>
        </div>
      </form>
    </div>
  );
};

export default Register;