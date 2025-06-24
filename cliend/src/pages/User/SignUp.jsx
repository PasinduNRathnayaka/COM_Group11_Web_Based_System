const SignUp = () => {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
      <form className="flex flex-col gap-4">
        <input type="text" placeholder="Username" className="border px-4 py-2 rounded" />
        <input type="email" placeholder="Email" className="border px-4 py-2 rounded" />
        <input type="password" placeholder="Password" className="border px-4 py-2 rounded" />
        <input type="password" placeholder="Confirm Password" className="border px-4 py-2 rounded" />
        <button type="submit" className="bg-primary hover:bg-primary-dull text-white py-2 rounded">
          Sign Up
        </button>
      </form>
    </div>
  )
}

export default SignUp