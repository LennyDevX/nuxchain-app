/**
 * Example: How to use edge-rate-limit in API routes
 */
import { edgeRateLimit } from '../_middlewares/edge-rate-limit';
export default async function handler(req, res) {
    // Apply rate limiting
    const allowed = await edgeRateLimit(req, res);
    if (!allowed) {
        return; // Rate limit response already sent
    }
    // Your API logic here
    res.json({ message: 'Success' });
}
