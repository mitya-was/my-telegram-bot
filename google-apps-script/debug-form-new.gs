/**
 * ОТЛАДОЧНЫЕ ФУНКЦИИ ДЛЯ НОВОЙ СТРУКТУРЫ ФОРМЫ
 * Используйте эти функции для диагностики проблем с формой
 */

/**
 * Диагностика последних данных из таблицы (НОВАЯ СТРУКТУРА)
 */
function debugLastFormDataNew() {
  Logger.log('=== ДІАГНОСТИКА ДАНИХ ФОРМИ (НОВА СТРУКТУРА) ===');
  
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
    
    // Показуємо відповідність з новою структурою
    Logger.log('=== ВІДПОВІДНІСТЬ ЗАГОЛОВКІВ ТА ДАНИХ (НОВА СТРУКТУРА) ===');
    
    const expectedStructure = [
      'A: Номер договору (генерується)',
      'B: Назва компанії замовника',
      'C: Тип оподаткування замовника', 
      'D: ПІБ директора/представника',
      'E: Адреса замовника',
      'F: ЄДРПОУ замовника',
      'G: Банківський рахунок замовника',
      'H: Назва банку замовника',
      'I: МФО банку замовника',
      'J: Опис послуг',
      'K: Початок періоду розміщення',
      'L: Кінець періоду розміщення',
      'M: Загальна сума',
      'N: Валюта',
      'O: Термін оплати',
      'P: Назва виконавця',
      'Q: ЄДРПОУ виконавця (з довідника)',
      'R: Адреса виконавця (з довідника)',
      'S: Тип організації виконавця (з довідника)',
      'T: Телефон виконавця (з довідника)',
      'U: Банківські виконавця (з довідника)',
      'V: Керівник виконавця (з довідника)',
      'W: Дата додавання'
    ];
    
    for (let i = 0; i < Math.max(headers.length, expectedStructure.length); i++) {
      const actual = headers[i] || 'ВІДСУТНЄ';
      const expected = expectedStructure[i] || 'НЕ ОЧІКУЄТЬСЯ';
      const data = lastRowData[i] || 'пусто';
      
      Logger.log(`${String.fromCharCode(65 + i)}: "${actual}" | Очікується: "${expected}" | Дані: "${data}"`);
    }
    
    // Перевіряємо ключові поля
    Logger.log('=== ПЕРЕВІРКА КЛЮЧОВИХ ПОЛІВ ===');
    const clientName = lastRowData[1]; // B - Назва компанії
    const amount = lastRowData[12];     // M - Загальна сума  
    const performer = lastRowData[15];  // P - Назва виконавця
    
    Logger.log(`Назва компанії (B): "${clientName}"`);
    Logger.log(`Загальна сума (M): "${amount}"`);
    Logger.log(`Виконавець (P): "${performer}"`);
    
    // Відправляємо в Telegram
    let message = '🔍 ДІАГНОСТИКА ФОРМИ (НОВА СТРУКТУРА):\n\n';
    message += `📊 Колонок: ${headers.length}, Рядків: ${lastRow}\n\n`;
    message += `🔑 КЛЮЧОВІ ПОЛЯ:\n`;
    message += `• Компанія (B): "${clientName || 'ПУСТО'}"\n`;
    message += `• Сума (M): "${amount || 'ПУСТО'}"\n`;
    message += `• Виконавець (P): "${performer || 'ПУСТО'}"\n\n`;
    
    if (!clientName || !amount || !performer) {
      message += `❌ ПРОБЛЕМА: Не всі ключові поля заповнені!\n\n`;
    } else {
      message += `✅ Всі ключові поля заповнені\n\n`;
    }
    
    message += `📋 ПЕРШІ 10 КОЛОНОК:\n`;
    for (let i = 0; i < Math.min(10, headers.length); i++) {
      const letter = String.fromCharCode(65 + i);
      message += `${letter}: "${headers[i]}" = "${lastRowData[i] || 'пусто'}"\n`;
    }
    
    sendQuickTelegramMessage(message);
    
    return {
      headers: headers,
      lastRowData: lastRowData,
      keyFields: {
        clientName: clientName,
        amount: amount,
        performer: performer
      }
    };
    
  } catch (error) {
    Logger.log('❌ Помилка діагностики:', error.toString());
    sendQuickTelegramMessage(`❌ Помилка діагностики форми:\n${error.toString()}`);
  }
}

/**
 * Симуляція обробки форми з реальними даними (НОВА СТРУКТУРА)
 */
function simulateFormSubmissionNew() {
  Logger.log('=== СИМУЛЯЦІЯ ОБРОБКИ ФОРМИ (НОВА СТРУКТУРА) ===');
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      Logger.log('❌ Немає даних для симуляції');
      sendQuickTelegramMessage('❌ Немає даних для симуляції');
      return;
    }
    
    // Отримуємо останні дані
    const values = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Створюємо mock event для симуляції onFormSubmit
    const mockEvent = {
      values: values
    };
    
    Logger.log('Симулюємо onFormSubmit з даними:', values);
    sendQuickTelegramMessage(`🧪 СИМУЛЯЦІЯ: Обробляю дані з рядка ${lastRow}`);
    
    // Викликаємо функцію обробки
    onFormSubmit(mockEvent);
    
  } catch (error) {
    Logger.log('❌ Помилка симуляції:', error.toString());
    sendQuickTelegramMessage(`❌ Помилка симуляції:\n${error.toString()}`);
  }
}

/**
 * Перевірка відповідності індексів конфігурації реальній структурі
 */
function validateConfigMapping() {
  Logger.log('=== ПЕРЕВІРКА ВІДПОВІДНОСТІ КОНФІГУРАЦІЇ ===');
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    Logger.log('Поточні заголовки:', headers);
    Logger.log('Конфігурація FORM_FIELDS:', CONFIG.FORM_FIELDS);
    
    let message = '🔧 ПЕРЕВІРКА КОНФІГУРАЦІЇ:\n\n';
    let hasErrors = false;
    
    // Перевіряємо відповідність ключових полів
    const mappings = [
      { key: 'CLIENT_NAME', index: CONFIG.FORM_FIELDS.CLIENT_NAME, expected: 'Назва компанії' },
      { key: 'AMOUNT', index: CONFIG.FORM_FIELDS.AMOUNT, expected: 'Загальна сума' },
      { key: 'PERFORMER_NAME', index: CONFIG.FORM_FIELDS.PERFORMER_NAME, expected: 'Назва виконавця' }
    ];
    
    for (const mapping of mappings) {
      const actualHeader = headers[mapping.index] || 'ВІДСУТНЄ';
      const matches = actualHeader.toLowerCase().includes(mapping.expected.toLowerCase());
      
      if (!matches) {
        hasErrors = true;
        message += `❌ ${mapping.key} (індекс ${mapping.index}): "${actualHeader}" не відповідає "${mapping.expected}"\n`;
      } else {
        message += `✅ ${mapping.key} (індекс ${mapping.index}): "${actualHeader}"\n`;
      }
    }
    
    if (hasErrors) {
      message += '\n🚨 ЗНАЙДЕНО ПОМИЛКИ В КОНФІГУРАЦІЇ!';
    } else {
      message += '\n✅ Конфігурація правильна';
    }
    
    sendQuickTelegramMessage(message);
    Logger.log(message);
    
    return !hasErrors;
    
  } catch (error) {
    Logger.log('❌ Помилка перевірки:', error.toString());
    sendQuickTelegramMessage(`❌ Помилка перевірки конфігурації:\n${error.toString()}`);
    return false;
  }
}

/**
 * Повний тест системи з новою структурою
 */
function runFullSystemTestNew() {
  Logger.log('=== ПОВНИЙ ТЕСТ СИСТЕМИ (НОВА СТРУКТУРА) ===');
  
  sendQuickTelegramMessage('🧪 Запускаю повний тест системи...');
  
  // 1. Діагностика даних
  Logger.log('1. Діагностика останніх даних...');
  const diagnostics = debugLastFormDataNew();
  
  // 2. Перевірка конфігурації
  Logger.log('2. Перевірка конфігурації...');
  const configValid = validateConfigMapping();
  
  // 3. Перевірка виконавців
  Logger.log('3. Перевірка довідника виконавців...');
  const performers = getActivePerformers();
  Logger.log(`Знайдено ${performers.length} виконавців`);
  
  // 4. Симуляція (якщо є дані)
  if (diagnostics && diagnostics.keyFields.performer) {
    Logger.log('4. Симуляція обробки форми...');
    simulateFormSubmissionNew();
  }
  
  sendQuickTelegramMessage(`🏁 ТЕСТ ЗАВЕРШЕНО\n✅ Конфігурація: ${configValid ? 'OK' : 'ПОМИЛКА'}\n✅ Виконавців: ${performers.length}`);
}