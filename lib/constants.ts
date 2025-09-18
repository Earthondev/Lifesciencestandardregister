// Application Constants
export const APP_CONFIG = {
  NAME: 'Life Science Standards Register',
  VERSION: '1.0.0',
  TIMEZONE: 'Asia/Bangkok',
  ID_PREFIX: 'LS',
  FUZZY_THRESHOLD: 0.82,
  FUZZY_MAX_RESULTS: 5,
  ITEMS_PER_PAGE: 20,
  AUTO_REFRESH_INTERVAL: 300000, // 5 minutes
  SESSION_TIMEOUT: 3600000, // 1 hour
} as const

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: '/exec?action=health',
  STATS: '/exec?action=getStats',
  STANDARDS: '/exec?action=getStandards',
  STANDARD_BY_ID: '/exec?action=getStandardById',
  STATUS_LOG: '/exec?action=getStatusLog',
  ID_MASTER: '/exec?action=getIDMaster',
  RECENT_ACTIVITY: '/exec?action=getRecentActivity',
  SIMILAR_NAMES: '/exec?action=findSimilarNames',
  CAS_LOOKUP: '/exec?action=lookupCAS',
  CONFIG: '/exec?action=getConfig',
  HOLIDAYS: '/exec?action=getHolidays',
  EXPORT: '/exec?action=exportData',
  REGISTER: '/exec?action=registerStandard',
  UPDATE: '/exec?action=updateStandard',
  CHANGE_STATUS: '/exec?action=changeStatus',
  ADD_ID_MASTER: '/exec?action=addToIDMaster',
  UPDATE_CONFIG: '/exec?action=updateConfig',
  LINE_NOTIFY: '/exec?action=sendLineNotification',
} as const

// Status Types
export const STATUS_TYPES = {
  UNOPENED: 'Unopened',
  IN_USE: 'In-Use',
  DISPOSED: 'Disposed',
} as const

export type StatusType = typeof STATUS_TYPES[keyof typeof STATUS_TYPES]

// Material Types
export const MATERIAL_TYPES = {
  CRM: 'CRM (Certified Reference Material)',
  SRM: 'SRM (Standard Reference Material)',
  RM: 'RM (Reference Material)',
  WORKING_STANDARD: 'Working Standard',
  OTHER: 'Other',
} as const

// Storage Conditions
export const STORAGE_CONDITIONS = {
  ROOM_TEMP: 'Room Temperature',
  REFRIGERATED: 'Refrigerated (2-8°C)',
  FROZEN: 'Frozen (-20°C)',
  DEEP_FREEZE: 'Deep Freeze (-80°C)',
  DESICCATOR: 'Desiccator',
  OTHER: 'Other',
} as const

// Concentration Units
export const CONCENTRATION_UNITS = {
  MG_KG: 'mg/kg',
  UG_KG: 'μg/kg',
  MG_L: 'mg/L',
  UG_L: 'μg/L',
  PPM: 'ppm',
  PPB: 'ppb',
  PERCENT: '%',
  OTHER: 'Other',
} as const

// Packing Units
export const PACKING_UNITS = {
  GRAM: 'g',
  MILLIGRAM: 'mg',
  LITER: 'L',
  MILLILITER: 'mL',
  VIAL: 'vial',
  BOTTLE: 'bottle',
  AMPOULE: 'ampoule',
  OTHER: 'Other',
} as const

// Test Groups
export const TEST_GROUPS = [
  'Pesticides',
  'Heavy Metals',
  'Vitamins',
  'Minerals',
  'Antibiotics',
  'Mycotoxins',
  'Food Additives',
  'Environmental Contaminants',
  'Other',
] as const

// Holiday Types
export const HOLIDAY_TYPES = {
  NATIONAL: 'national',
  COMPANY: 'company',
  LAB: 'lab',
} as const

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const

// LINE Notification Types
export const LINE_NOTIFICATION_TYPES = {
  EXPIRY_WARNING: 'expiry_warning',
  LOW_STOCK: 'low_stock',
  STATUS_CHANGE: 'status_change',
  NEW_STANDARD: 'new_standard',
} as const

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer',
} as const

// Table Columns for Standards Register
export const STANDARDS_TABLE_COLUMNS = [
  { key: 'id_no', label: 'รหัส', sortable: true, width: '120px' },
  { key: 'name', label: 'ชื่อสารมาตรฐาน', sortable: true, width: '200px' },
  { key: 'status', label: 'สถานะ', sortable: true, width: '100px' },
  { key: 'manufacturer', label: 'ผู้ผลิต', sortable: true, width: '150px' },
  { key: 'cas', label: 'CAS', sortable: false, width: '120px' },
  { key: 'lot', label: 'Lot', sortable: false, width: '100px' },
  { key: 'date_received', label: 'วันที่รับ', sortable: true, width: '120px' },
  { key: 'lab_expiry_date', label: 'หมดอายุ', sortable: true, width: '120px' },
  { key: 'available_qty', label: 'คงเหลือ', sortable: true, width: '100px' },
] as const

// Form Validation Rules
export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 200,
  CAS_PATTERN: /^\d{2,7}-\d{2}-\d$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CONCENTRATION_MIN: 0,
  CONCENTRATION_MAX: 999999,
  PACKING_SIZE_MIN: 0,
  PACKING_SIZE_MAX: 999999,
} as const

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'กรุณากรอกข้อมูลในช่องนี้',
  INVALID_EMAIL: 'รูปแบบอีเมลไม่ถูกต้อง',
  INVALID_CAS: 'รูปแบบเลข CAS ไม่ถูกต้อง',
  INVALID_DATE: 'รูปแบบวันที่ไม่ถูกต้อง',
  NAME_TOO_SHORT: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร',
  NAME_TOO_LONG: 'ชื่อต้องไม่เกิน 200 ตัวอักษร',
  CONCENTRATION_INVALID: 'ความเข้มข้นต้องเป็นตัวเลขที่มากกว่า 0',
  PACKING_SIZE_INVALID: 'ขนาดบรรจุต้องเป็นตัวเลขที่มากกว่า 0',
  NETWORK_ERROR: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย',
  UNAUTHORIZED: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
  NOT_FOUND: 'ไม่พบข้อมูลที่ต้องการ',
  SERVER_ERROR: 'เกิดข้อผิดพลาดในระบบ',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  STANDARD_REGISTERED: 'ลงทะเบียนสารมาตรฐานสำเร็จ',
  STATUS_CHANGED: 'เปลี่ยนสถานะสำเร็จ',
  DATA_UPDATED: 'อัปเดตข้อมูลสำเร็จ',
  DATA_EXPORTED: 'ส่งออกข้อมูลสำเร็จ',
  CONFIG_UPDATED: 'อัปเดตการตั้งค่าสำเร็จ',
  LINE_NOTIFICATION_SENT: 'ส่งการแจ้งเตือนผ่าน LINE สำเร็จ',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  IS_LOGGED_IN: 'isLoggedIn',
  USER_EMAIL: 'userEmail',
  AUTH_PROVIDER: 'authProvider',
  REMEMBER_ME: 'rememberMe',
  THEME: 'theme',
  LANGUAGE: 'language',
  LAST_SYNC: 'lastSync',
} as const

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  THAI: 'dd MMMM yyyy',
  API: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const

// Export Formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const
