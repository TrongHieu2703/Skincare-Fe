/**
 * Format a product image URL for display
 * @param {string} imagePath - The image path from the API
 * @returns {string} Formatted URL for the image
 */
export const formatProductImageUrl = (imagePath) => {
    // Define a reliable placeholder image URL
    const PLACEHOLDER_IMAGE = "/src/assets/images/aboutus.jpg";
    
    // If no image path or empty string, return default placeholder
    if (!imagePath || imagePath === '') {
        return PLACEHOLDER_IMAGE;
    }
    
    // If it's already a complete URL, return it as is
    if (imagePath.startsWith("http")) {
        return imagePath;
    }
    
    // If it's a relative path starting with /, add the API base URL
    if (imagePath.startsWith("/")) {
        return `https://localhost:7290${imagePath}`;
    }
    
    // Otherwise, assume it's a relative path and add the base URL with /
    return `https://localhost:7290/${imagePath}`;
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

/**
 * Handle image loading errors
 * @param {Event} e - The error event
 * @param {string} fallbackSrc - Optional fallback source if different from default
 */
export const handleImageError = (e, fallbackSrc = "/src/assets/images/aboutus.jpg") => {
    // If the image is already the fallback, don't try to reload it
    if (e.target.src.includes(fallbackSrc) || e.target.hasAttribute('data-fallback-applied')) {
        e.target.classList.add('placeholder-image');
        e.target.setAttribute('data-fallback-applied', 'true');
        return;
    }
    
    // Set image dimensions to ensure proper display
    e.target.style.minWidth = '80%';
    e.target.style.minHeight = '80%';
    e.target.style.width = 'auto';
    e.target.style.height = 'auto';
    e.target.style.maxWidth = '100%';
    e.target.style.maxHeight = '100%';
    
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = fallbackSrc; // Fallback image
    e.target.classList.add('placeholder-image'); // Add class for styling
    e.target.setAttribute('data-fallback-applied', 'true');
}; 