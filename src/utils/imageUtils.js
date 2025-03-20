/**
 * Format a product image URL for display
 * @param {string} imagePath - The image path from the API
 * @returns {string} Formatted URL for the image
 */
export const formatProductImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";  // Ảnh mặc định nếu không có ảnh
    if (imagePath.startsWith("http")) return imagePath;  // Nếu là URL tuyệt đối, giữ nguyên
    return `https://localhost:7290${imagePath}`;  // Thêm BASE_URL của backend
};


/**
 * Test if an image URL is valid
 * @param {string} url - The image URL to test
 * @returns {Promise<boolean>} - Whether the image can be loaded
 */
export const testImageUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

export const handleImageError = (e) => {
  e.target.onerror = null; // Prevent infinite loop
  e.target.src = "/src/assets/images/placeholder.png"; // Fallback image
}; 