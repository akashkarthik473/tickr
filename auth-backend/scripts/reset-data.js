#!/usr/bin/env node

/**
 * Data Reset Script for Tickr Backend
 * 
 * Restores auth-backend/data/*.json files to pristine seed state for QA/testing.
 * 
 * Usage:
 *   node scripts/reset-data.js [--backup] [--force]
 * 
 * Options:
 *   --backup    Create a backup of current data files before resetting
 *   --force     Skip confirmation prompt
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const SEEDS_DIR = path.join(DATA_DIR, 'seeds');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

const DATA_FILES = [
  'users.json',
  'portfolios.json',
  'transactions.json'
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ Error: ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Check if a file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Create backup of current data files
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                    new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
  const backupPath = path.join(BACKUP_DIR, timestamp);
  
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  fs.mkdirSync(backupPath, { recursive: true });
  
  let backedUp = 0;
  DATA_FILES.forEach(filename => {
    const sourceFile = path.join(DATA_DIR, filename);
    if (fileExists(sourceFile)) {
      const backupFile = path.join(backupPath, filename);
      fs.copyFileSync(sourceFile, backupFile);
      backedUp++;
    }
  });
  
  if (backedUp > 0) {
    success(`Backup created at: ${backupPath}`);
    info(`Backed up ${backedUp} file(s)`);
    return backupPath;
  } else {
    warn('No files to backup');
    return null;
  }
}

// Reset data files from seeds
function resetDataFiles() {
  // Ensure seeds directory exists
  if (!fs.existsSync(SEEDS_DIR)) {
    error(`Seeds directory not found: ${SEEDS_DIR}`);
  }
  
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    info(`Created data directory: ${DATA_DIR}`);
  }
  
  let resetCount = 0;
  const missingSeeds = [];
  
  DATA_FILES.forEach(filename => {
    const seedFile = path.join(SEEDS_DIR, filename);
    const dataFile = path.join(DATA_DIR, filename);
    
    if (!fileExists(seedFile)) {
      missingSeeds.push(filename);
      warn(`Seed file not found: ${seedFile}, creating empty file`);
      // Create empty seed file if it doesn't exist
      fs.writeFileSync(seedFile, '{}\n', 'utf8');
    }
    
    // Copy seed file to data file
    fs.copyFileSync(seedFile, dataFile);
    resetCount++;
    success(`Reset ${filename}`);
  });
  
  if (missingSeeds.length > 0) {
    warn(`Created ${missingSeeds.length} missing seed file(s)`);
  }
  
  return resetCount;
}

// Ask for confirmation
function askConfirmation() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('⚠️  This will reset all data files to pristine state. Continue? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// Show help message
function showHelp() {
  log('\n🔧 Tickr Data Reset Script\n', 'blue');
  log('Usage: node scripts/reset-data.js [options]\n');
  log('Options:');
  log('  --backup, -b    Create a backup of current data files before resetting');
  log('  --force, -f     Skip confirmation prompt');
  log('  --help, -h      Show this help message\n');
  log('Examples:');
  log('  npm run reset-data              Reset data files (with confirmation)');
  log('  npm run reset-data:backup       Reset with backup');
  log('  npm run reset-data:force        Reset without confirmation\n');
  log('⚠️  IMPORTANT: You must restart the server after resetting data files!');
  log('   The server loads data files into memory at startup.\n');
  log('   See auth-backend/README.md and Documentation/Development-Notes.md');
  log('   for more information.\n');
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const createBackupFlag = args.includes('--backup') || args.includes('-b');
  const forceFlag = args.includes('--force') || args.includes('-f');
  const helpFlag = args.includes('--help') || args.includes('-h');
  
  if (helpFlag) {
    showHelp();
    process.exit(0);
  }
  
  log('\n🔧 Tickr Data Reset Script\n', 'blue');
  info(`Data directory: ${DATA_DIR}`);
  info(`Seeds directory: ${SEEDS_DIR}`);
  
  // Check if data files exist
  const existingFiles = DATA_FILES.filter(filename => {
    return fileExists(path.join(DATA_DIR, filename));
  });
  
  if (existingFiles.length > 0) {
    warn(`Found ${existingFiles.length} existing data file(s): ${existingFiles.join(', ')}`);
  } else {
    info('No existing data files found');
  }
  
  // Ask for confirmation unless --force is used
  if (!forceFlag) {
    const confirmed = await askConfirmation();
    if (!confirmed) {
      log('\n❌ Reset cancelled by user\n', 'yellow');
      process.exit(0);
    }
  }
  
  log('\n');
  
  // Create backup if requested
  if (createBackupFlag) {
    info('Creating backup...');
    createBackup();
    log('');
  }
  
  // Reset data files
  info('Resetting data files from seeds...');
  const resetCount = resetDataFiles();
  
  log('');
  success(`Successfully reset ${resetCount} data file(s) to pristine state`);
  log('');
  warn('⚠️  IMPORTANT: You must restart the server for changes to take effect!');
  info('   The server loads data files into memory at startup.');
  info('   Stop the server, then restart with: npm start or npm run dev');
  log('');
}

// Run the script
main().catch(error => {
  console.error(error);
  process.exit(1);
});

