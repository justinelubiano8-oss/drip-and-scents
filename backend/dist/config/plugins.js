"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Upload ng images:
// - Sa localhost (walang S3_BUCKET): sa public/uploads folder, gaya ng dati.
// - Online (may S3_BUCKET): sa Supabase Storage gamit ang S3-compatible na koneksyon,
//   para hindi mawala ang images tuwing magre-redeploy ang Render.
exports.default = ({ env }) => {
    if (!env('S3_BUCKET'))
        return {};
    return {
        upload: {
            config: {
                provider: 'aws-s3',
                providerOptions: {
                    baseUrl: env('S3_PUBLIC_URL'),
                    s3Options: {
                        credentials: {
                            accessKeyId: env('S3_ACCESS_KEY_ID'),
                            secretAccessKey: env('S3_SECRET_ACCESS_KEY'),
                        },
                        region: env('S3_REGION'),
                        endpoint: env('S3_ENDPOINT'),
                        forcePathStyle: true,
                        params: {
                            Bucket: env('S3_BUCKET'),
                        },
                    },
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
