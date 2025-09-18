// ========================================
// Google Apps Script API for Life Science Standards Register
// ========================================
// เชื่อมต่อกับ Google Sheets: https://docs.google.com/spreadsheets/d/1KJAfxnbH8iFDopf6rN6Kt47TWZUCV_oSCxZXNu9GvGM/edit
// 
// การใช้งาน:
// 1. คัดลอกโค้ดนี้ไปใส่ใน Google Apps Script
// 2. Deploy เป็น Web App
// 3. ตั้งค่า Environment Variables ในแอป
// ========================================

// Configuration
const CONFIG = {
  SHEET_ID: '1KJAfxnbH8iFDopf6rN6Kt47TWZUCV_oSCxZXNu9GvGM',
  SHEET_NAME: 'StandardsRegister',
  TIMEZONE: 'Asia/Bangkok',
  ID_PREFIX: 'LSR',
  FUZZY_THRESHOLD: 0.82,
  FUZZY_MAX_RESULTS: 5
};

// ========================================
// MAIN ENTRY POINTS
// ========================================

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function doOptions(e) {
  // Handle CORS preflight requests
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '3600'
    });
}


// ========================================
// REQUEST HANDLER
// ========================================

function handleRequest(e, method) {
  try {
    // Set CORS headers
    const response = ContentService.createTextOutput();
    response.setMimeType(ContentService.MimeType.JSON);
    
    const action = e.parameter?.action || (e.postData ? JSON.parse(e.postData.contents).action : null);
    
    if (!action) {
      return createResponse(false, 'Action parameter is required');
    }

    let result;
    switch (action) {
      case 'health':
        result = { 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          sheets_connected: testSheetsConnection()
        };
        break;
      case 'getStats':
        result = getStatistics();
        break;
      case 'getStandards':
        result = getStandards();
        break;
      case 'getStandardById':
        result = getStandardById(e.parameter?.id_no);
        break;
      case 'getStatusLog':
        result = getStatusLog();
        break;
      case 'findSimilarNames':
        result = findSimilarNames(e.parameter?.query);
        break;
      case 'lookupCAS':
        result = lookupCAS(e.parameter?.name);
        break;
      case 'registerStandard':
        const data = method === 'POST' ? JSON.parse(e.postData.contents) : e.parameter;
        result = registerStandard(data);
        break;
      case 'changeStatus':
        const statusData = method === 'POST' ? JSON.parse(e.postData.contents) : e.parameter;
        result = changeStatus(statusData);
        break;
      case 'updateStandard':
        const updateData = method === 'POST' ? JSON.parse(e.postData.contents) : e.parameter;
        result = updateStandard(updateData);
        break;
      case 'authenticateUser':
        const authData = method === 'POST' ? JSON.parse(e.postData.contents) : e.parameter;
        result = authenticateUser(authData.email, authData.password);
        break;
      case 'getUserByEmail':
        result = getUserByEmail(e.parameter?.email);
        break;
      case 'getAllUsers':
        result = getAllUsers();
        break;
      case 'createUser':
        const userData = method === 'POST' ? JSON.parse(e.postData.contents) : e.parameter;
        result = createUser(userData);
        break;
      case 'updateUser':
        const updateUserData = method === 'POST' ? JSON.parse(e.postData.contents) : e.parameter;
        result = updateUser(updateUserData);
        break;
      case 'deleteUser':
        const deleteData = method === 'POST' ? JSON.parse(e.postData.contents) : e.parameter;
        result = deleteUser(deleteData.email);
        break;
      default:
        return createResponse(false, `Unknown action: ${action}`);
    }

    return createResponse(true, result);
  } catch (error) {
    console.error('Error handling request:', error);
    return createResponse(false, error.toString());
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function createResponse(success, data) {
  return ContentService
    .createTextOutput(JSON.stringify({ success, data }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '3600'
    });
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SHEET_ID);
}

function getSheet(sheetName) {
  const spreadsheet = getSpreadsheet();
  return spreadsheet.getSheetByName(sheetName);
}

function testSheetsConnection() {
  try {
    const spreadsheet = getSpreadsheet();
    return spreadsheet.getName() ? true : false;
  } catch (error) {
    return false;
  }
}

// ========================================
// DATA RETRIEVAL FUNCTIONS
// ========================================

function getStatistics() {
  try {
    const sheet = getSheet('StandardsRegister');
    if (!sheet) {
      return {
        total: 0,
        unopened: 0,
        inUse: 0,
        disposed: 0,
        expiringSoon: 0,
        expired: 0
      };
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return {
        total: 0,
        unopened: 0,
        inUse: 0,
        disposed: 0,
        expiringSoon: 0,
        expired: 0
      };
    }
    
    const headers = data[0];
    const rows = data.slice(1);

    const stats = {
      total: rows.length,
      unopened: 0,
      inUse: 0,
      disposed: 0,
      expiringSoon: 0,
      expired: 0
    };

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    rows.forEach(row => {
      const statusIndex = headers.indexOf('status');
      const expiryIndex = headers.indexOf('lab_expiry_date');
      
      if (statusIndex >= 0 && row[statusIndex]) {
        const status = row[statusIndex];
        if (status === 'Unopened') stats.unopened++;
        else if (status === 'In-Use') stats.inUse++;
        else if (status === 'Disposed') stats.disposed++;
      }

      if (expiryIndex >= 0 && row[expiryIndex]) {
        const expiryDate = new Date(row[expiryIndex]);
        if (expiryDate < now) {
          stats.expired++;
        } else if (expiryDate <= thirtyDaysFromNow) {
          stats.expiringSoon++;
        }
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting statistics:', error);
    throw error;
  }
}

function getStandards() {
  try {
    const sheet = getSheet('StandardsRegister');
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const headers = data[0];
    const rows = data.slice(1);

    return rows.map(row => {
      const standard = {};
      headers.forEach((header, index) => {
        standard[header] = row[index] || '';
      });
      return standard;
    });
  } catch (error) {
    console.error('Error getting standards:', error);
    throw error;
  }
}

function getStandardById(idNo) {
  try {
    const standards = getStandards();
    return standards.find(standard => standard.id_no === idNo);
  } catch (error) {
    console.error('Error getting standard by ID:', error);
    throw error;
  }
}

function getStatusLog() {
  try {
    const sheet = getSheet('ScanLogs');
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const headers = data[0];
    const rows = data.slice(1);

    return rows.map(row => {
      const log = {};
      headers.forEach((header, index) => {
        log[header] = row[index] || '';
      });
      return log;
    });
  } catch (error) {
    console.error('Error getting status log:', error);
    return [];
  }
}

// ========================================
// SEARCH FUNCTIONS
// ========================================

function findSimilarNames(query) {
  try {
    if (!query) return [];
    
    const standards = getStandards();
    const results = [];
    
    standards.forEach(standard => {
      const name = standard.name;
      if (name) {
        const similarity = calculateSimilarity(query.toLowerCase(), name.toLowerCase());
        if (similarity >= CONFIG.FUZZY_THRESHOLD) {
          results.push({
            id_no: standard.id_no,
            name: name,
            similarity: similarity
          });
        }
      }
    });
    
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, CONFIG.FUZZY_MAX_RESULTS);
  } catch (error) {
    console.error('Error finding similar names:', error);
    return [];
  }
}

function calculateSimilarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;
  
  const distance = levenshteinDistance(str1, str2);
  return 1 - (distance / maxLen);
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[len2][len1];
}

function lookupCAS(name) {
  try {
    if (!name) return null;
    
    // Simple CAS lookup - you can enhance this with external APIs
    const commonCAS = {
      'glucose': '50-99-7',
      'sodium chloride': '7647-14-5',
      'water': '7732-18-5',
      'ethanol': '64-17-5',
      'methanol': '67-56-1'
    };
    
    const lowerName = name.toLowerCase();
    for (const [key, cas] of Object.entries(commonCAS)) {
      if (lowerName.includes(key)) {
        return {
          cas: cas,
          name: name,
          source: 'local'
        };
      }
    }
    
    return {
      cas: null,
      name: name,
      source: 'not_found'
    };
  } catch (error) {
    console.error('Error looking up CAS:', error);
    return null;
  }
}

// ========================================
// DATA MODIFICATION FUNCTIONS
// ========================================

function registerStandard(data) {
  try {
    const lock = LockService.getDocumentLock();
    lock.waitLock(10000);
    
    const sheet = getSheet('StandardsRegister');
    if (!sheet) {
      throw new Error('StandardsRegister sheet not found');
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Generate ID
    const id = generateID(data.name);
    
    // Prepare row data
    const rowData = [];
    headers.forEach(header => {
      if (header === 'id_no') {
        rowData.push(id);
      } else if (data[header] !== undefined) {
        rowData.push(data[header]);
      } else {
        rowData.push('');
      }
    });
    
    // Add row
    sheet.appendRow(rowData);
    
    // Log the registration
    logStatusChange(id, '', 'Unopened', 'system', 'New registration');
    
    lock.releaseLock();
    
    return {
      id_no: id,
      message: 'Standard registered successfully'
    };
  } catch (error) {
    console.error('Error registering standard:', error);
    throw error;
  }
}

function generateID(name) {
  const year = new Date().getFullYear().toString().slice(-2);
  const normalizedName = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
  
  // Get existing IDs for this name and year
  const standards = getStandards();
  const existingIds = standards
    .filter(s => s.id_no && s.id_no.includes(`${normalizedName}-${year}`))
    .map(s => s.id_no);
  
  // Find next sequence number
  let sequence = 1;
  while (existingIds.includes(`${CONFIG.ID_PREFIX}-${normalizedName}-${year}-${sequence.toString().padStart(3, '0')}`)) {
    sequence++;
  }
  
  return `${CONFIG.ID_PREFIX}-${normalizedName}-${year}-${sequence.toString().padStart(3, '0')}`;
}

function changeStatus(data) {
  try {
    const { id_no, new_status, note } = data;
    
    const sheet = getSheet('StandardsRegister');
    const standards = getStandards();
    const index = standards.findIndex(s => s.id_no === id_no);
    
    if (index === -1) {
      throw new Error('Standard not found');
    }
    
    const rowIndex = index + 2;
    const statusColIndex = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf('status') + 1;
    
    if (statusColIndex === 0) {
      throw new Error('Status column not found');
    }
    
    // Get current status
    const currentStatus = sheet.getRange(rowIndex, statusColIndex).getValue();
    
    // Update status
    sheet.getRange(rowIndex, statusColIndex).setValue(new_status);
    
    // Update dates based on status
    const now = new Date();
    if (new_status === 'In-Use' && currentStatus !== 'In-Use') {
      const dateOpenedColIndex = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf('date_opened') + 1;
      if (dateOpenedColIndex > 0) {
        sheet.getRange(rowIndex, dateOpenedColIndex).setValue(now);
      }
    } else if (new_status === 'Disposed' && currentStatus !== 'Disposed') {
      const dateDisposedColIndex = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf('date_disposed') + 1;
      if (dateDisposedColIndex > 0) {
        sheet.getRange(rowIndex, dateDisposedColIndex).setValue(now);
      }
    }
    
    // Log the status change
    logStatusChange(id_no, currentStatus, new_status, 'system', note);
    
    return { message: 'Status changed successfully' };
  } catch (error) {
    console.error('Error changing status:', error);
    throw error;
  }
}

function updateStandard(data) {
  try {
    const sheet = getSheet('StandardsRegister');
    const standards = getStandards();
    const index = standards.findIndex(s => s.id_no === data.id_no);
    
    if (index === -1) {
      throw new Error('Standard not found');
    }
    
    const rowIndex = index + 2; // +2 because of header and 0-based index
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    headers.forEach((header, colIndex) => {
      if (data[header] !== undefined) {
        sheet.getRange(rowIndex, colIndex + 1).setValue(data[header]);
      }
    });
    
    return { message: 'Standard updated successfully' };
  } catch (error) {
    console.error('Error updating standard:', error);
    throw error;
  }
}

// ========================================
// USER MANAGEMENT FUNCTIONS
// ========================================

function authenticateUser(email, password) {
  try {
    const user = getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    if (!user.is_active) {
      return { success: false, message: 'Account is deactivated' };
    }
    
    // Simple password verification (in production, use proper hashing)
    // For demo purposes, we'll use a simple comparison
    const isValidPassword = verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return { success: false, message: 'Invalid password' };
    }
    
    
    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;
    return { 
      success: true, 
      user: userWithoutPassword,
      message: 'Authentication successful' 
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { success: false, message: 'Authentication failed' };
  }
}

function getUserByEmail(email) {
  try {
    const sheet = getSheet('Users');
    if (!sheet) {
      throw new Error('Users sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailIndex = headers.indexOf('email');
    
    if (emailIndex === -1) {
      throw new Error('Email column not found');
    }
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailIndex] === email) {
        const user = {};
        headers.forEach((header, index) => {
          user[header] = data[i][index];
        });
        return user;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}


function getAllUsers() {
  try {
    const sheet = getSheet('Users');
    if (!sheet) {
      throw new Error('Users sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const users = [];
    
    for (let i = 1; i < data.length; i++) {
      const user = {};
      headers.forEach((header, index) => {
        user[header] = data[i][index];
      });
      // Remove password hash from response
      delete user.password_hash;
      users.push(user);
    }
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

function createUser(userData) {
  try {
    const sheet = getSheet('Users');
    if (!sheet) {
      throw new Error('Users sheet not found');
    }
    
    // Check if user already exists
    const existingUser = getUserByEmail(userData.email);
    if (existingUser) {
      return { success: false, message: 'User already exists' };
    }
    
    // Hash password (simple implementation for demo)
    const hashedPassword = hashPassword(userData.password);
    
    // Prepare user data
    const newUser = {
      email: userData.email,
      password_hash: hashedPassword,
      name: userData.name || userData.email.split('@')[0],
      role: userData.role || 'user',
      permissions: userData.permissions || 'read,write',
      created_at: new Date().toISOString(),
      is_active: userData.is_active !== undefined ? userData.is_active : true,
      phone: userData.phone || ''
    };
    
    // Add to sheet
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const newRow = [];
    
    headers.forEach(header => {
      newRow.push(newUser[header] || '');
    });
    
    sheet.appendRow(newRow);
    
    // Return user without password
    const { password_hash, ...userWithoutPassword } = newUser;
    return { 
      success: true, 
      user: userWithoutPassword,
      message: 'User created successfully' 
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, message: 'Failed to create user' };
  }
}

function updateUser(userData) {
  try {
    const sheet = getSheet('Users');
    if (!sheet) {
      throw new Error('Users sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailIndex = headers.indexOf('email');
    
    if (emailIndex === -1) {
      throw new Error('Email column not found');
    }
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailIndex] === userData.email) {
        // Update user data
        headers.forEach((header, index) => {
          if (userData[header] !== undefined && header !== 'email' && header !== 'password_hash') {
            sheet.getRange(i + 1, index + 1).setValue(userData[header]);
          }
        });
        
        // If password is provided, hash and update it
        if (userData.password) {
          const passwordIndex = headers.indexOf('password_hash');
          if (passwordIndex !== -1) {
            const hashedPassword = hashPassword(userData.password);
            sheet.getRange(i + 1, passwordIndex + 1).setValue(hashedPassword);
          }
        }
        
        return { message: 'User updated successfully' };
      }
    }
    
    throw new Error('User not found');
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

function deleteUser(email) {
  try {
    const sheet = getSheet('Users');
    if (!sheet) {
      throw new Error('Users sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailIndex = headers.indexOf('email');
    
    if (emailIndex === -1) {
      throw new Error('Email column not found');
    }
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailIndex] === email) {
        sheet.deleteRow(i + 1);
        return { message: 'User deleted successfully' };
      }
    }
    
    throw new Error('User not found');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// ========================================
// PASSWORD UTILITY FUNCTIONS
// ========================================

function hashPassword(password) {
  // Simple hash implementation for demo purposes
  // In production, use proper bcrypt or similar
  const salt = 'lifescience_salt_2024';
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, password + salt)
    .map(byte => (byte < 0 ? byte + 256 : byte).toString(16).padStart(2, '0'))
    .join('');
}

function verifyPassword(password, hash) {
  // Simple verification for demo purposes
  const hashedPassword = hashPassword(password);
  return hashedPassword === hash;
}

function logStatusChange(idNo, fromStatus, toStatus, by, note) {
  try {
    const sheet = getSheet('ScanLogs');
    if (!sheet) return;
    
    const logId = `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();
    
    sheet.appendRow([logId, timestamp, idNo, fromStatus, toStatus, by, note]);
  } catch (error) {
    console.error('Error logging status change:', error);
  }
}

// ========================================
// END OF SCRIPT
// ========================================
