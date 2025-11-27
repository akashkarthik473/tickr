/**
 * Invite routes for MVP lockdown mode
 * Admin can create single-use invite tokens; users redeem to get approved.
 */
const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { z } = require('zod');
const { sendInviteEmail } = require('../services/emailService');

const createInviteSchema = z.object({
  email: z.string().email().optional(),
  note: z.string().max(200).optional()
});

const redeemSchema = z.object({
  token: z.string().uuid('Invalid invite token')
});

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const INVITES_FILE = path.join(DATA_DIR, 'invites.json');
const WAITLIST_FILE = path.join(DATA_DIR, 'waitlist.json');

/**
 * Load invites from JSON file
 */
async function loadInvites() {
  try {
    const data = await fs.readFile(INVITES_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Save invites to JSON file
 */
async function saveInvites(list) {
  await fs.mkdir(path.dirname(INVITES_FILE), { recursive: true });
  await fs.writeFile(INVITES_FILE, JSON.stringify(list, null, 2));
}

/**
 * Load waitlist from JSON file
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
 */
async function saveWaitlist(list) {
  await fs.mkdir(path.dirname(WAITLIST_FILE), { recursive: true });
  await fs.writeFile(WAITLIST_FILE, JSON.stringify(list, null, 2));
}

/**
 * POST /api/invites
 * Create a new single-use invite token (admin only)
 */
router.post('/', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const parsed = createInviteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: parsed.error.issues[0]?.message || 'Invalid input'
      });
    }

    const { email, note } = parsed.data;
    const token = crypto.randomUUID();

    const invite = {
      token,
      email: email?.toLowerCase() || null,
      note: note || null,
      used: false,
      usedBy: null,
      usedAt: null,
      createdAt: new Date().toISOString()
    };

    const invites = await loadInvites();
    invites.push(invite);
    await saveInvites(invites);

    // If email provided, send invite email
    if (email) {
      sendInviteEmail(email, token).catch(err => {
        console.error('Failed to send invite email:', err);
      });
    }

    console.log(`[Invites] Created: ${token}${email ? ` for ${email}` : ''}`);
    res.json({ ok: true, token, invite });
  } catch (err) {
    console.error('[Invites] Create error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

/**
 * POST /api/invites/redeem
 * Redeem an invite token to become approved
 */
router.post('/redeem', async (req, res) => {
  try {
    const parsed = redeemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: parsed.error.issues[0]?.message || 'Invalid token'
      });
    }

    const { token } = parsed.data;
    const invites = await loadInvites();
    const invite = invites.find(i => i.token === token);

    if (!invite) {
      return res.status(404).json({ ok: false, error: 'Invalid invite token' });
    }

    if (invite.used) {
      return res.status(400).json({ ok: false, error: 'Invite already used' });
    }

    // Get user from request (requires auth)
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, error: 'Authentication required' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET;
    let decoded;
    try {
      decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    } catch {
      return res.status(401).json({ ok: false, error: 'Invalid token' });
    }

    const userEmail = decoded.email;
    const userId = decoded.userId;

    // If invite is tied to specific email, verify it matches
    if (invite.email && invite.email !== userEmail.toLowerCase()) {
      return res.status(403).json({ ok: false, error: 'Invite not valid for this email' });
    }

    // Mark invite as used
    invite.used = true;
    invite.usedBy = userId;
    invite.usedAt = new Date().toISOString();
    await saveInvites(invites);

    // Update user's approved status in users.json
    const fileStorage = req.app.locals.fileStorage;
    const users = fileStorage.getUsers();
    if (users[userId]) {
      users[userId].approved = true;
      users[userId].approvedAt = new Date().toISOString();
      users[userId].inviteToken = token;
      fileStorage.saveUsers(users);
    }

    // Also update waitlist entry if exists
    const waitlist = await loadWaitlist();
    const waitlistEntry = waitlist.find(w => w.email === userEmail.toLowerCase());
    if (waitlistEntry) {
      waitlistEntry.approved = true;
      waitlistEntry.approvedAt = new Date().toISOString();
      waitlistEntry.inviteToken = token;
      await saveWaitlist(waitlist);
    }

    console.log(`[Invites] Redeemed: ${token} by ${userEmail}`);
    res.json({ ok: true, message: 'Invite redeemed successfully' });
  } catch (err) {
    console.error('[Invites] Redeem error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

/**
 * GET /api/invites (admin)
 * List all invites
 */
router.get('/', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const invites = await loadInvites();
    res.json({ ok: true, invites, count: invites.length });
  } catch (err) {
    console.error('[Invites] List error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;

