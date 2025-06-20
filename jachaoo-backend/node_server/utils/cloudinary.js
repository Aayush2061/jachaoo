const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Verify credentials exist before configuring
if (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Missing Cloudinary configuration in environment variables');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const deleteFromCloudinary = async (publicId) => {
    try {
        console.log(`Attempting to delete Cloudinary asset: ${publicId}`);

        // First verify the asset exists
        const exists = await cloudinary.api.resource(publicId)
            .then(() => true)
            .catch(() => false);

        if (!exists) {
            console.log(`Asset ${publicId} not found in Cloudinary`);
            return true; // Consider it deleted if it doesn't exist
        }

        // Perform deletion
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`Cloudinary deletion result for ${publicId}:`, result);

        return result.result === 'ok';
    } catch (err) {
        console.error('Cloudinary deletion error:', {
            publicId,
            error: err.message,
            stack: err.stack
        });
        return false;
    }
};

module.exports = { deleteFromCloudinary };