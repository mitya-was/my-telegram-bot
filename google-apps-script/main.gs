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
    
    // Перевіряємо обов'язкові поля (ОНОВЛЕНІ)
    if (!formData.clientName || !formData.amount || !formData.performer) {
      Logger.log('❌ ПОМИЛКА: Не заповнені обов\'язкові поля');
      Logger.log('Назва компанії:', formData.clientName);
      Logger.log('Сума:', formData.amount);
      Logger.log('Виконавець:', formData.performer);
      sendQuickTelegramMessage(`❌ Помилка: Не заповнені поля.\nКомпанія: ${formData.clientName}\nСума: ${formData.amount}\nВиконавець: ${formData.performer}`);
      return;
    }
    
    // Генеруємо унікальний номер договору
    Logger.log('Генерація номера договору...');
    const contractNumber = generateContractNumber();
    formData.contractNumber = contractNumber;
    Logger.log('Номер договору:', contractNumber);
    
    // ОНОВЛЮЄМО ОСТАННЮ СТРОКУ замість додавання нової
    Logger.log('Оновлення останньої строки з номером договору...');
    updateLastRowWithContractData(formData);
    Logger.log('Дані оновлено в таблиці');
    
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
 * Парсинг даних з форми (ОНОВЛЕНА СТРУКТУРА)
 */
function parseFormData(e) {
  Logger.log('=== ПАРСИНГ ДАНИХ ФОРМИ (НОВА СТРУКТУРА) ===');
  
  if (!e || !e.values) {
    Logger.log('❌ Немає e.values');
    return {};
  }
  
  const values = e.values;
  Logger.log('Кількість значень:', values.length);
  Logger.log('Всі значення:', JSON.stringify(values));
  
  // Безпечне отримання значень з перевіркою відповідно до нової структури
  const result = {
    timestamp: values[CONFIG.FORM_FIELDS.TIMESTAMP] || new Date(),
    clientName: values[CONFIG.FORM_FIELDS.CLIENT_NAME] || '',
    clientTaxType: values[CONFIG.FORM_FIELDS.CLIENT_TAX_TYPE] || '',
    clientDirector: values[CONFIG.FORM_FIELDS.CLIENT_DIRECTOR] || '',
    clientAddress: values[CONFIG.FORM_FIELDS.CLIENT_ADDRESS] || '',
    clientEdrpou: values[CONFIG.FORM_FIELDS.CLIENT_EDRPOU] || '',
    clientBankAccount: values[CONFIG.FORM_FIELDS.CLIENT_BANK_ACCOUNT] || '',
    clientBankName: values[CONFIG.FORM_FIELDS.CLIENT_BANK_NAME] || '',
    clientBankMfo: values[CONFIG.FORM_FIELDS.CLIENT_BANK_MFO] || '',
    description: values[CONFIG.FORM_FIELDS.DESCRIPTION] || '',
    periodStart: values[CONFIG.FORM_FIELDS.PERIOD_START] || '',
    periodEnd: values[CONFIG.FORM_FIELDS.PERIOD_END] || '',
    amount: values[CONFIG.FORM_FIELDS.AMOUNT] || '',
    currency: values[CONFIG.FORM_FIELDS.CURRENCY] || 'грн',
    paymentTerm: values[CONFIG.FORM_FIELDS.PAYMENT_TERM] || '',
    performer: values[CONFIG.FORM_FIELDS.PERFORMER] || ''
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
 * Оновлення останньої строки з даними договору (замість додавання нової)
 */
function updateLastRowWithContractData(formData) {
  Logger.log('=== ОНОВЛЕННЯ ОСТАННЬОЇ СТРОКИ ===');
  
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
  const lastRow = sheet.getLastRow();
  
  Logger.log('Останній рядок:', lastRow);
  
  if (lastRow <= 1) {
    Logger.log('❌ Немає даних для оновлення, додаємо нову строку');
    addToSpreadsheet(formData);
    return;
  }
  
  // Отримуємо дані виконавця з довідника
  const performerData = getPerformerData(formData.performer);
  Logger.log('Дані виконавця:', performerData);
  
  // Оновлюємо тільки потрібні колонки в останньому рядку
  try {
    // Колонка A - Номер договору
    sheet.getRange(lastRow, 1).setValue(formData.contractNumber);
    
    // Додаємо дані виконавця (якщо є колонки для них)
    const totalColumns = sheet.getLastColumn();
    Logger.log('Загальна кількість колонок:', totalColumns);
    
    if (totalColumns >= 10) {
      sheet.getRange(lastRow, 10).setValue(performerData.fullName || ''); // J - Повна назва виконавця
    }
    if (totalColumns >= 11) {
      sheet.getRange(lastRow, 11).setValue(performerData.edrpou || '');    // K - ЄДРПОУ виконавця
    }
    if (totalColumns >= 12) {
      sheet.getRange(lastRow, 12).setValue(performerData.address || '');  // L - Адреса виконавця
    }
    if (totalColumns >= 13) {
      sheet.getRange(lastRow, 13).setValue(performerData.type || '');     // M - Тип організації
    }
    if (totalColumns >= 14) {
      sheet.getRange(lastRow, 14).setValue(performerData.phone || '');    // N - Телефон
    }
    if (totalColumns >= 15) {
      sheet.getRange(lastRow, 15).setValue(performerData.email || '');    // O - Email
    }
    if (totalColumns >= 16) {
      sheet.getRange(lastRow, 16).setValue(performerData.bankDetails || ''); // P - Банківські реквізити
    }
    if (totalColumns >= 17) {
      sheet.getRange(lastRow, 17).setValue(performerData.director || ''); // Q - Керівник виконавця
    }
    if (totalColumns >= 18) {
      sheet.getRange(lastRow, 18).setValue(CONFIG.CONTRACT_STATUS.DRAFT); // R - Статус
    }
    if (totalColumns >= 21) {
      sheet.getRange(lastRow, 21).setValue(new Date()); // U - Дата створення
    }
    
    Logger.log('✅ Останню строку успішно оновлено');
    
  } catch (error) {
    Logger.log('❌ Помилка оновлення строки:', error.toString());
    throw error;
  }
}

/**
 * Додавання даних до Google Sheets (резервна функція)
 */
function addToSpreadsheet(formData) {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
  
  // Отримуємо дані виконавця з довідника
  const performerData = getPerformerData(formData.performer);
  
  const rowData = [
    formData.contractNumber,        // A - Номер договору
    formData.timestamp,             // B - Timestamp
    formData.client,                // C - Клієнт
    formData.activityType,          // D - Вид діяльності
    formData.director,              // E - Директор/Керівник
    formData.edrpou,                // F - ЄДРПОУ замовника
    formData.description,           // G - Опис
    formData.amount,                // H - Вартість
    formData.performer,             // I - Виконавець (назва)
    performerData.fullName || '',   // J - Повна назва виконавця
    performerData.edrpou || '',     // K - ЄДРПОУ виконавця
    performerData.address || '',    // L - Адреса виконавця
    performerData.type || '',       // M - Тип організації виконавця
    performerData.phone || '',      // N - Телефон виконавця
    performerData.email || '',      // O - Email виконавця
    performerData.bankDetails || '', // P - Банківські реквізити
    performerData.director || '',   // Q - Керівник виконавця
    CONFIG.CONTRACT_STATUS.DRAFT,   // R - Статус
    '',                             // S - Посилання на папку
    '',                             // T - Посилання на договір
    new Date()                      // U - Дата створення
  ];
  
  sheet.appendRow(rowData);
}

/**
 * Отримання даних виконавця з довідника
 */
function getPerformerData(performerName) {
  try {
    // Використовуємо нову функцію з performers-management.gs
    const performer = getPerformerByName(performerName);
    
    if (performer) {
      return {
        fullName: performer.fullName,
        edrpou: performer.edrpou,
        address: performer.address,
        type: performer.type,
        phone: performer.phone,
        email: performer.email,
        bankDetails: performer.bankDetails,
        director: performer.director
      };
    }
  } catch (error) {
    Logger.log('❌ Помилка отримання даних виконавця:', error.toString());
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
    // Отримуємо повні дані виконавця
    const performerData = getPerformerData(formData.performer);
    
    // Конвертуємо суму в слова
    const amountNumber = parseFloat(formData.amount) || 0;
    const amountWords = amountToWords(amountNumber);
    
    // Замінюємо плейсхолдери на реальні дані
    const replacements = {
      '{{CONTRACT_NUMBER}}': formData.contractNumber,
      '{{CLIENT_NAME}}': formData.client,
      '{{ACTIVITY_TYPE}}': formData.activityType,
      '{{DIRECTOR_NAME}}': formData.director,
      '{{CLIENT_EDRPOU}}': formData.edrpou,
      '{{DESCRIPTION}}': formData.description,
      '{{AMOUNT}}': formData.amount,
      '{{AMOUNT_WORDS}}': amountWords,
      '{{PERFORMER}}': formData.performer,
      '{{PERFORMER_FULL_NAME}}': performerData.fullName || formData.performer,
      '{{PERFORMER_EDRPOU}}': performerData.edrpou || '',
      '{{PERFORMER_ADDRESS}}': performerData.address || '',
      '{{PERFORMER_TYPE}}': performerData.type || '',
      '{{PERFORMER_PHONE}}': performerData.phone || '',
      '{{PERFORMER_EMAIL}}': performerData.email || '',
      '{{PERFORMER_BANK_DETAILS}}': performerData.bankDetails || '',
      '{{PERFORMER_DIRECTOR}}': performerData.director || '',
      '{{DATE}}': Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd.MM.yyyy'),
      '{{YEAR}}': new Date().getFullYear().toString()
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
  Logger.log('=== ОНОВЛЕННЯ ПОСИЛАНЬ ===');
  Logger.log('Номер договору:', contractNumber);
  
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
  const lastRow = sheet.getLastRow();
  const totalColumns = sheet.getLastColumn();
  
  Logger.log('Останній рядок:', lastRow);
  Logger.log('Загальна кількість колонок:', totalColumns);
  
  // Оновлюємо останній рядок (який щойно був оновлений з номером договору)
  try {
    if (totalColumns >= 19) {
      sheet.getRange(lastRow, 19).setValue(folderUrl); // Колонка S - Посилання на папку
      Logger.log('✅ Посилання на папку додано');
    }
    if (totalColumns >= 20) {
      sheet.getRange(lastRow, 20).setValue(contractUrl); // Колонка T - Посилання на договір
      Logger.log('✅ Посилання на договір додано');
    }
    if (totalColumns >= 18) {
      sheet.getRange(lastRow, 18).setValue(CONFIG.CONTRACT_STATUS.ACTIVE); // Колонка R - Статус
      Logger.log('✅ Статус оновлено на АКТИВНИЙ');
    }
    
    Logger.log('✅ Всі посилання успішно оновлено');
    
  } catch (error) {
    Logger.log('❌ Помилка оновлення посилань:', error.toString());
    
    // Резервний метод - шукаємо по номеру договору
    Logger.log('Пробуємо резервний метод пошуку...');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === contractNumber) {
        Logger.log(`Знайдено договір в рядку ${i + 1}`);
        
        if (totalColumns >= 19) {
          sheet.getRange(i + 1, 19).setValue(folderUrl);
        }
        if (totalColumns >= 20) {
          sheet.getRange(i + 1, 20).setValue(contractUrl);
        }
        if (totalColumns >= 18) {
          sheet.getRange(i + 1, 18).setValue(CONFIG.CONTRACT_STATUS.ACTIVE);
        }
        
        Logger.log('✅ Посилання оновлено резервним методом');
        break;
      }
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

/**
 * Конвертація числа в слова (сума прописом)
 */
function numberToWords(number) {
  const units = ['', 'один', 'два', 'три', 'чотири', 'п\'ять', 'шість', 'сім', 'вісім', 'дев\'ять'];
  const teens = ['десять', 'одинадцять', 'дванадцять', 'тринадцять', 'чотирнадцять', 'п\'ятнадцять', 'шістнадцять', 'сімнадцять', 'вісімнадцять', 'дев\'ятнадцять'];
  const tens = ['', '', 'двадцять', 'тридцять', 'сорок', 'п\'ятдесят', 'шістдесят', 'сімдесят', 'вісімдесят', 'дев\'яносто'];
  const hundreds = ['', 'сто', 'двісті', 'триста', 'чотириста', 'п\'ятсот', 'шістсот', 'сімсот', 'вісімсот', 'дев\'ятсот'];
  
  const thousandsNames = ['', 'тисяча', 'тисячі', 'тисяч'];
  const millionsNames = ['', 'мільйон', 'мільйони', 'мільйонів'];
  
  function convertGroup(num, group) {
    if (num === 0) return '';
    
    let result = '';
    
    // Сотні
    if (num >= 100) {
      result += hundreds[Math.floor(num / 100)] + ' ';
      num %= 100;
    }
    
    // Десятки та одиниці
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
      if (num > 0) {
        result += units[num] + ' ';
      }
    } else if (num >= 10) {
      result += teens[num - 10] + ' ';
    } else if (num > 0) {
      result += units[num] + ' ';
    }
    
    // Додаємо назву групи
    if (group === 'thousands') {
      if (num === 1) result += thousandsNames[1] + ' ';
      else if (num >= 2 && num <= 4) result += thousandsNames[2] + ' ';
      else result += thousandsNames[3] + ' ';
    } else if (group === 'millions') {
      if (num === 1) result += millionsNames[1] + ' ';
      else if (num >= 2 && num <= 4) result += millionsNames[2] + ' ';
      else result += millionsNames[3] + ' ';
    }
    
    return result;
  }
  
  // Розбиваємо число на частини
  const millionsPart = Math.floor(number / 1000000);
  const thousandsPart = Math.floor((number % 1000000) / 1000);
  const remainder = number % 1000;
  
  let result = '';
  
  if (millionsPart > 0) {
    result += convertGroup(millionsPart, 'millions');
  }
  
  if (thousandsPart > 0) {
    result += convertGroup(thousandsPart, 'thousands');
  }
  
  if (remainder > 0) {
    result += convertGroup(remainder, '');
  }
  
  return result.trim();
}

/**
 * Конвертація суми в гривні прописом
 */
function amountToWords(amount) {
  if (amount === 0) return 'нуль гривень';
  
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  
  let result = numberToWords(integerPart);
  
  // Додаємо "гривень/гривні/гривня"
  const lastDigit = integerPart % 10;
  const lastTwoDigits = integerPart % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    result += ' гривень';
  } else if (lastDigit === 1) {
    result += ' гривня';
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    result += ' гривні';
  } else {
    result += ' гривень';
  }
  
  // Додаємо копійки
  if (decimalPart > 0) {
    result += ' ' + numberToWords(decimalPart);
    
    const lastDigitKop = decimalPart % 10;
    const lastTwoDigitsKop = decimalPart % 100;
    
    if (lastTwoDigitsKop >= 11 && lastTwoDigitsKop <= 19) {
      result += ' копійок';
    } else if (lastDigitKop === 1) {
      result += ' копійка';
    } else if (lastDigitKop >= 2 && lastDigitKop <= 4) {
      result += ' копійки';
    } else {
      result += ' копійок';
    }
  }
  
  return result;
}

/**
 * Ініціалізація заголовків таблиці договорів
 */
function initializeContractsSheet() {
  Logger.log('=== ІНІЦІАЛІЗАЦІЯ ЗАГОЛОВКІВ ТАБЛИЦІ ДОГОВОРІВ ===');
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const contractsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.CONTRACTS);
    
    if (contractsSheet === null) {
      Logger.log('❌ Вкладка договорів не знайдена');
      throw new Error('Вкладка договорів не знайдена');
    }
    
    // Заголовки колонок
    const headers = [
      'Номер договору',
      'Timestamp',
      'Клієнт',
      'Вид діяльності',
      'Директор/Керівник',
      'ЄДРПОУ замовника',
      'Опис',
      'Вартість',
      'Виконавець',
      'Повна назва виконавця',
      'ЄДРПОУ виконавця',
      'Адреса виконавця',
      'Тип організації виконавця',
      'Телефон виконавця',
      'Email виконавця',
      'Банківські реквізити',
      'Керівник виконавця',
      'Статус',
      'Посилання на папку',
      'Посилання на договір',
      'Дата створення'
    ];
    
    // Встановлюємо заголовки
    contractsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Форматування заголовків
    const headerRange = contractsSheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#34a853');
    headerRange.setFontColor('white');
    
    // Встановлюємо ширину колонок
    contractsSheet.setColumnWidth(1, 150);  // Номер договору
    contractsSheet.setColumnWidth(2, 150);  // Timestamp
    contractsSheet.setColumnWidth(3, 250);  // Клієнт
    contractsSheet.setColumnWidth(4, 200);  // Вид діяльності
    contractsSheet.setColumnWidth(5, 200);  // Директор/Керівник
    contractsSheet.setColumnWidth(6, 120);  // ЄДРПОУ замовника
    contractsSheet.setColumnWidth(7, 300);  // Опис
    contractsSheet.setColumnWidth(8, 120);  // Вартість
    contractsSheet.setColumnWidth(9, 200);  // Виконавець
    contractsSheet.setColumnWidth(10, 300); // Повна назва виконавця
    contractsSheet.setColumnWidth(11, 120); // ЄДРПОУ виконавця
    contractsSheet.setColumnWidth(12, 400); // Адреса виконавця
    contractsSheet.setColumnWidth(13, 150); // Тип організації виконавця
    contractsSheet.setColumnWidth(14, 150); // Телефон виконавця
    contractsSheet.setColumnWidth(15, 200); // Email виконавця
    contractsSheet.setColumnWidth(16, 400); // Банківські реквізити
    contractsSheet.setColumnWidth(17, 200); // Керівник виконавця
    contractsSheet.setColumnWidth(18, 120); // Статус
    contractsSheet.setColumnWidth(19, 300); // Посилання на папку
    contractsSheet.setColumnWidth(20, 300); // Посилання на договір
    contractsSheet.setColumnWidth(21, 120); // Дата створення
    
    Logger.log('✅ Заголовки таблиці договорів успішно ініціалізовані');
    
  } catch (error) {
    Logger.log('❌ Помилка ініціалізації заголовків таблиці:', error.toString());
    throw error;
  }
}

/**
 * Повна ініціалізація системи
 */
function initializeSystem() {
  Logger.log('=== ПОВНА ІНІЦІАЛІЗАЦІЯ СИСТЕМИ ===');
  
  try {
    // 1. Ініціалізуємо вкладку виконавців
    Logger.log('Крок 1: Ініціалізація вкладки виконавців...');
    initializePerformersSheet();
    
    // 2. Ініціалізуємо заголовки таблиці договорів
    Logger.log('Крок 2: Ініціалізація заголовків таблиці договорів...');
    initializeContractsSheet();
    
    // 3. Тестуємо доступ до шаблонів
    Logger.log('Крок 3: Перевірка доступу до шаблонів...');
    testTemplateAccess();
    
    Logger.log('✅ Система успішно ініціалізована!');
    
    // Відправляємо повідомлення про успішну ініціалізацію
    sendQuickTelegramMessage('✅ Система автоматизації договорів успішно ініціалізована!\n\n📋 Вкладка "Виконавці" створена з базовими даними\n📊 Таблиця договорів оновлена з новими колонками\n📄 Доступ до шаблонів перевірено');
    
  } catch (error) {
    Logger.log('❌ Помилка ініціалізації системи:', error.toString());
    sendQuickTelegramMessage(`❌ Помилка ініціалізації системи:\n${error.toString()}`);
    throw error;
  }
}