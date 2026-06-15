import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // Block search engines from admin and API
    },
    sitemap: 'https://bhaviksecurity.com/sitemap.xml',
  }
}
