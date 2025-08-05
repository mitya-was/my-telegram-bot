/**
 * Конфігурація для системи автоматизації договорів
 * Contract Automation System Configuration
 */

const CONFIG = {
    // Google Drive папка для зберігання договорів
    DRIVE_FOLDER_ID: '1uVNZTdCgZAu5q-oc7lAzKvn-FRfkJBx9',

    // ID Google Sheets з даними (форма автоматично створить таблицю)
    SPREADSHEET_ID: '1IG8tGF8g8sulW5snTKt_yUXmscUNUkVOQR9_6UO3vlk', // ID з форми

    // Назви листів в таблиці
    SHEETS: {
        CONTRACTS: 'Form Responses 1', // автоматично створений лист форми
        PERFORMERS: 'Виконавці', // довідник виконавців (потрібно створити)
        SETTINGS: 'Налаштування' // системні налаштування (потрібно створити)
    },

    // Telegram Bot
    TELEGRAM: {
        BOT_TOKEN: '8391553382:AAGhnyEswcHCVvwxwpBzeQIH58vALOpT1HA',
        CHAT_ID: '', // TODO: заповнити ID чату для сповіщень після першого повідомлення
        WEBHOOK_URL: '' // TODO: для webhook'ів (опціонально)
    },

    // Шаблони документів (ID Google Docs)
    TEMPLATES: {
        CONTRACT: '1IEYroQ4MYeEkqmePDUCx1oW0h8IlllGGjEeIyB31dBc',
        INVOICE: '1J7aLxM0M_CwhgI8CFz2DzwR8TOndtEAOD96Gs5bQp_c',
        ACT: '1oR3umTEKv5zNgD5Ujhpk-cQlabio5I1AiP9QBC-AUcQ'
    },

    // URL Google Form для нових договорів
    FORM_URL: 'https://docs.google.com/forms/d/1IG8tGF8g8sulW5snTKt_yUXmscUNUkVOQR9_6UO3vlk/viewform',

    // Формат номеру договору: W-(YY)-XX
    CONTRACT_NUMBER_FORMAT: {
        PREFIX: 'W',
        YEAR_FORMAT: 'YY', // двозначний рік
        SEPARATOR: '-'
    },

    // Структура папок: номер_НазваКлієнта
    FOLDER_NAME_FORMAT: '{contractNumber}_{clientName}',

    // Налаштування форми
    FORM_FIELDS: {
        CLIENT: 'Клієнт',
        ACTIVITY_TYPE: 'Вид діяльності',
        DIRECTOR: 'Директор/Керівник',
        EDRPOU: 'ЄДРПОУ замовника',
        DESCRIPTION: 'Опис',
        AMOUNT: 'Вартість',
        PERFORMER: 'Виконавець'
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

// Експорт для використання в інших файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}