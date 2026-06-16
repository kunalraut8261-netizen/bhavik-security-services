import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/attendance/register', '/reset'],
    },
    sitemap: 'https://bhaviksecurityservice.com/sitemap.xml',
  }
}
