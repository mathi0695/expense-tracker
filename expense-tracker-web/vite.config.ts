import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // Allow access from any host (needed for Docker and remote access)
    strictPort: true,
    allowedHosts: [
      'ec2-13-202-159-158.ap-south-1.compute.amazonaws.com',
      '.amazonaws.com', // Allow all AWS domains
      'localhost',
    ],
  },
  plugins: [react()],
})
