/**
 * API Entry Point
 * Initializes Express app and routes
 */
import express from 'express';
import cors from 'cors';
import airdropRoutes from './airdrop/routes';
const app = express();
// ============================================================================
// MIDDLEWARE
// ============================================================================
// Enable CORS for frontend
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'https://nuxchain.app',
    ],
    credentials: true,
}));
// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// ============================================================================
// ROUTES
// ============================================================================
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Airdrop registration routes
app.use('/api/airdrop', airdropRoutes);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.path}`,
    });
});
// Error handler
app.use((err, req, res) => {
    console.error('❌ Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});
export default app;
