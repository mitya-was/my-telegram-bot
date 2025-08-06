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
  
  // Налаштування форми - відповідність колонок (ПРАВИЛЬНА СТРУКТУРА)
  FORM_FIELDS: {
    CONTRACT_NUMBER: 0,     // Колонка A - Номер договору (Генерується)
    CLIENT_NAME: 1,         // Колонка B - Назва компанії замовника
    CLIENT_TAX_TYPE: 2,     // Колонка C - Тип оподаткування замовника
    CLIENT_DIRECTOR: 3,     // Колонка D - ПІБ директора/представника (необов'язкове)
    CLIENT_ADDRESS: 4,      // Колонка E - Адреса замовника
    CLIENT_EDRPOU: 5,       // Колонка F - ЄДРПОУ замовника
    CLIENT_BANK_ACCOUNT: 6, // Колонка G - Банківський рахунок замовника
    CLIENT_BANK_NAME: 7,    // Колонка H - Назва банку замовника
    CLIENT_BANK_MFO: 8,     // Колонка I - МФО банку замовника
    DESCRIPTION: 9,         // Колонка J - Опис послуг
    PERIOD_START: 10,       // Колонка K - Початок періоду розміщення
    PERIOD_END: 11,         // Колонка L - Кінець періоду розміщення
    AMOUNT: 12,             // Колонка M - Загальна сума
    CURRENCY: 13,           // Колонка N - Валюта
    PAYMENT_TERM: 14,       // Колонка O - Термін оплати
    PERFORMER_NAME: 15,     // Колонка P - Назва виконавця (з форми)
    PERFORMER_EDRPOU: 16,   // Колонка Q - ЄДРПОУ виконавця (з вкладки)
    PERFORMER_ADDRESS: 17,  // Колонка R - Адреса виконавця (з вкладки)
    PERFORMER_TYPE: 18,     // Колонка S - Тип організації виконавця (з вкладки)
    PERFORMER_PHONE: 19,    // Колонка T - Телефон виконавця (з вкладки)
    PERFORMER_BANK: 20,     // Колонка U - Банківські виконавця (з вкладки)
    PERFORMER_DIRECTOR: 21, // Колонка V - Керівник виконавця (з вкладки)
    DATE_ADDED: 22          // Колонка W - Дата додавання
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