import express from 'express'
import crawlRoutes from '../routes/crawl.route.js'

const app = express()
// Set higher limits because response payloads with base64 images can be large
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Expose the "screenshots" folder so you can simply view saved images in your browser
app.use('/screenshots', express.static('screenshots'));

app.use('/api', crawlRoutes);



export default app;