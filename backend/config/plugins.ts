// Upload ng images:
// - Localhost (walang CLOUDINARY_NAME): sa public/uploads folder, gaya ng dati.
// - Online (may CLOUDINARY_NAME): sa Cloudinary, para hindi mawala ang images sa Render.
export default ({ env }: { env: any }) => {
  if (!env('CLOUDINARY_NAME')) return {};

  return {
    upload: {
      config: {
        provider: 'cloudinary',
        providerOptions: {
          cloud_name: env('CLOUDINARY_NAME'),
          api_key: env('CLOUDINARY_KEY'),
          api_secret: env('CLOUDINARY_SECRET'),
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
  };
};