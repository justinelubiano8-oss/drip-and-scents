// Pinapayagan ang admin panel na magpakita ng images galing Supabase Storage,
// at kinokontrol kung aling website ang pwedeng tumawag sa API (CORS).
export default ({ env }: { env: any }) => {
  const storageHost = env('S3_PUBLIC_HOST', '');
  const imgSources = ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', storageHost].filter(Boolean);

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': imgSources,
            'media-src': imgSources,
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    {
      name: 'strapi::cors',
      config: {
        origin: env.array('CORS_ORIGINS', ['*']),
      },
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};