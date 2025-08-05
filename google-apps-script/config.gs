/**
 * Конфігурація для Google Apps Script
 * Configuration for Google Apps Script
 */

const CONFIG = {
  // Google Drive папка для зберігання договорів
  DRIVE_FOLDER_ID: '1uVNZTdCgZAu5q-oc7lAzKvn-FRfkJBx9',
  
  // ID Google Form
  FORM_ID: '1Jy7STz5k4y2tUJ-BG0OIGlP72BWNaeY8HHx8kHc31Qs',
  
  // ID Google Sheets з даними (таблиця відповідей)
  SPREADSHEET_ID: '1IG8tGF8g8sulW5snTKt_yUXmscUNUkVOQR9_6UO3vlk',
  
  // Назви листів в таблиці
  SHEETS: {
    CONTRACTS: 'Form Responses 1', // автоматично створений лист форми
    PERFORMERS: 'Виконавці', // довідник виконавців
    SETTINGS: 'Налаштування' // системні налаштування
  },
  
  // Telegram Bot
  TELEGRAM: {
    BOT_TOKEN: '8391553382:AAGhnyEswcHCVvwxwpBzeQIH58vALOpT1HA',
    CHAT_ID: '156212174', // Ваш Chat ID
    WEBHOOK_URL: ''
  },
  
  // Шаблони документів (ID Google Docs)
  TEMPLATES: {
    CONTRACT: '1IEYroQ4MYeEkqmePDUCx1oW0h8IlllGGjEeIyB31dBc',
    INVOICE: '1J7aLxM0M_CwhgI8CFz2DzwR8TOndtEAOD96Gs5bQp_c',
    ACT: '1oR3umTEKv5zNgD5Ujhpk-cQlabio5I1AiP9QBC-AUcQ'
  },
  
  // URL форми
  FORM_URL: 'https://docs.google.com/forms/d/1Jy7STz5k4y2tUJ-BG0OIGlP72BWNaeY8HHx8kHc31Qs/viewform',
  
  // Формат номеру договору: W-(YY)-XX
  CONTRACT_NUMBER_FORMAT: {
    PREFIX: 'W',
    YEAR_FORMAT: 'YY', // двозначний рік
    SEPARATOR: '-'
  },
  
  // Структура папок: номер_НазваКлієнта
  FOLDER_NAME_FORMAT: '{contractNumber}_{clientName}',
  
  // Налаштування форми - відповідність колонок
  FORM_FIELDS: {
    TIMESTAMP: 0,      // Колонка A - Timestamp
    CLIENT: 1,         // Колонка B - Клієнт
    ACTIVITY_TYPE: 2,  // Колонка C - Вид діяльності
    DIRECTOR: 3,       // Колонка D - Директор/Керівник
    EDRPOU: 4,         // Колонка E - ЄДРПОУ замовника
    DESCRIPTION: 5,    // Колонка F - Опис
    AMOUNT: 6,         // Колонка G - Вартість
    PERFORMER: 7       // Колонка H - Виконавець
  },
  
  // Статуси договорів
  CONTRACT_STATUS: {
    DRAFT: 'Чернетка',
    ACTIVE: 'Активний',
    COMPLETED: 'Виконаний',
    CANCELLED: 'Скасований'
  },
  
  // Типи документів
  DOCUMENT_TYPES: {
    CONTRACT: 'Договір',
    INVOICE: 'Рахунок',
    ACT: 'Акт виконаних робіт'
  }
};