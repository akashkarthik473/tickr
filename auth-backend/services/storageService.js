const fs = require('fs');

class FileStorage {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.usersFile = null;
    this.portfoliosFile = null;
    this.transactionsFile = null;
  }

  getTimestamp() {
    return new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  }

  readFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.error(`[${this.getTimestamp()}] Error reading ${filePath}:`, error.message);
      return {};
    }
  }

  writeFile(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`[${this.getTimestamp()}] Error writing ${filePath}:`, error.message);
    }
  }

  getUsers() {
    return this.readFile(this.usersFile);
  }

  saveUsers(users) {
    this.writeFile(this.usersFile, users);
  }

  getPortfolios() {
    return this.readFile(this.portfoliosFile);
  }

  savePortfolios(portfolios) {
    this.writeFile(this.portfoliosFile, portfolios);
  }

  getTransactions() {
    return this.readFile(this.transactionsFile);
  }

  saveTransactions(transactions) {
    this.writeFile(this.transactionsFile, transactions);
  }
}

module.exports = FileStorage;

