import { Cloudinary } from 'cloudinary-core';

// Initialize Cloudinary with an unsigned upload preset
const cloudinaryConfig = {
  cloud_name: 'ducxbdmzv', // Replace with your Cloudinary cloud name
  upload_preset: 'sarmad' // Create this unsigned upload preset in your Cloudinary dashboard
};

// Create a Cloudinary instance for frontend use
export const cloudinary = new Cloudinary({
  cloud_name: cloudinaryConfig.cloud_name,
  secure: true
});

export default cloudinaryConfig; 