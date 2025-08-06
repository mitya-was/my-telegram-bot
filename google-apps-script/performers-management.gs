/**
 * Управління виконавцями (executors)
 * Performers/Executors Management
 */

/**
 * Ініціалізація вкладки "Виконавці" з базовими даними
 */
function initializePerformersSheet() {
  Logger.log('=== ІНІЦІАЛІЗАЦІЯ ВКЛАДКИ ВИКОНАВЦІВ ===');
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let performersSheet;
    
    // Перевіряємо чи існує вкладка "Виконавці"
    performersSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.PERFORMERS);
    
    if (performersSheet === null) {
      Logger.log('Створюю нову вкладку "Виконавці"...');
      performersSheet = spreadsheet.insertSheet(CONFIG.SHEETS.PERFORMERS);
      Logger.log('✅ Вкладка "Виконавці" створена');
    } else {
      Logger.log('✅ Вкладка "Виконавці" вже існує');
    }
    
    // Заголовки колонок (ПРАВИЛЬНА СТРУКТУРА)
    const headers = [
      'Назва виконавця',        // Колонка A
      'ЄДРПОУ виконавця',       // Колонка B
      'Адреса виконавця',       // Колонка C
      'Тип організації виконавця', // Колонка D
      'Телефон виконавця',      // Колонка E
      'Email виконавця',        // Колонка F
      'Банківські реквізити виконавця', // Колонка G
      'Керівник виконавця'      // Колонка H
    ];
    
    // Встановлюємо заголовки
    performersSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Форматування заголовків
    const headerRange = performersSheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    
    // Встановлюємо ширину колонок (ПРАВИЛЬНА СТРУКТУРА)
    performersSheet.setColumnWidth(1, 250); // Назва виконавця
    performersSheet.setColumnWidth(2, 120); // ЄДРПОУ виконавця
    performersSheet.setColumnWidth(3, 400); // Адреса виконавця
    performersSheet.setColumnWidth(4, 150); // Тип організації виконавця
    performersSheet.setColumnWidth(5, 150); // Телефон виконавця
    performersSheet.setColumnWidth(6, 200); // Email виконавця
    performersSheet.setColumnWidth(7, 500); // Банківські реквізити виконавця
    performersSheet.setColumnWidth(8, 200); // Керівник виконавця
    
    // Додаємо базових виконавців, якщо вкладка порожня
    if (performersSheet.getLastRow() === 1) {
      addDefaultPerformers(performersSheet);
    }
    
    Logger.log('✅ Вкладка "Виконавці" успішно ініціалізована');
    return performersSheet;
    
  } catch (error) {
    Logger.log('❌ Помилка ініціалізації вкладки виконавців:', error.toString());
    throw error;
  }
}

/**
 * Додавання базових виконавців
 */
function addDefaultPerformers(sheet) {
  Logger.log('Додавання базових виконавців...');
  
  const defaultPerformers = [
    [
      'Іваненко Іван Іванович',     // A - Назва виконавця
      '1234567890',                 // B - ЄДРПОУ виконавця
      'м. Київ, вул. Хрещатик, 1, кв. 10', // C - Адреса виконавця
      'ФОП',                        // D - Тип організації виконавця
      '+380441234567',              // E - Телефон виконавця
      'ivan@example.com',           // F - Email виконавця
      'Рахунок: UA123456789012345678901234567 в ПАТ "ПриватБанк", МФО: 305299', // G - Банківські реквізити
      'Іваненко Іван Іванович'      // H - Керівник виконавця
    ],
    [
      'Петренко Петро Петрович',
      '0987654321',
      'м. Львів, вул. Свободи, 15, кв. 5',
      'ФОП',
      '+380321234567',
      'petro@example.com',
      'Рахунок: UA876543210987654321098765432 в ПАТ "Ощадбанк", МФО: 300012',
      'Петренко Петро Петрович'
    ],
    [
      'Сидоренко Сидір Сидорович',
      '1122334455',
      'м. Харків, вул. Сумська, 25, кв. 8',
      'ФОП',
      '+380571234567',
      'sidir@example.com',
      'Рахунок: UA112233445566778899001122334 в ПАТ "Укргазбанк", МФО: 320627',
      'Сидоренко Сидір Сидорович'
    ],
    [
      'Коваленко Коваль Ковальович',
      '5566778899',
      'м. Одеса, вул. Дерибасівська, 10, кв. 3',
      'ФОП',
      '+380481234567',
      'koval@example.com',
      'Рахунок: UA556677889900112233445566778 в ПАТ "Райффайзен Банк", МФО: 380805',
      'Коваленко Коваль Ковальович'
    ]
  ];
  
  // Додаємо виконавців
  for (let i = 0; i < defaultPerformers.length; i++) {
    sheet.appendRow(defaultPerformers[i]);
  }
  
  Logger.log(`✅ Додано ${defaultPerformers.length} базових виконавців`);
}

/**
 * Отримання списку всіх активних виконавців
 */
function getActivePerformers() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.PERFORMERS);
    
    if (sheet === null) {
      Logger.log('❌ Вкладка "Виконавці" не знайдена');
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    
    const performers = [];
    
    // Пропускаємо заголовки (перший рядок)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Всі виконавці активні в новій структурі
      performers.push({
        name: row[0],           // A - Назва виконавця
        edrpou: row[1],         // B - ЄДРПОУ виконавця
        address: row[2],        // C - Адреса виконавця
        type: row[3],           // D - Тип організації виконавця
        phone: row[4],          // E - Телефон виконавця
        email: row[5],          // F - Email виконавця
        bankDetails: row[6],    // G - Банківські реквізити виконавця
        director: row[7]        // H - Керівник виконавця
      });
    }
    
    Logger.log(`Отримано ${performers.length} активних виконавців`);
    return performers;
    
  } catch (error) {
    Logger.log('❌ Помилка отримання виконавців:', error.toString());
    return [];
  }
}

/**
 * Отримання даних конкретного виконавця за назвою
 */
function getPerformerByName(performerName) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.PERFORMERS);
    
    if (sheet === null) {
      Logger.log('❌ Вкладка "Виконавці" не знайдена');
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Шукаємо виконавця за назвою
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === performerName) {
        return {
          name: row[0],           // A - Назва виконавця
          edrpou: row[1],         // B - ЄДРПОУ виконавця
          address: row[2],        // C - Адреса виконавця
          type: row[3],           // D - Тип організації виконавця
          phone: row[4],          // E - Телефон виконавця
          email: row[5],          // F - Email виконавця
          bankDetails: row[6],    // G - Банківські реквізити виконавця
          director: row[7]        // H - Керівник виконавця
        };
      }
    }
    
    Logger.log(`Виконавець "${performerName}" не знайдено`);
    return null;
    
  } catch (error) {
    Logger.log('❌ Помилка пошуку виконавця:', error.toString());
    return null;
  }
}

/**
 * Додавання нового виконавця
 */
function addNewPerformer(performerData) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.PERFORMERS);
    
    if (sheet === null) {
      Logger.log('❌ Вкладка "Виконавці" не знайдена');
      return false;
    }
    
    const newRow = [
      performerData.name,
      performerData.fullName,
      performerData.edrpou,
      performerData.address,
      performerData.type,
      performerData.phone,
      performerData.email,
      performerData.bankDetails,
      performerData.director,
      new Date(),
      'Так' // Активний за замовчуванням
    ];
    
    sheet.appendRow(newRow);
    Logger.log(`✅ Додано нового виконавця: ${performerData.name}`);
    
    return true;
    
  } catch (error) {
    Logger.log('❌ Помилка додавання виконавця:', error.toString());
    return false;
  }
}

/**
 * Оновлення даних виконавця
 */
function updatePerformer(performerName, updatedData) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.PERFORMERS);
    
    if (sheet === null) {
      Logger.log('❌ Вкладка "Виконавці" не знайдена');
      return false;
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Шукаємо рядок з виконавцем
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === performerName) {
        const rowNumber = i + 1;
        
        // Оновлюємо дані
        if (updatedData.fullName) sheet.getRange(rowNumber, 2).setValue(updatedData.fullName);
        if (updatedData.edrpou) sheet.getRange(rowNumber, 3).setValue(updatedData.edrpou);
        if (updatedData.address) sheet.getRange(rowNumber, 4).setValue(updatedData.address);
        if (updatedData.type) sheet.getRange(rowNumber, 5).setValue(updatedData.type);
        if (updatedData.phone) sheet.getRange(rowNumber, 6).setValue(updatedData.phone);
        if (updatedData.email) sheet.getRange(rowNumber, 7).setValue(updatedData.email);
        if (updatedData.bankDetails) sheet.getRange(rowNumber, 8).setValue(updatedData.bankDetails);
        if (updatedData.director) sheet.getRange(rowNumber, 9).setValue(updatedData.director);
        if (updatedData.active !== undefined) sheet.getRange(rowNumber, 11).setValue(updatedData.active ? 'Так' : 'Ні');
        
        Logger.log(`✅ Оновлено виконавця: ${performerName}`);
        return true;
      }
    }
    
    Logger.log(`Виконавець "${performerName}" не знайдено для оновлення`);
    return false;
    
  } catch (error) {
    Logger.log('❌ Помилка оновлення виконавця:', error.toString());
    return false;
  }
}

/**
 * Деактивація виконавця
 */
function deactivatePerformer(performerName) {
  return updatePerformer(performerName, { active: false });
}

/**
 * Активація виконавця
 */
function activatePerformer(performerName) {
  return updatePerformer(performerName, { active: true });
}

/**
 * Тестова функція для перевірки роботи з виконавцями
 */
function testPerformersManagement() {
  Logger.log('=== ТЕСТУВАННЯ УПРАВЛІННЯ ВИКОНАВЦЯМИ ===');
  
  try {
    // Ініціалізуємо вкладку
    initializePerformersSheet();
    
    // Отримуємо активних виконавців
    const performers = getActivePerformers();
    Logger.log(`Знайдено ${performers.length} активних виконавців:`);
    
    performers.forEach((performer, index) => {
      Logger.log(`${index + 1}. ${performer.name} (${performer.type})`);
    });
    
    // Тестуємо пошук конкретного виконавця
    const testPerformer = getPerformerByName('IT Company LLC');
    if (testPerformer) {
      Logger.log('✅ Тест пошуку виконавця пройшов успішно');
      Logger.log(`Знайдено: ${testPerformer.fullName}, ЄДРПОУ: ${testPerformer.edrpou}`);
    }
    
    Logger.log('✅ Тестування управління виконавцями завершено успішно');
    
  } catch (error) {
    Logger.log('❌ Помилка тестування:', error.toString());
  }
} 