// Cloudinary configuration for image uploads
// Free tier: 25GB storage, 25GB bandwidth/month

export const CLOUDINARY_CLOUD_NAME = 'dfir6a4ra';
export const CLOUDINARY_API_KEY = '563668414598348';
export const CLOUDINARY_UPLOAD_PRESET = 'civic-issue-uploads'; // We'll create this in Cloudinary

// This function uploads an image to Cloudinary and returns the URL
export async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    const data = await response.json();
    return data.secure_url; // Returns HTTPS image URL
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}
