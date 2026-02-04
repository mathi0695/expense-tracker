import { Router } from 'express';
import { downloadReport } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/reports/download/:reportId
 * @desc    Download a generated report
 * @access  Private
 * @query   format - Report format (csv, json) - default: json
 */
router.get('/download/:reportId', authenticate, downloadReport);

export default router;

