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
    
    // Заголовки колонок
    const headers = [
      'Назва виконавця',
      'Повна назва',
      'ЄДРПОУ',
      'Адреса',
      'Тип організації',
      'Телефон',
      'Email',
      'Банківські реквізити',
      'Керівник',
      'Дата додавання',
      'Активний'
    ];
    
    // Встановлюємо заголовки
    performersSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Форматування заголовків
    const headerRange = performersSheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    
    // Встановлюємо ширину колонок
    performersSheet.setColumnWidth(1, 200); // Назва виконавця
    performersSheet.setColumnWidth(2, 300); // Повна назва
    performersSheet.setColumnWidth(3, 120); // ЄДРПОУ
    performersSheet.setColumnWidth(4, 400); // Адреса
    performersSheet.setColumnWidth(5, 150); // Тип організації
    performersSheet.setColumnWidth(6, 150); // Телефон
    performersSheet.setColumnWidth(7, 200); // Email
    performersSheet.setColumnWidth(8, 400); // Банківські реквізити
    performersSheet.setColumnWidth(9, 200); // Керівник
    performersSheet.setColumnWidth(10, 120); // Дата додавання
    performersSheet.setColumnWidth(11, 100); // Активний
    
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
      'IT Company LLC',
      'ТОВ "IT Company"',
      '12345678',
      'м. Київ, вул. Хрещатик, 1',
      'ТОВ',
      '+380441234567',
      'info@itcompany.ua',
      'Рахунок: UA123456789012345678901234567 в ПАТ "ПриватБанк"',
      'Петренко Петро Петрович',
      new Date(),
      'Так'
    ],
    [
      'Web Studio Pro',
      'ТОВ "Web Studio Pro"',
      '87654321',
      'м. Львів, вул. Свободи, 15',
      'ТОВ',
      '+380321234567',
      'contact@webstudiopro.ua',
      'Рахунок: UA876543210987654321098765432 в ПАТ "Ощадбанк"',
      'Іваненко Іван Іванович',
      new Date(),
      'Так'
    ],
    [
      'Digital Agency',
      'ТОВ "Digital Agency"',
      '11223344',
      'м. Харків, вул. Сумська, 25',
      'ТОВ',
      '+380571234567',
      'hello@digitalagency.ua',
      'Рахунок: UA112233445566778899001122334 в ПАТ "Укргазбанк"',
      'Сидоренко Сидір Сидорович',
      new Date(),
      'Так'
    ],
    [
      'Tech Solutions',
      'ФОП "Tech Solutions"',
      '55667788',
      'м. Одеса, вул. Дерибасівська, 10',
      'ФОП',
      '+380481234567',
      'info@techsolutions.ua',
      'Рахунок: UA556677889900112233445566778 в ПАТ "Райффайзен Банк"',
      'Коваленко Коваль Ковальович',
      new Date(),
      'Так'
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
      const isActive = row[10] === 'Так' || row[10] === true; // Колонка "Активний"
      
      if (isActive) {
        performers.push({
          name: row[0],           // Назва виконавця
          fullName: row[1],       // Повна назва
          edrpou: row[2],         // ЄДРПОУ
          address: row[3],        // Адреса
          type: row[4],           // Тип організації
          phone: row[5],          // Телефон
          email: row[6],          // Email
          bankDetails: row[7],    // Банківські реквізити
          director: row[8],       // Керівник
          dateAdded: row[9],      // Дата додавання
          active: row[10]         // Активний
        });
      }
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
          name: row[0],           // Назва виконавця
          fullName: row[1],       // Повна назва
          edrpou: row[2],         // ЄДРПОУ
          address: row[3],        // Адреса
          type: row[4],           // Тип організації
          phone: row[5],          // Телефон
          email: row[6],          // Email
          bankDetails: row[7],    // Банківські реквізити
          director: row[8],       // Керівник
          dateAdded: row[9],      // Дата додавання
          active: row[10]         // Активний
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