/**
 * Waitlist routes for MVP lockdown mode
 * Stores waitlist entries in JSON file; idempotent by email.
 */
const express = require('express');
const router = express.Router();
const fs = require('node:fs/promises');
const path = require('node:path');
const { z } = require('zod');
const { sendWaitlistConfirmation } = require('../services/emailService');

const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  captcha: z.string().min(10).optional() // TODO: verify with hCaptcha/Turnstile
});

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const WAITLIST_FILE = path.join(DATA_DIR, 'waitlist.json');

/**
 * Load waitlist from JSON file
 * @returns {Promise<Array>}
 */
async function loadWaitlist() {
  try {
    const data = await fs.readFile(WAITLIST_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Save waitlist to JSON file
 * @param {Array} list
 */
async function saveWaitlist(list) {
  await fs.mkdir(path.dirname(WAITLIST_FILE), { recursive: true });
  await fs.writeFile(WAITLIST_FILE, JSON.stringify(list, null, 2));
}

/**
 * POST /api/waitlist
 * Add email to waitlist (idempotent - returns success if already exists)
 */
router.post('/', async (req, res) => {
  try {
    const parsed = waitlistSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: parsed.error.issues[0]?.message || 'Invalid input'
      });
    }

    const { email, name, captcha } = parsed.data;

    // TODO: Verify captcha with hCaptcha/Turnstile using server-side secret
    // if (captcha) {
    //   const verified = await verifyCaptcha(captcha);
    //   if (!verified) return res.status(400).json({ ok: false, error: 'Invalid captcha' });
    // }

    const list = await loadWaitlist();
    
    // Check for existing entry (case-insensitive)
    const existing = list.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      // Idempotent: return success if already on list
      return res.status(200).json({ ok: true, message: 'Already on waitlist' });
    }

    const entry = {
      id: `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      name: name,
      addedAt: new Date().toISOString(),
      approved: false,
      approvedAt: null,
      inviteToken: null
    };

    list.push(entry);
    await saveWaitlist(list);

    // Send confirmation email (don't block response)
    sendWaitlistConfirmation(email, name || 'there').catch(err => {
      console.error('Failed to send waitlist confirmation:', err);
    });

    console.log(`[Waitlist] Added: ${email}`);
    res.json({ ok: true, message: 'Added to waitlist' });
  } catch (err) {
    console.error('[Waitlist] Error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

/**
 * GET /api/waitlist/status
 * Check if an email is on the waitlist and their approval status
 */
router.get('/status', async (req, res) => {
  try {
    const email = req.query.email?.toLowerCase();
    if (!email) {
      return res.status(400).json({ ok: false, error: 'Email required' });
    }

    const list = await loadWaitlist();
    const entry = list.find(x => x.email === email);

    if (!entry) {
      return res.json({ ok: true, onWaitlist: false, approved: false });
    }

    res.json({
      ok: true,
      onWaitlist: true,
      approved: entry.approved,
      addedAt: entry.addedAt
    });
  } catch (err) {
    console.error('[Waitlist] Status error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

/**
 * GET /api/waitlist (admin)
 * List all waitlist entries (requires admin auth in production)
 */
router.get('/', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const list = await loadWaitlist();
    res.json({ ok: true, entries: list, count: list.length });
  } catch (err) {
    console.error('[Waitlist] List error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;

