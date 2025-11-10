import { Router } from 'express';
import axios from 'axios';

export const chatRouter = Router();

const VANNA_API_BASE = process.env.VANNA_API_BASE_URL || 'http://localhost:8000';

chatRouter.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Forward request to Vanna AI
    const response = await axios.post(`${VANNA_API_BASE}/query`, {
      question: query,
    }, {
      timeout: 30000, // 30 seconds timeout
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('Error in chat-with-data:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Vanna AI service is not available',
        message: 'Please ensure the Vanna AI server is running',
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Vanna AI error',
        message: error.response.data?.error || 'Failed to process query',
      });
    }

    res.status(500).json({
      error: 'Failed to process query',
      message: error.message,
    });
  }
});
