import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/upload/image')({
  POST: async ({ request, env }) => {
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const blogId = formData.get('blogId') as string

      if (!file) {
        return json({ error: 'No file provided' }, { status: 400 })
      }

      if (!blogId) {
        return json({ error: 'Blog ID is required' }, { status: 400 })
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      if (!allowedTypes.includes(file.type)) {
        return json(
          { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG' },
          { status: 400 }
        )
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        return json(
          { error: 'File too large. Maximum size is 5MB' },
          { status: 400 }
        )
      }

      // In production, upload to Cloudflare Images or R2
      // For now, return a mock URL
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`
      
      // Mock upload - in production, this would upload to Cloudflare Images
      // const imageUrl = await uploadToCloudflareImages(file, blogId)
      const imageUrl = `/uploads/${blogId}/${fileName}`

      return json({
        success: true,
        url: imageUrl,
        fileName,
        size: file.size,
        type: file.type,
      })
    } catch (error: any) {
      console.error('Error uploading image:', error)
      return json(
        { error: 'Failed to upload image. Please try again.' },
        { status: 500 }
      )
    }
  },
})
