/**
 * ИСПРАВЛЕННАЯ КОНФИГУРАЦИЯ на основе реальных данных из CSV
 */

const CONFIG_FIXED = {
  // ... остальные настройки остаются такими же ...
  SPREADSHEET_ID: '1-n7KjvKhLQQXsxdMlJCKOTYBUjxzKqPaYJDwJbfnv4',
  DRIVE_FOLDER_ID: '1Y3idhIPTMY3BVgbneUs3USt-FgRjj0L9',
  FORM_ID: '1L4_WKxW8FjHV7tGwXhJCLzBLLdCQiMUvP6LRQV7zN8k',
  
  TELEGRAM: {
    BOT_TOKEN: '7371932063:AAGmg5RMPTgJU8zl3wC-qW8X2p9gD0rXCH8',
    CHAT_ID: '-4586871556'
  },
  
  TEMPLATES: {
    CONTRACT: '1tU-sJ0GOW3q0A1a0Iq5VlVgPkH8p1vtcEAgELFOnjWs',
    ACT: '1example_act_template_id',
    INVOICE: '1example_invoice_template_id'
  },
  
  SHEETS: {
    CONTRACTS: 'Form Responses 1',
    PERFORMERS: 'Виконавці'
  },
  
  // ИСПРАВЛЕННАЯ СТРУКТУРА на основе реального CSV
  FORM_FIELDS: {
    // Данные из формы начинаются с колонки Q (индекс 16)
    TIMESTAMP: 1,               // B - Timestamp (06.08.2025 21:34:53)
    CLIENT_NAME: 16,            // Q - мокко (реальное название компании)
    CLIENT_TAX_TYPE: 17,        // R - ТОВ (тип оподаткування)
    CLIENT_DIRECTOR: 18,        // S - Петя (директор)
    CLIENT_ADDRESS: 19,         // T - оимлоук (адреса)
    CLIENT_EDRPOU: 20,          // U - 324234 (ЄДРПОУ)
    CLIENT_BANK_ACCOUNT: 21,    // V - ваимуек (банківський рахунок)
    CLIENT_BANK_NAME: 22,       // W - уцкм5ук (назва банку)
    CLIENT_BANK_MFO: 23,        // X - 23432 (МФО)
    DESCRIPTION: 24,            // Y - емуцки (опис послуг)
    PERIOD_START: 25,           // Z - пустое (початок періоду)
    PERIOD_END: 26,             // AA - пустое (кінець періоду)
    AMOUNT: 27,                 // BB - 10.10.2025 (НЕ СУМА! ОШИБКА В ДАННЫХ)
    CURRENCY: 28,               // CC - 11.11.2026 (НЕ ВАЛЮТА! ОШИБКА В ДАННЫХ)
    PAYMENT_TERM: 29,           // DD - 12444 (НЕ ТЕРМІН! ОШИБКА В ДАННЫХ)
    PERFORMER_NAME: 30,         // EE - грн (НЕ ВИКОНАВЕЦЬ! ОШИБКА В ДАННЫХ)
    
    // Правильные данные из второй строки:
    // CLIENT_NAME: "мокко"
    // CLIENT_TAX_TYPE: "ТОВ" 
    // CLIENT_DIRECTOR: "Петя"
    // CLIENT_ADDRESS: "оимлоук"
    // CLIENT_EDRPOU: "324234"
    // CLIENT_BANK_ACCOUNT: "ваимуек"
    // CLIENT_BANK_NAME: "уцкм5ук"
    // CLIENT_BANK_MFO: "23432"
    // DESCRIPTION: "емуцки"
    // PERIOD_START: "" (пустое)
    // PERIOD_END: "" (пустое)
    // AMOUNT: "10.10.2025" (ОШИБКА - это не сумма!)
    // CURRENCY: "11.11.2026" (ОШИБКА - это не валюта!)
    // PAYMENT_TERM: "12444" (возможно это сумма?)
    // PERFORMER_NAME: "грн" (ОШИБКА - это не исполнитель!)
  },
  
  CONTRACT_STATUS: {
    DRAFT: 'Чернетка',
    ACTIVE: 'Активний',
    COMPLETED: 'Завершений',
    CANCELLED: 'Скасований'
  }
};

/**
 * ПРАВИЛЬНАЯ ФУНКЦИЯ ПАРСИНГА на основе реальных данных
 */
function parseFormDataFixed(e) {
  Logger.log('=== ПАРСИНГ ДАНИХ ФОРМИ (ВИПРАВЛЕНО) ===');
  
  if (!e || !e.values) {
    Logger.log('❌ Немає e.values');
    return {};
  }
  
  const values = e.values;
  Logger.log('Кількість значень:', values.length);
  Logger.log('Всі значення:', JSON.stringify(values));
  
  // Анализ реальных данных из CSV:
  // values[1] = "06.08.2025 21:34:53" (timestamp)
  // values[16] = "мокко" (название компании)
  // values[17] = "ТОВ" (тип налогообложения)
  // values[18] = "Петя" (директор)
  // ... и так далее
  
  const result = {
    timestamp: values[1] || new Date(),
    clientName: values[16] || '',           // Q - мокко
    clientTaxType: values[17] || '',        // R - ТОВ
    clientDirector: values[18] || '',       // S - Петя
    clientAddress: values[19] || '',        // T - оимлоук
    clientEdrpou: values[20] || '',         // U - 324234
    clientBankAccount: values[21] || '',    // V - ваимуек
    clientBankName: values[22] || '',       // W - уцкм5ук
    clientBankMfo: values[23] || '',        // X - 23432
    description: values[24] || '',          // Y - емуцки
    periodStart: values[25] || '',          // Z - пустое
    periodEnd: values[26] || '',            // AA - пустое
    amount: values[29] || '',               // DD - 12444 (возможно это сумма)
    currency: values[30] || 'грн',          // EE - грн (возможно это валюта)
    paymentTerm: values[31] || '',          // FF - пустое
    performer: values[32] || ''             // GG - пустое или "Web Studio Pro"
  };
  
  Logger.log('Результат парсингу (виправлено):', JSON.stringify(result));
  return result;
}

/**
 * Тест исправленного парсинга
 */
function testFixedParsing() {
  // Симулируем реальные данные из CSV
  const mockEvent = {
    values: [
      '', // A - Номер договору
      '06.08.2025 21:34:53', // B - Timestamp
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', // C-P пустые
      'мокко', // Q - Название компании
      'ТОВ', // R - Тип налогообложения
      'Петя', // S - Директор
      'оимлоук', // T - Адрес
      '324234', // U - ЄДРПОУ
      'ваимуек', // V - Банковский счет
      'уцкм5ук', // W - Название банка
      '23432', // X - МФО
      'емуцки', // Y - Описание услуг
      '', // Z - Начало периода
      '', // AA - Конец периода
      '10.10.2025', // BB - (ошибочно в поле суммы)
      '11.11.2026', // CC - (ошибочно в поле валюты)
      '12444', // DD - возможно это сумма
      'грн', // EE - возможно это валюта
      '10.02.2025', // FF - возможно термин оплаты
      'Web Studio Pro' // GG - исполнитель
    ]
  };
  
  const result = parseFormDataFixed(mockEvent);
  
  Logger.log('=== РЕЗУЛЬТАТ ТЕСТУВАННЯ ===');
  Logger.log('Клієнт:', result.clientName); // должно быть "мокко"
  Logger.log('Сума:', result.amount); // должно быть "12444"
  Logger.log('Виконавець:', result.performer); // должно быть "Web Studio Pro"
  
  sendQuickTelegramMessage(`🧪 ТЕСТ ВИПРАВЛЕНОГО ПАРСИНГУ:\n\nКлієнт: "${result.clientName}"\nСума: "${result.amount}"\nВиконавець: "${result.performer}"`);
  
  return result;
}