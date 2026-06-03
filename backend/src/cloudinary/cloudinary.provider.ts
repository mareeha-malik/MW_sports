import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY } from 'src/constants';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    return cloudinary.config({
      cloud_name: 'dugqqxf20',
      api_key: '144871771359663',
      api_secret: 'nGoPS8GDc1Z8eqxu-OVkNhhiWIA',
    });
  },
};
// const uploadResult = await cloudinary.uploader
//   .upload(
//     'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
//     {
//       public_id: 'shoes',
//     },
//   )
//   .catch((error) => {
//     console.log(error);
//   });
