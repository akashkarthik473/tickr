# Development Notes

Important development and operational notes for the Tickr project.

## ⚠️ Data File Management

### Server Restart Required After Data File Changes

**Critical:** The backend server loads data files into memory at startup. **You must restart the server after any data file modifications for changes to take effect.**

#### When This Applies

- Direct edits to `auth-backend/data/*.json` files
- Running the data reset script (`npm run reset-data`)
- Restoring data from backups
- Any manual modifications to data files
- Copying or moving data files

#### How to Apply Changes

1. **Stop the server** (Ctrl+C in the terminal running the server)
2. **Make your data file changes** (or run the reset script)
3. **Restart the server** (`npm start` or `npm run dev`)

The server will load the updated data files on startup.

#### Why This Is Required

The backend uses file-based JSON storage where:
- Data files are read into memory at server startup
- Routes access the in-memory data for performance
- File writes update the JSON files on disk
- File reads only happen at startup (not on every request)

This design provides fast read performance but requires a restart to reload data from disk.

#### Data Reset Script

The data reset script (`npm run reset-data`) will warn you about the restart requirement. Always restart the server after running the reset script.

```bash
# Reset data files
npm run reset-data

# Then restart the server
npm start  # or npm run dev
```

## 🔧 Tooling

### Data Reset Script

Location: `auth-backend/scripts/reset-data.js`

**Usage:**
```bash
# Reset with confirmation
npm run reset-data

# Reset with backup
npm run reset-data:backup

# Reset without confirmation
npm run reset-data:force
```

**Features:**
- Creates backups of current data (optional)
- Resets data files to pristine seed state
- Provides clear warnings about server restart
- Validates seed files exist
- Creates missing seed files automatically

### Seed Data

Location: `auth-backend/data/seeds/`

Pristine seed data files for QA and testing:
- `users.json` - Empty user data
- `portfolios.json` - Empty portfolio data
- `transactions.json` - Empty transaction data

Seed files are committed to git. Actual data files and backups are gitignored.

## 🧪 Testing

### Test Data Isolation

Tests use isolated temporary data directories and don't affect production data files. The test setup (`auth-backend/tests/setupEnv.js`) creates temporary directories for each test run.

### Running Tests

```bash
# Backend tests
cd auth-backend
npm test

# Frontend tests
cd stockbuddy
npm test
```

## 📝 Best Practices

### Data File Editing

1. **Never edit data files while the server is running** - Changes won't be seen until restart
2. **Always backup before major changes** - Use `--backup` flag with reset script
3. **Use the reset script for QA** - Don't manually delete/edit data files
4. **Restart server after any data changes** - This is mandatory

### Development Workflow

1. Make code changes
2. Test locally
3. If data files need reset: run `npm run reset-data:backup`
4. **Restart the server**
5. Verify changes

### QA Workflow

1. Run data reset script: `npm run reset-data:backup`
2. **Restart the server**
3. Run QA tests
4. Verify expected behavior with clean data

## 🚨 Common Issues

### Data Changes Not Reflecting

**Symptom:** Changes to data files don't appear in the API responses.

**Cause:** Server wasn't restarted after data file changes.

**Solution:** Restart the server.

### Reset Script Doesn't Work

**Symptom:** Reset script runs but data doesn't change.

**Cause:** Server is still running with old data in memory.

**Solution:** Stop the server, run the reset script, then restart the server.

### Data Files Revert After Restart

**Symptom:** Data files appear to revert to previous state.

**Cause:** Data files are being overwritten or server is reading from a different location.

**Solution:** 
- Check `DATA_DIR` environment variable
- Verify file permissions
- Check if another process is modifying files
- Ensure you're editing the correct data files

## 📚 Related Documentation

- Main README: `README.md`
- Backend README: `auth-backend/README.md`
- Seed Data README: `auth-backend/data/seeds/README.md`
- Launch Scripts: `Documentation/Launch Scripts.md`

