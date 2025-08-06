/**
 * АВТОМАТИЧЕСКОЕ ОПРЕДЕЛЕНИЕ СТРУКТУРЫ ФОРМЫ
 * на основе реальных данных из CSV
 */

/**
 * Анализ реальной структуры данных и создание правильной конфигурации
 */
function analyzeRealFormStructure() {
  Logger.log('=== АНАЛІЗ РЕАЛЬНОЇ СТРУКТУРИ ФОРМИ ===');
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      Logger.log('❌ Немає даних для аналізу');
      return null;
    }
    
    // Получаем заголовки и данные
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dataRow = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    Logger.log('Заголовки:', headers);
    Logger.log('Дані з другого рядка:', dataRow);
    
    // Анализируем где начинаются реальные данные
    let realDataStart = -1;
    let foundFields = {};
    
    for (let i = 0; i < dataRow.length; i++) {
      const value = dataRow[i];
      const header = headers[i];
      
      if (value && value.toString().trim() !== '') {
        if (realDataStart === -1) {
          realDataStart = i;
          Logger.log(`Реальні дані починаються з колонки ${String.fromCharCode(65 + i)} (індекс ${i})`);
        }
        
        // Пытаемся определить тип поля по значению
        const valueStr = value.toString().toLowerCase();
        
        if (valueStr.includes('тов') || valueStr.includes('фоп') || valueStr.includes('пп')) {
          foundFields.clientTaxType = i;
        } else if (/^\d{8,10}$/.test(valueStr)) {
          foundFields.clientEdrpou = i;
        } else if (/^\d+$/.test(valueStr) && valueStr.length >= 3) {
          if (!foundFields.amount) foundFields.amount = i;
        } else if (valueStr === 'грн' || valueStr === 'usd' || valueStr === 'eur') {
          foundFields.currency = i;
        }
        
        Logger.log(`Колонка ${String.fromCharCode(65 + i)} (${i}): "${header}" = "${value}"`);
      }
    }
    
    // Создаем предполагаемую структуру на основе анализа
    const suggestedMapping = {
      timestamp: 1, // Обычно timestamp в колонке B
      realDataStart: realDataStart,
      foundFields: foundFields
    };
    
    // Отправляем результат в Telegram
    let message = '🔍 АНАЛІЗ СТРУКТУРИ ФОРМИ:\n\n';
    message += `📊 Всього колонок: ${headers.length}\n`;
    message += `🎯 Реальні дані починаються з колонки: ${String.fromCharCode(65 + realDataStart)} (індекс ${realDataStart})\n\n`;
    
    message += '📋 ЗНАЙДЕНІ ПОЛЯ:\n';
    for (const [field, index] of Object.entries(foundFields)) {
      message += `• ${field}: колонка ${String.fromCharCode(65 + index)} (${index}) = "${dataRow[index]}"\n`;
    }
    
    message += '\n🔧 Потрібно оновити конфігурацію!';
    
    sendQuickTelegramMessage(message);
    
    return suggestedMapping;
    
  } catch (error) {
    Logger.log('❌ Помилка аналізу:', error.toString());
    sendQuickTelegramMessage(`❌ Помилка аналізу структури:\n${error.toString()}`);
    return null;
  }
}

/**
 * Генерация правильной конфигурации на основе анализа
 */
function generateCorrectConfig() {
  Logger.log('=== ГЕНЕРАЦІЯ ПРАВИЛЬНОЇ КОНФІГУРАЦІЇ ===');
  
  const analysis = analyzeRealFormStructure();
  if (!analysis) return;
  
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const dataRow = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // На основе реального CSV создаем правильную конфигурацию
  let configCode = `
// АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННАЯ КОНФИГУРАЦИЯ
const CONFIG_CORRECTED = {
  // ... остальные настройки ...
  
  FORM_FIELDS: {`;
  
  let fieldIndex = analysis.realDataStart;
  const fieldNames = [
    'CLIENT_NAME',
    'CLIENT_TAX_TYPE', 
    'CLIENT_DIRECTOR',
    'CLIENT_ADDRESS',
    'CLIENT_EDRPOU',
    'CLIENT_BANK_ACCOUNT',
    'CLIENT_BANK_NAME',
    'CLIENT_BANK_MFO',
    'DESCRIPTION',
    'PERIOD_START',
    'PERIOD_END',
    'AMOUNT',
    'CURRENCY',
    'PAYMENT_TERM',
    'PERFORMER_NAME'
  ];
  
  for (let i = 0; i < fieldNames.length && (fieldIndex + i) < dataRow.length; i++) {
    const currentIndex = fieldIndex + i;
    const value = dataRow[currentIndex];
    const fieldName = fieldNames[i];
    
    configCode += `
    ${fieldName}: ${currentIndex}, // ${String.fromCharCode(65 + currentIndex)} - "${value}"`;
  }
  
  configCode += `
  }
};

// ПРАВИЛЬНАЯ ФУНКЦИЯ ПАРСИНГА
function parseFormDataCorrected(e) {
  if (!e || !e.values) return {};
  
  const values = e.values;
  
  return {
    timestamp: values[1] || new Date(),`;
  
  for (let i = 0; i < fieldNames.length && (fieldIndex + i) < dataRow.length; i++) {
    const currentIndex = fieldIndex + i;
    const fieldName = fieldNames[i].toLowerCase().replace('client_', 'client').replace('_', '');
    
    if (fieldName === 'clientname') configCode += `
    clientName: values[${currentIndex}] || '',`;
    else if (fieldName === 'amount') configCode += `
    amount: values[${currentIndex}] || '',`;
    else if (fieldName === 'performername') configCode += `
    performer: values[${currentIndex}] || '',`;
  }
  
  configCode += `
  };
}`;
  
  Logger.log('ЗГЕНЕРОВАНИЙ КОД КОНФІГУРАЦІЇ:');
  Logger.log(configCode);
  
  sendQuickTelegramMessage('🔧 Згенеровано правильну конфігурацію! Перевірте логи Google Apps Script.');
  
  return configCode;
}

/**
 * Быстрое исправление конфигурации на основе CSV данных
 */
function quickFixConfig() {
  Logger.log('=== ШВИДКЕ ВИПРАВЛЕННЯ КОНФІГУРАЦІЇ ===');
  
  // На основе анализа CSV файла создаем исправленную конфигурацию
  const FIXED_FORM_FIELDS = {
    TIMESTAMP: 1,           // B - 06.08.2025 21:34:53
    CLIENT_NAME: 16,        // Q - мокко
    CLIENT_TAX_TYPE: 17,    // R - ТОВ
    CLIENT_DIRECTOR: 18,    // S - Петя
    CLIENT_ADDRESS: 19,     // T - оимлоук
    CLIENT_EDRPOU: 20,      // U - 324234
    CLIENT_BANK_ACCOUNT: 21,// V - ваимуек
    CLIENT_BANK_NAME: 22,   // W - уцкм5ук
    CLIENT_BANK_MFO: 23,    // X - 23432
    DESCRIPTION: 24,        // Y - емуцки
    PERIOD_START: 27,       // BB - 10.10.2025 (возможно период)
    PERIOD_END: 28,         // CC - 11.11.2026 (возможно период)
    AMOUNT: 29,             // DD - 12444 (возможно сумма)
    CURRENCY: 30,           // EE - грн
    PAYMENT_TERM: 31,       // FF - 10.02.2025 (возможно термин)
    PERFORMER_NAME: 32      // GG - Web Studio Pro
  };
  
  // Обновляем глобальную конфигурацию
  CONFIG.FORM_FIELDS = FIXED_FORM_FIELDS;
  
  Logger.log('✅ Конфігурацію виправлено');
  sendQuickTelegramMessage('✅ Конфігурацію швидко виправлено! Тепер можна тестувати.');
  
  return FIXED_FORM_FIELDS;
}

/**
 * Тест исправленной конфигурации
 */
function testCorrectedConfig() {
  Logger.log('=== ТЕСТ ВИПРАВЛЕНОЇ КОНФІГУРАЦІЇ ===');
  
  // Применяем исправления
  quickFixConfig();
  
  // Тестируем с реальными данными
  const mockEvent = {
    values: [
      '', // A
      '06.08.2025 21:34:53', // B - timestamp
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', // C-P пустые
      'мокко', // Q (16) - CLIENT_NAME
      'ТОВ', // R (17) - CLIENT_TAX_TYPE
      'Петя', // S (18) - CLIENT_DIRECTOR
      'оимлоук', // T (19) - CLIENT_ADDRESS
      '324234', // U (20) - CLIENT_EDRPOU
      'ваимуек', // V (21) - CLIENT_BANK_ACCOUNT
      'уцкм5ук', // W (22) - CLIENT_BANK_NAME
      '23432', // X (23) - CLIENT_BANK_MFO
      'емуцки', // Y (24) - DESCRIPTION
      '', '', // Z, AA пустые
      '10.10.2025', // BB (27) - PERIOD_START
      '11.11.2026', // CC (28) - PERIOD_END
      '12444', // DD (29) - AMOUNT
      'грн', // EE (30) - CURRENCY
      '10.02.2025', // FF (31) - PAYMENT_TERM
      'Web Studio Pro' // GG (32) - PERFORMER_NAME
    ]
  };
  
  const result = parseFormData(mockEvent);
  
  Logger.log('=== РЕЗУЛЬТАТ ТЕСТУВАННЯ ===');
  Logger.log('Клієнт:', result.clientName);
  Logger.log('Сума:', result.amount);
  Logger.log('Виконавець:', result.performer);
  
  const success = result.clientName && result.amount && result.performer;
  
  let message = `🧪 ТЕСТ ВИПРАВЛЕНОЇ КОНФІГУРАЦІЇ:\n\n`;
  message += `Клієнт: "${result.clientName || 'ПУСТО'}"\n`;
  message += `Сума: "${result.amount || 'ПУСТО'}"\n`;
  message += `Виконавець: "${result.performer || 'ПУСТО'}"\n\n`;
  message += success ? '✅ ТЕСТ ПРОЙШОВ!' : '❌ ТЕСТ НЕ ПРОЙШОВ!';
  
  sendQuickTelegramMessage(message);
  
  return success;
}