// Test endpoint to verify basic API connectivity

// CORS Configuration for Vercel
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Max-Age': '86400',
};

// Test handler
async function testConnectionHandler(req, res) {
  try {
    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Log environment information
    console.log('Test endpoint called');
    console.log('Environment variables check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('API_KEY exists:', !!process.env.API_KEY);
    console.log('GOOGLE_API_KEY exists:', !!process.env.GOOGLE_API_KEY);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'API connection test successful',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        env: process.env.NODE_ENV || 'unknown'
      }
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
}

export default testConnectionHandler;