/**
 * Головний файл Google Apps Script для автоматизації договорів
 * Main Google Apps Script file for contract automation
 */

/**
 * Обробник форми - викликається при надходженні нових даних
 * Form submission handler
 */
function onFormSubmit(e) {
  Logger.log('=== НОВА ЗАЯВКА НА ДОГОВІР ===');
  Logger.log('Timestamp:', new Date().toLocaleString());
  Logger.log('Event object існує:', !!e);
  Logger.log('Event.values існує:', !!(e && e.values));
  
  try {
    // Перевіряємо чи є дані в event
    if (!e || !e.values) {
      Logger.log('❌ ПОМИЛКА: Немає даних в event object');
      sendQuickTelegramMessage('❌ Помилка: Немає даних в формі');
      return;
    }
    
    // Отримуємо дані з форми
    const formData = parseFormData(e);
    Logger.log('Дані форми після парсингу:', JSON.stringify(formData));
    
    // Перевіряємо обов'язкові поля
    if (!formData.client || !formData.amount) {
      Logger.log('❌ ПОМИЛКА: Не заповнені обов\'язкові поля');
      Logger.log('Клієнт:', formData.client);
      Logger.log('Сума:', formData.amount);
      sendQuickTelegramMessage(`❌ Помилка: Не заповнені поля. Клієнт: ${formData.client}, Сума: ${formData.amount}`);
      return;
    }
    
    // Генеруємо унікальний номер договору
    Logger.log('Генерація номера договору...');
    const contractNumber = generateContractNumber();
    formData.contractNumber = contractNumber;
    Logger.log('Номер договору:', contractNumber);
    
    // Додаємо дані до таблиці
    Logger.log('Додавання до таблиці...');
    addToSpreadsheet(formData);
    Logger.log('Дані додано до таблиці');
    
    // Створюємо структуру папок
    Logger.log('Створення папки...');
    const folderUrl = createFolderStructure(formData);
    Logger.log('Папка створена:', folderUrl);
    
    // Генеруємо договір
    Logger.log('Генерація договору...');
    const contractUrl = generateContract(formData, folderUrl);
    Logger.log('Договір створено:', contractUrl);
    
    // Оновлюємо таблицю з посиланнями
    Logger.log('Оновлення таблиці з посиланнями...');
    updateSpreadsheetWithLinks(formData.contractNumber, folderUrl, contractUrl);
    Logger.log('Таблиця оновлена з посиланнями');
    
    // Відправляємо сповіщення в Telegram
    Logger.log('Відправка Telegram сповіщення...');
    sendTelegramNotification(formData, contractUrl);
    Logger.log('Telegram сповіщення відправлено');
    
    Logger.log('🎉 ДОГОВІР УСПІШНО СТВОРЕНО:', contractNumber);
    
  } catch (error) {
    Logger.log('❌ КРИТИЧНА ПОМИЛКА в onFormSubmit:', error.toString());
    Logger.log('Stack trace:', error.stack);
    
    // Відправляємо повідомлення про помилку
    const errorMessage = `❌ Критична помилка при створенні договору:

${error.toString()}

Час: ${new Date().toLocaleString()}`;
    
    sendQuickTelegramMessage(errorMessage);
    sendErrorNotification(error);
  }
}

/**
 * Парсинг даних з форми
 */
function parseFormData(e) {
  Logger.log('=== ПАРСИНГ ДАНИХ ФОРМИ ===');
  
  if (!e || !e.values) {
    Logger.log('❌ Немає e.values');
    return {};
  }
  
  const values = e.values;
  Logger.log('Кількість значень:', values.length);
  Logger.log('Всі значення:', JSON.stringify(values));
  
  // Безпечне отримання значень з перевіркою
  const result = {
    timestamp: values[0] || new Date(),
    client: values[1] || '',
    activityType: values[2] || '',
    director: values[3] || '',
    edrpou: values[4] || '',
    description: values[5] || '',
    amount: values[6] || '',
    performer: values[7] || ''
  };
  
  Logger.log('Результат парсингу:', JSON.stringify(result));
  return result;
}

/**
 * Генерація унікального номера договору
 * Формат: W-(YY)-XX
 */
function generateContractNumber() {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
  const currentYear = new Date().getFullYear().toString().slice(-2); // Останні 2 цифри року
  
  // Знаходимо останній номер за цей рік
  const lastRow = sheet.getLastRow();
  let sequenceNumber = 1;
  
  if (lastRow > 1) {
    // Шукаємо останній договір цього року
    const numbers = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    const thisYearNumbers = numbers
      .filter(num => num && num.toString().includes(`W-${currentYear}-`))
      .map(num => {
        const parts = num.toString().split('-');
        return parts.length === 3 ? parseInt(parts[2]) : 0;
      })
      .filter(num => !isNaN(num) && num > 0);
    
    if (thisYearNumbers.length > 0) {
      sequenceNumber = Math.max(...thisYearNumbers) + 1;
    }
  }
  
  // Форматуємо номер з провідними нулями
  const formattedNumber = sequenceNumber.toString().padStart(2, '0');
  
  return `${CONFIG.CONTRACT_NUMBER_FORMAT.PREFIX}${CONFIG.CONTRACT_NUMBER_FORMAT.SEPARATOR}${currentYear}${CONFIG.CONTRACT_NUMBER_FORMAT.SEPARATOR}${formattedNumber}`;
}

/**
 * Додавання даних до Google Sheets
 */
function addToSpreadsheet(formData) {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
  
  // Отримуємо дані виконавця з довідника
  const performerData = getPerformerData(formData.performer);
  
  const rowData = [
    formData.contractNumber,
    formData.timestamp,
    formData.client,
    formData.activityType,
    formData.director,
    formData.edrpou,
    formData.description,
    formData.amount,
    formData.performer,
    performerData.fullName || '',
    performerData.edrpou || '',
    performerData.address || '',
    CONFIG.CONTRACT_STATUS.DRAFT, // початковий статус
    '', // посилання на папку (заповниться пізніше)
    '', // посилання на договір (заповниться пізніше)
    new Date() // дата створення
  ];
  
  sheet.appendRow(rowData);
}

/**
 * Отримання даних виконавця з довідника
 */
function getPerformerData(performerName) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.PERFORMERS);
    const data = sheet.getDataRange().getValues();
    
    // Шукаємо виконавця за назвою
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === performerName) {
        return {
          fullName: data[i][1],
          edrpou: data[i][2],
          address: data[i][3],
          type: data[i][4] // ФОП, ГО, ТОВ
        };
      }
    }
  } catch (error) {
    Logger.log('Лист Виконавці не знайдено або порожній');
  }
  
  return {}; // Якщо не знайдено
}

/**
 * Створення структури папок в Google Drive
 */
function createFolderStructure(formData) {
  const parentFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  
  // Назва папки: номер_НазваКлієнта
  const folderName = `${formData.contractNumber}_${formData.client}`;
  
  // Перевіряємо, чи не існує вже така папка
  const existingFolders = parentFolder.getFoldersByName(folderName);
  if (existingFolders.hasNext()) {
    return existingFolders.next().getUrl();
  }
  
  // Створюємо нову папку
  const newFolder = parentFolder.createFolder(folderName);
  
  return newFolder.getUrl();
}

/**
 * Генерація договору з шаблону
 */
function generateContract(formData, folderUrl) {
  Logger.log('=== ГЕНЕРАЦІЯ ДОГОВОРУ ===');
  Logger.log('formData:', JSON.stringify(formData));
  Logger.log('folderUrl:', folderUrl);
  
  try {
    // Копіюємо шаблон
    Logger.log('Крок 1: Отримання шаблону...');
    Logger.log('Template ID:', CONFIG.TEMPLATES.CONTRACT);
    const template = DriveApp.getFileById(CONFIG.TEMPLATES.CONTRACT);
    Logger.log('✅ Шаблон отримано:', template.getName());
    
    Logger.log('Крок 2: Отримання папки...');
    const folderId = extractFolderIdFromUrl(folderUrl);
    Logger.log('Folder ID:', folderId);
    const folder = DriveApp.getFolderById(folderId);
    Logger.log('✅ Папка отримана:', folder.getName());
    
    Logger.log('Крок 3: Створення копії...');
    const fileName = `Договір_${formData.contractNumber}_${formData.client}`;
    Logger.log('Назва файлу:', fileName);
    const contractCopy = template.makeCopy(fileName, folder);
    Logger.log('✅ Копія створена, ID:', contractCopy.getId());
  
    Logger.log('Крок 4: Відкриття документа для редагування...');
    
    // Додаємо затримку для синхронізації Google Drive
    Logger.log('Чекаємо синхронізацію Google Drive (3 секунди)...');
    Utilities.sleep(3000);
    
    // Пробуємо відкрити з retry логікою
    let doc;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        Logger.log(`Спроба ${attempts} відкрити документ...`);
        doc = DocumentApp.openById(contractCopy.getId());
        Logger.log('✅ Документ відкрито для редагування');
        break;
      } catch (retryError) {
        Logger.log(`❌ Спроба ${attempts} невдала: ${retryError.toString()}`);
        if (attempts < maxAttempts) {
          Logger.log('Чекаємо 2 секунди перед наступною спробою...');
          Utilities.sleep(2000);
        } else {
          throw retryError;
        }
      }
    }
    
    const body = doc.getBody();
    Logger.log('✅ Body документа отримано');
  
    Logger.log('Крок 5: Підготовка заміни тексту...');
    // Замінюємо плейсхолдери на реальні дані
    const replacements = {
      '{{CONTRACT_NUMBER}}': formData.contractNumber,
      '{{CLIENT_NAME}}': formData.client,
      '{{ACTIVITY_TYPE}}': formData.activityType,
      '{{DIRECTOR_NAME}}': formData.director,
      '{{CLIENT_EDRPOU}}': formData.edrpou,
      '{{DESCRIPTION}}': formData.description,
      '{{AMOUNT}}': formData.amount,
      '{{PERFORMER}}': formData.performer,
      '{{DATE}}': Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd.MM.yyyy')
    };
    
    Logger.log('Replacements:', JSON.stringify(replacements));
    
    Logger.log('Крок 6: Виконання замін...');
    // Виконуємо заміни
    for (const [placeholder, value] of Object.entries(replacements)) {
      Logger.log(`Заміна ${placeholder} → ${value}`);
      body.replaceText(placeholder, value || '');
    }
    Logger.log('✅ Всі заміни виконано');
    
    Logger.log('Крок 7: Збереження документа...');
    // Зберігаємо зміни
    doc.saveAndClose();
    Logger.log('✅ Документ збережено');
    
    const documentUrl = contractCopy.getUrl();
    Logger.log('✅ URL документа:', documentUrl);
    Logger.log('🎉 ГЕНЕРАЦІЯ ДОГОВОРУ ЗАВЕРШЕНА УСПІШНО');
    
    return documentUrl;
    
  } catch (error) {
    Logger.log('❌ ПОМИЛКА В ГЕНЕРАЦІЇ ДОГОВОРУ:', error.toString());
    Logger.log('Stack trace:', error.stack);
    throw error;
  }
}

/**
 * Оновлення таблиці з посиланнями
 */
function updateSpreadsheetWithLinks(contractNumber, folderUrl, contractUrl) {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
  const data = sheet.getDataRange().getValues();
  
  // Знаходимо рядок з нашим договором
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === contractNumber) {
      sheet.getRange(i + 1, 14).setValue(folderUrl); // Колонка з посиланням на папку
      sheet.getRange(i + 1, 15).setValue(contractUrl); // Колонка з посиланням на договір
      sheet.getRange(i + 1, 13).setValue(CONFIG.CONTRACT_STATUS.ACTIVE); // Оновлюємо статус
      break;
    }
  }
}

/**
 * Відправка сповіщення в Telegram
 */
function sendTelegramNotification(formData, contractUrl) {
  if (!CONFIG.TELEGRAM.CHAT_ID) {
    Logger.log('⚠️ Chat ID не налаштовано для сповіщень');
    return;
  }
  
  const message = `🎉 Новий договір створено!

📋 Номер: ${formData.contractNumber}
🏢 Клієнт: ${formData.client}
💰 Сума: ${formData.amount} грн
👤 Виконавець: ${formData.performer}

📄 Документ: ${contractUrl}

⏰ Час: ${new Date().toLocaleString()}`;
  
  const payload = {
    chat_id: CONFIG.TELEGRAM.CHAT_ID,
    text: message,
    parse_mode: 'HTML'
  };
  
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
  
  try {
    Logger.log('Відправка Telegram сповіщення...');
    const response = UrlFetchApp.fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.ok) {
      Logger.log('✅ Telegram сповіщення відправлено успішно');
    } else {
      Logger.log('❌ Помилка Telegram API:', result.description);
    }
    
  } catch (error) {
    Logger.log('❌ Помилка відправки в Telegram:', error.toString());
  }
}

/**
 * Відправка сповіщення про помилку
 */
function sendErrorNotification(error) {
  if (!CONFIG.TELEGRAM.CHAT_ID) return;
  
  const message = `❌ Помилка при створенні договору:

${error.toString()}

⏰ Час: ${new Date().toLocaleString()}`;
  
  const payload = {
    chat_id: CONFIG.TELEGRAM.CHAT_ID,
    text: message
  };
  
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
  
  try {
    UrlFetchApp.fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`, options);
  } catch (e) {
    Logger.log('Помилка відправки помилки в Telegram:', e.toString());
  }
}

/**
 * Допоміжна функція для витягування ID папки з URL
 */
function extractFolderIdFromUrl(url) {
  const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Тестова функція для перевірки системи
 */
function testSystem() {
  Logger.log('=== ТЕСТУВАННЯ СИСТЕМИ ===');
  
  // Тестові дані
  const testData = {
    contractNumber: 'TEST-01',
    client: 'Тестовий Клієнт ТОВ',
    activityType: 'IT послуги',
    director: 'Іваненко Іван Іванович',
    edrpou: '12345678',
    description: 'Розробка веб-сайту',
    amount: '50000',
    performer: 'IT Company LLC'
  };
  
  try {
    Logger.log('Тест створення папки...');
    const folderUrl = createFolderStructure(testData);
    Logger.log('✅ Папка створена:', folderUrl);
    
    Logger.log('Тест генерації номера договору...');
    const contractNumber = generateContractNumber();
    Logger.log('✅ Номер згенеровано:', contractNumber);
    
    Logger.log('✅ Система працює коректно!');
    
  } catch (error) {
    Logger.error('❌ Помилка тестування:', error);
  }
}

// Тестова функція видалена для production використання

/**
 * Швидке відправлення Telegram повідомлення
 */
function sendQuickTelegramMessage(text) {
  if (!CONFIG.TELEGRAM.CHAT_ID) {
    Logger.log('❌ Chat ID не налаштовано для швидкого повідомлення');
    return;
  }
  
  const payload = {
    chat_id: CONFIG.TELEGRAM.CHAT_ID,
    text: text
  };
  
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
  
  try {
    UrlFetchApp.fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`, options);
    Logger.log('✅ Швидке повідомлення відправлено');
  } catch (error) {
    Logger.log('❌ Помилка швидкого повідомлення:', error.toString());
  }
}

/**
 * ДІАГНОСТИКА - перевірка доступу до всіх шаблонів
 */
function testTemplateAccess() {
  Logger.log('=== ДІАГНОСТИКА ДОСТУПУ ДО ШАБЛОНІВ ===');
  
  const templates = {
    'Договір': CONFIG.TEMPLATES.CONTRACT,
    'Рахунок': CONFIG.TEMPLATES.INVOICE, 
    'Акт': CONFIG.TEMPLATES.ACT
  };
  
  for (const [name, id] of Object.entries(templates)) {
    try {
      Logger.log(`Перевіряю ${name} (${id})...`);
      const file = DriveApp.getFileById(id);
      Logger.log(`✅ ${name}: ${file.getName()} - ДОСТУП Є`);
    } catch (error) {
      Logger.log(`❌ ${name} (${id}): ${error.toString()}`);
      sendQuickTelegramMessage(`❌ Немає доступу до шаблону ${name}: ${id}`);
    }
  }
  
  // Перевіряємо таблицю теж
  try {
    Logger.log(`Перевіряю таблицю (${CONFIG.SPREADSHEET_ID})...`);
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    Logger.log(`✅ Таблиця: ${sheet.getName()} - ДОСТУП Є`);
  } catch (error) {
    Logger.log(`❌ Таблиця (${CONFIG.SPREADSHEET_ID}): ${error.toString()}`);
  }
  
  // Перевіряємо папку
  try {
    Logger.log(`Перевіряю папку (${CONFIG.DRIVE_FOLDER_ID})...`);
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    Logger.log(`✅ Папка: ${folder.getName()} - ДОСТУП Є`);
  } catch (error) {
    Logger.log(`❌ Папка (${CONFIG.DRIVE_FOLDER_ID}): ${error.toString()}`);
  }
}

// Видалено тестові функції для чистоти коду