"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Pinapayagan ang admin panel na magpakita ng images galing Cloudinary.
exports.default = ({ env }) => {
    const imgSources = ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'];
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
