/**
 * Функція для діагностики даних форми
 */

/**
 * Перевірка останніх даних з таблиці
 */
function debugLastFormData() {
  Logger.log('=== ДІАГНОСТИКА ДАНИХ ФОРМИ ===');
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
    
    if (!sheet) {
      Logger.log('❌ Таблиця не знайдена!');
      return;
    }
    
    const lastRow = sheet.getLastRow();
    Logger.log('Останній рядок:', lastRow);
    
    if (lastRow <= 1) {
      Logger.log('❌ Немає даних в таблиці');
      return;
    }
    
    // Отримуємо заголовки
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log('Заголовки таблиці:', headers);
    
    // Отримуємо останній рядок даних
    const lastRowData = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log('Останні дані:', lastRowData);
    
    // Показуємо відповідність
    Logger.log('=== ВІДПОВІДНІСТЬ ЗАГОЛОВКІВ ТА ДАНИХ ===');
    for (let i = 0; i < headers.length; i++) {
      Logger.log(`Колонка ${i}: "${headers[i]}" = "${lastRowData[i]}"`);
    }
    
    // Відправляємо в Telegram для зручності
    let message = '🔍 ДІАГНОСТИКА ФОРМИ:\n\n';
    message += `📊 Заголовки: ${headers.length} колонок\n`;
    message += `📝 Останній рядок: ${lastRow}\n\n`;
    
    message += '📋 СТРУКТУРА ТАБЛИЦІ:\n';
    for (let i = 0; i < Math.min(headers.length, 10); i++) {
      message += `${i}: "${headers[i]}" = "${lastRowData[i] || 'пусто'}"\n`;
    }
    
    sendQuickTelegramMessage(message);
    
    return {
      headers: headers,
      lastRowData: lastRowData
    };
    
  } catch (error) {
    Logger.log('❌ Помилка діагностики:', error.toString());
    sendQuickTelegramMessage(`❌ Помилка діагностики форми:\n${error.toString()}`);
  }
}

/**
 * Симуляція обробки форми з реальними даними
 */
function simulateFormSubmissionWithRealData() {
  Logger.log('=== СИМУЛЯЦІЯ ОБРОБКИ ФОРМИ ===');
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      Logger.log('❌ Немає даних для симуляції');
      return;
    }
    
    // Отримуємо останні дані
    const values = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Створюємо mock event
    const mockEvent = {
      values: values
    };
    
    Logger.log('Симулюємо onFormSubmit з даними:', values);
    
    // Викликаємо функцію обробки
    onFormSubmit(mockEvent);
    
  } catch (error) {
    Logger.log('❌ Помилка симуляції:', error.toString());
    sendQuickTelegramMessage(`❌ Помилка симуляції:\n${error.toString()}`);
  }
}

/**
 * Створення правильної функції парсингу на основі реальних заголовків
 */
function generateCorrectParseFunction() {
  Logger.log('=== ГЕНЕРАЦІЯ ПРАВИЛЬНОЇ ФУНКЦІЇ ПАРСИНГУ ===');
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    Logger.log('Поточні заголовки:', headers);
    
    // Знаходимо індекси потрібних полів
    const fieldMapping = {};
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase();
      
      if (header.includes('клієнт') || header.includes('client')) {
        fieldMapping.client = i;
      } else if (header.includes('сума') || header.includes('вартість') || header.includes('amount')) {
        fieldMapping.amount = i;
      } else if (header.includes('діяльність') || header.includes('activity')) {
        fieldMapping.activityType = i;
      } else if (header.includes('директор') || header.includes('керівник') || header.includes('director')) {
        fieldMapping.director = i;
      } else if (header.includes('єдрпоу') || header.includes('edrpou')) {
        fieldMapping.edrpou = i;
      } else if (header.includes('опис') || header.includes('description')) {
        fieldMapping.description = i;
      } else if (header.includes('виконавець') || header.includes('performer')) {
        fieldMapping.performer = i;
      } else if (header.includes('timestamp') || header.includes('час')) {
        fieldMapping.timestamp = i;
      }
    }
    
    Logger.log('Знайдені відповідності:', fieldMapping);
    
    // Генеруємо код нової функції
    let newParseCode = `
// АВТОМАТИЧНО ЗГЕНЕРОВАНА ФУНКЦІЯ ПАРСИНГУ
function parseFormData(e) {
  Logger.log('=== ПАРСИНГ ДАНИХ ФОРМИ (ОНОВЛЕНИЙ) ===');
  
  if (!e || !e.values) {
    Logger.log('❌ Немає e.values');
    return {};
  }
  
  const values = e.values;
  Logger.log('Кількість значень:', values.length);
  Logger.log('Всі значення:', JSON.stringify(values));
  
  const result = {
    timestamp: values[${fieldMapping.timestamp || 0}] || new Date(),
    client: values[${fieldMapping.client || 1}] || '',
    activityType: values[${fieldMapping.activityType || 2}] || '',
    director: values[${fieldMapping.director || 3}] || '',
    edrpou: values[${fieldMapping.edrpou || 4}] || '',
    description: values[${fieldMapping.description || 5}] || '',
    amount: values[${fieldMapping.amount || 6}] || '',
    performer: values[${fieldMapping.performer || 7}] || ''
  };
  
  Logger.log('Результат парсингу:', JSON.stringify(result));
  return result;
}`;
    
    Logger.log('НОВИЙ КОД ФУНКЦІЇ ПАРСИНГУ:');
    Logger.log(newParseCode);
    
    sendQuickTelegramMessage(`🔧 ЗГЕНЕРОВАНО НОВУ ФУНКЦІЮ ПАРСИНГУ:\n\nЗнайдені поля:\n${JSON.stringify(fieldMapping, null, 2)}\n\nСкопіюйте новий код з логів Google Apps Script!`);
    
    return {
      fieldMapping: fieldMapping,
      newParseCode: newParseCode
    };
    
  } catch (error) {
    Logger.log('❌ Помилка генерації:', error.toString());
    sendQuickTelegramMessage(`❌ Помилка генерації:\n${error.toString()}`);
  }
}