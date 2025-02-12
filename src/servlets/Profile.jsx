import { useState } from "react";
import "./Profile.css";
import profilePic from "/src/images/profile-pic.png"; 
import coverImage from "/src/images/cover-image.png"; 

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    number: "",
    city: "",
    state: "",
    zip: "",
    profilePhoto: profilePic,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      setFormData({ ...formData, profilePhoto: imageUrl });
    }
  };

  return (
    <div className="profile-container">
      {/* Cover Image */}
      <div className="cover-photo">
        <img src={coverImage} alt="Cover" />
      </div>

      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-image">
          <img src={formData.profilePhoto} alt="Profile" />
        </div>
        <h2>Neil Sims</h2>
        <p>Senior Software Engineer<br />New York, USA</p>
        <div className="action-buttons">
          <button className="connect-btn">+ Connect</button>
          <button className="message-btn">Send Message</button>
        </div>
      </div>

      {/* Profile Form */}
      <div className="profile-form">
        <h3>General Information</h3>
        <div className="form-group">
          <input type="text" name="firstName" placeholder="Enter your first name" value={formData.firstName} onChange={handleChange} />
          <input type="text" name="lastName" placeholder="Also your last name" value={formData.lastName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} />
          <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} />
        </div>
        <div className="form-group">
          <input type="email" name="email" placeholder="name@company.com" value={formData.email} onChange={handleChange} />
          <input type="tel" name="phone" placeholder="+12-345 678 910" value={formData.phone} onChange={handleChange} />
        </div>

        <h3>Address</h3>
        <div className="form-group">
          <input type="text" name="address" placeholder="Enter your home address" value={formData.address} onChange={handleChange} />
          <input type="text" name="number" placeholder="No." value={formData.number} onChange={handleChange} />
        </div>
        <div className="form-group">
          <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
          <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
          <input type="text" name="zip" placeholder="ZIP" value={formData.zip} onChange={handleChange} />
        </div>

        {/* Profile Photo Upload */}
        <div className="photo-upload">
          <h3>Select Profile Photo</h3>
          <label className="file-upload">
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <span>Choose Image</span>
          </label>
          <p>JPG, GIF or PNG. Max size of 800K</p>
        </div>

        <button className="save-btn">Save All</button>
      </div>
    </div>
  );
};

export default Profile;
