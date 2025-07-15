import React, { useState, useRef, useCallback } from "react";
import { useAppContext } from "../../context/AppContext";
import Cropper from "react-easy-crop";
import getCroppedImg from "./cropImage"; // helper function to crop image from canvas

const Profile = () => {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState("account");
  const [profileImage, setProfileImage] = useState(
    user?.profilePic || "https://i.ibb.co/vzvY0kQ/user.png"
  );

  // Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppingImage, setCroppingImage] = useState(null); // image to crop
  const [showCropper, setShowCropper] = useState(false);

  const fileInputRef = useRef();

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // When file selected, read file and open cropper
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCroppingImage(imageUrl);
      setShowCropper(true); // open cropper modal
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(croppingImage, croppedAreaPixels);

      // Convert blob to URL for preview
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);

      setProfileImage(croppedImageUrl);
      setShowCropper(false);

      // TODO: upload croppedImageBlob to server if needed
    } catch (e) {
      console.error(e);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCroppingImage(null);
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Account Info</h2>
            <form className="space-y-4">
             {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
                <div>
                  <label className="block mb-1 font-medium">User Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    defaultValue={user?.name || "Pasidu"}
                  />
                </div>
               {/*
                <div>
                  <label className="block mb-1 font-medium">Last Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    defaultValue="Indusara"
                  />
                </div>
              </div>
              */}
              <div>
                <label className="block mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  defaultValue={user?.email || "test@gmail.com"}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Phone Number</label>
                <input
                  type="tel"
                  className="w-full border rounded px-3 py-2"
                  defaultValue={user?.number || "0777555666"}
                />
              </div>
              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-primary hover:bg-blue-700 text-white rounded"
              >
                Save
              </button>
            </form>
          </div>
        );
      case "orders":
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">My Orders</h2>
            <p className="text-gray-500">You haven't placed any orders yet.</p>
          </div>
        );
      case "password":
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Current Password</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">New Password</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Confirm Password</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-primary hover:bg-blue-700 text-white rounded"
              >
                Update Password
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-100 py-10 px-4 min-h-screen flex justify-center items-start">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-md p-6 md:p-10 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 bg-gray-50 rounded-lg p-4 shadow">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <img
                src={profileImage}
                alt="profile"
                onClick={handleImageClick}
                className="w-24 h-24 rounded-full mx-auto mb-2 cursor-pointer object-cover"
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <h3 className="font-semibold mt-2">{user?.name || "Pasindu Indusara"}</h3>
            <p className="text-sm text-gray-500">{user?.email || "test@gmail.com"}</p>
          </div>
          <hr className="mb-4" />
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab("account")}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === "account"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              Account Info
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === "orders"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              My Order
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === "password"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">{renderMainContent()}</div>

        {/* Cropper Modal */}
        {showCropper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
  <div
    className="relative w-[90vw] max-w-lg bg-white rounded-lg p-4 flex flex-col"
    style={{ height: "450px" }}
  >
    <Cropper
      image={croppingImage}
      crop={crop}
      zoom={zoom}
      aspect={1}
      onCropChange={setCrop}
      onZoomChange={setZoom}
      onCropComplete={onCropComplete}
      style={{ flexGrow: 1, position: "relative" }}
    />
    <div
  className="flex justify-between mt-4"
  style={{ pointerEvents: "auto", zIndex: 10 }}
>
  <button
    onClick={handleCropCancel}
    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
    style={{ pointerEvents: "auto" }}
  >
    Cancel
  </button>
  <button
    onClick={handleCropSave}
    className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700"
    style={{ pointerEvents: "auto" }}
  >
    Save
  </button>
</div>

  </div>
</div>

        )}
      </div>
    </div>
  );
};

export default Profile;



