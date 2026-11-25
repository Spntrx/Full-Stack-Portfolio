import { defineConfig } from 'cypress'

export default defineConfig({
  video: true,
  e2e: {
    baseUrl: 'https://avi-portfolio-client.onrender.com',
    supportFile: false,
    viewportWidth: 1280,
    viewportHeight: 800,
  },
})