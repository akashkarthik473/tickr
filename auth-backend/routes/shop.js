const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Helper function to get formatted timestamp
const getTimestamp = () => {
  return new Date().toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// File-based user management
const getUsers = (req) => req.app.locals.fileStorage.getUsers();
const saveUsers = (req, users) => req.app.locals.fileStorage.saveUsers(users);

// Shop items definition (synced with frontend)
// Only includes items that are fully implemented
const SHOP_ITEMS = [
  {
    id: 1,
    name: "XP Booster",
    description: "Get 50% more XP for the next 3 lessons",
    price: 25,
    type: "booster",
    icon: "⚡",
    rarity: "common",
    effect: {
      type: "xp_multiplier",
      multiplier: 1.5,
      lessonsRemaining: 3,
      duration: 24 * 60 * 60 * 1000 // 24 hours in ms
    }
  },
  {
    id: 2,
    name: "Coin Doubler",
    description: "Double your coins earned for the next 5 lessons",
    price: 50,
    type: "booster",
    icon: "🪙",
    rarity: "rare",
    effect: {
      type: "coin_multiplier",
      multiplier: 2,
      lessonsRemaining: 5,
      duration: 48 * 60 * 60 * 1000 // 48 hours in ms
    }
  },
  {
    id: 3,
    name: "Super XP Booster",
    description: "Get 100% more XP (2x) for the next 2 lessons",
    price: 75,
    type: "booster",
    icon: "⚡⚡",
    rarity: "epic",
    effect: {
      type: "xp_multiplier",
      multiplier: 2,
      lessonsRemaining: 2,
      duration: 24 * 60 * 60 * 1000 // 24 hours in ms
    }
  },
  {
    id: 4,
    name: "Coin Starter Pack",
    description: "Instantly receive 100 bonus coins",
    price: 25,
    type: "utility",
    icon: "💰",
    rarity: "common",
    effect: {
      type: "instant_coins",
      amount: 100
    }
  }
];

// Get all shop items
router.get('/items', authenticateToken, (req, res) => {
  console.log(`[${getTimestamp()}] 🛍️ Shop: User ${req.user.userId} fetching shop items`);
  
  try {
    res.json({
      success: true,
      items: SHOP_ITEMS
    });
  } catch (error) {
    console.error(`[${getTimestamp()}] ❌ Shop: Error fetching items:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop items'
    });
  }
});

// Get user's purchased items
router.get('/purchases', authenticateToken, (req, res) => {
  console.log(`[${getTimestamp()}] 🛍️ Shop: User ${req.user.userId} fetching purchases`);
  
  try {
    const users = getUsers(req);
    const user = users[req.user.userId];
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const purchasedItems = user.purchasedItems || [];
    
    console.log(`[${getTimestamp()}] ✅ Shop: Retrieved ${purchasedItems.length} purchases for user ${req.user.userId}`);
    
    res.json({
      success: true,
      purchases: purchasedItems
    });
  } catch (error) {
    console.error(`[${getTimestamp()}] ❌ Shop: Error fetching purchases:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchases'
    });
  }
});

// Purchase an item
router.post('/purchase', authenticateToken, (req, res) => {
  const { itemId } = req.body;
  
  console.log(`[${getTimestamp()}] 🛒 Shop: User ${req.user.userId} attempting to purchase item ${itemId}`);
  
  try {
    // Validate item ID
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    // Find the item
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) {
      console.log(`[${getTimestamp()}] ⚠️ Shop: Item ${itemId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Get user data
    const users = getUsers(req);
    const user = users[req.user.userId];
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize user data if needed
    if (!user.learningProgress) {
      user.learningProgress = { xp: 0, coins: 0 };
    }
    if (!user.purchasedItems) {
      user.purchasedItems = [];
    }

    // Check if user has enough coins
    const userCoins = user.learningProgress.coins || 0;
    if (userCoins < item.price) {
      console.log(`[${getTimestamp()}] ⚠️ Shop: User ${req.user.userId} has insufficient coins (${userCoins}/${item.price})`);
      return res.status(400).json({
        success: false,
        message: 'Insufficient coins',
        userCoins,
        itemPrice: item.price
      });
    }

    // Check if item is already purchased (for one-time purchase items)
    const alreadyPurchased = user.purchasedItems.some(p => p.itemId === itemId);
    if (alreadyPurchased && item.type !== 'booster' && item.type !== 'utility') {
      console.log(`[${getTimestamp()}] ⚠️ Shop: User ${req.user.userId} already owns item ${itemId}`);
      return res.status(400).json({
        success: false,
        message: 'You already own this item'
      });
    }

    // Deduct coins
    user.learningProgress.coins -= item.price;

    // Create purchase record
    const purchase = {
      itemId: item.id,
      itemName: item.name,
      itemType: item.type,
      price: item.price,
      purchasedAt: new Date().toISOString(),
      effect: item.effect,
      active: true
    };

    // Add to purchased items
    user.purchasedItems.push(purchase);

    // Apply item effects based on type
    if (item.type === 'booster') {
      if (!user.activeEffects) {
        user.activeEffects = {};
      }
      
      // Store the active effect
      const effectKey = `${item.effect.type}_${Date.now()}`;
      user.activeEffects[effectKey] = {
        ...item.effect,
        expiresAt: new Date(Date.now() + item.effect.duration).toISOString(),
        purchasedAt: purchase.purchasedAt
      };
      console.log(`[${getTimestamp()}] ⚡ Shop: Activated ${item.effect.type} effect for user ${req.user.userId}`);
    } else if (item.type === 'utility' && item.effect.type === 'instant_coins') {
      // Give instant coins
      user.learningProgress.coins += item.effect.amount;
      console.log(`[${getTimestamp()}] 💰 Shop: Granted ${item.effect.amount} instant coins to user ${req.user.userId}`);
    }

    // Save updated user data
    saveUsers(req, users);

    console.log(`[${getTimestamp()}] ✅ Shop: Purchase successful - User ${req.user.userId} bought "${item.name}" for ${item.price} coins (${user.learningProgress.coins} coins remaining)`);

    res.json({
      success: true,
      message: 'Purchase successful',
      purchase: purchase,
      remainingCoins: user.learningProgress.coins
    });
  } catch (error) {
    console.error(`[${getTimestamp()}] ❌ Shop: Error processing purchase:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to process purchase'
    });
  }
});

// Get active effects (boosters)
router.get('/active-effects', authenticateToken, (req, res) => {
  console.log(`[${getTimestamp()}] 🛍️ Shop: User ${req.user.userId} fetching active effects`);
  
  try {
    const users = getUsers(req);
    const user = users[req.user.userId];
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const activeEffects = user.activeEffects || {};
    const now = new Date();

    // Filter out expired effects
    const validEffects = {};
    let hasExpired = false;

    Object.keys(activeEffects).forEach(key => {
      const effect = activeEffects[key];
      if (new Date(effect.expiresAt) > now && effect.lessonsRemaining > 0) {
        validEffects[key] = effect;
      } else {
        hasExpired = true;
      }
    });

    // Update user data if any effects expired
    if (hasExpired) {
      user.activeEffects = validEffects;
      saveUsers(req, users);
      console.log(`[${getTimestamp()}] 🧹 Shop: Cleaned up expired effects for user ${req.user.userId}`);
    }

    console.log(`[${getTimestamp()}] ✅ Shop: Retrieved ${Object.keys(validEffects).length} active effects for user ${req.user.userId}`);
    
    res.json({
      success: true,
      activeEffects: validEffects
    });
  } catch (error) {
    console.error(`[${getTimestamp()}] ❌ Shop: Error fetching active effects:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active effects'
    });
  }
});

module.exports = router;

