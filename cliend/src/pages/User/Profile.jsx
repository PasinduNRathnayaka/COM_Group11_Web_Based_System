import { useAppContext } from "../../context/AppContext";

const Profile = () => {
  const { user } = useAppContext();

  return (
    <div className="mt-10 max-w-md mx-auto text-center">
      <img src={user?.profilePic} alt="profile" className="w-24 h-24 rounded-full mx-auto mb-4" />
      <h2 className="text-xl font-bold">Welcome, {user?.name}</h2>
      <button className="mt-4 px-4 py-2 bg-primary hover:bg-primary-dull text-white rounded">
        Change Profile Photo
      </button>
    </div>
  );
};

export default Profile;
