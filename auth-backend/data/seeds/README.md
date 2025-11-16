# Data Seeds

This directory contains pristine seed data files for QA and testing purposes.

## Files

- `users.json` - Empty user data (pristine state)
- `portfolios.json` - Empty portfolio data (pristine state)
- `transactions.json` - Empty transaction data (pristine state)

## Usage

To reset data files to pristine state, run:

```bash
npm run reset-data
```

Or with backup:

```bash
npm run reset-data:backup
```

Or force reset (no confirmation):

```bash
npm run reset-data:force
```

## Important Notes

### ⚠️ Server Restart Required

**You must restart the server after resetting data files for changes to take effect.**

The backend server loads data files into memory at startup. After running the reset script:

1. Stop the server (if running)
2. Run the reset script: `npm run reset-data`
3. **Restart the server**: `npm start` or `npm run dev`

The server will not see the reset data until it is restarted.

### Other Notes

1. Backups are stored in `auth-backend/data/backups/` (if using `--backup` flag)
2. Seed files should be committed to git (they contain minimal/empty data)
3. Actual data files and backups are ignored by git
4. This requirement applies to all data file modifications, not just resets

## Customizing Seeds

You can modify the seed files to include test data if needed for QA. The reset script will copy these files to the data directory.

