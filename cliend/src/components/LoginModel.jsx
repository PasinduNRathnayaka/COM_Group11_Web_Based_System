const LoginModal = ({ isOpen, onClose, onSignInClick }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            className="border rounded px-4 py-2"
          />
          <input
            type="password"
            placeholder="Password"
            className="border rounded px-4 py-2"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dull text-white rounded px-4 py-2"
          >
            Log In
          </button>
        </form>


        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:underline block mx-auto"
        >
          Close
        </button>

        <div className="mt-3 text-center text-sm">
        <span>Don't have an account? </span>
        <button
        onClick={onSignInClick} // This will be passed from parent
        className="text-primary hover:underline font-semibold"
        type="button"
         >
        Sign In
         </button>
        </div>


      </div>
    </div>
  )
}

export default LoginModal
