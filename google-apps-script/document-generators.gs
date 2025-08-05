/**
 * Генератори додаткових документів
 * БЕЗ дублікатів функцій з main.gs
 */

/**
 * Генерація рахунку для договору
 */
function generateInvoice(contractNumber) {
  try {
    Logger.log('=== ГЕНЕРАЦІЯ РАХУНКУ ===');
    Logger.log('Договір:', contractNumber);
    
    // Отримуємо дані договору
    const contractData = getContractData(contractNumber);
    if (!contractData) {
      throw new Error(`Договір ${contractNumber} не знайдено`);
    }
    
    // Генеруємо номер рахунку
    const invoiceNumber = generateInvoiceNumber();
    Logger.log('Номер рахунку:', invoiceNumber);
    
    // Копіюємо шаблон рахунку
    const template = DriveApp.getFileById(CONFIG.TEMPLATES.INVOICE);
    const folder = DriveApp.getFolderById(extractFolderIdFromUrl(contractData.folderUrl));
    
    const fileName = `Рахунок_${invoiceNumber}_${contractData.client}`;
    const invoiceCopy = template.makeCopy(fileName, folder);
    
    // Заповнюємо рахунок
    const doc = DocumentApp.openById(invoiceCopy.getId());
    const body = doc.getBody();
    
    // Розрахунки для ПДВ
    const amountNumber = parseFloat(contractData.amount) || 0;
    const amountWithoutVAT = Math.round(amountNumber / 1.2);
    const vatAmount = amountNumber - amountWithoutVAT;
    
    const replacements = {
      '{{INVOICE_NUMBER}}': invoiceNumber,
      '{{DATE}}': Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd.MM.yyyy'),
      '{{CONTRACT_NUMBER}}': contractData.contractNumber,
      '{{CONTRACT_DATE}}': contractData.contractDate,
      '{{CLIENT_NAME}}': contractData.client,
      '{{CLIENT_EDRPOU}}': contractData.edrpou,
      '{{CLIENT_ADDRESS}}': contractData.clientAddress || 'Адреса не вказана',
      '{{PERFORMER}}': contractData.performer,
      '{{PERFORMER_FULL_NAME}}': contractData.performerFullName || contractData.performer,
      '{{PERFORMER_EDRPOU}}': contractData.performerEdrpou || '',
      '{{PERFORMER_ADDRESS}}': contractData.performerAddress || '',
      '{{PERFORMER_DIRECTOR}}': contractData.performerDirector || 'Директор',
      '{{BANK_DETAILS}}': contractData.bankDetails || 'Банківські реквізити',
      '{{DESCRIPTION}}': contractData.description,
      '{{AMOUNT_WITHOUT_VAT}}': amountWithoutVAT.toFixed(2),
      '{{VAT_AMOUNT}}': vatAmount.toFixed(2),
      '{{TOTAL_AMOUNT}}': amountNumber.toFixed(2),
      '{{TOTAL_AMOUNT_WORDS}}': numberToWords(amountNumber)
    };
    
    // Виконуємо заміни
    for (const [placeholder, value] of Object.entries(replacements)) {
      body.replaceText(placeholder, value || '');
    }
    
    doc.saveAndClose();
    
    // Оновлюємо таблицю
    updateContractWithInvoice(contractNumber, invoiceNumber, invoiceCopy.getUrl());
    
    Logger.log('✅ Рахунок створено:', invoiceNumber);
    return {
      invoiceNumber: invoiceNumber,
      url: invoiceCopy.getUrl(),
      fileName: fileName
    };
    
  } catch (error) {
    Logger.error('❌ Помилка створення рахунку:', error);
    throw error;
  }
}

/**
 * Генерація акту виконаних робіт
 */
function generateAct(contractNumber) {
  try {
    Logger.log('=== ГЕНЕРАЦІЯ АКТУ ===');
    Logger.log('Договір:', contractNumber);
    
    // Отримуємо дані договору
    const contractData = getContractData(contractNumber);
    if (!contractData) {
      throw new Error(`Договір ${contractNumber} не знайдено`);
    }
    
    // Генеруємо номер акту
    const actNumber = generateActNumber();
    Logger.log('Номер акту:', actNumber);
    
    // Копіюємо шаблон акту
    const template = DriveApp.getFileById(CONFIG.TEMPLATES.ACT);
    const folder = DriveApp.getFolderById(extractFolderIdFromUrl(contractData.folderUrl));
    
    const fileName = `Акт_${actNumber}_${contractData.client}`;
    const actCopy = template.makeCopy(fileName, folder);
    
    // Заповнюємо акт
    const doc = DocumentApp.openById(actCopy.getId());
    const body = doc.getBody();
    
    const replacements = {
      '{{ACT_NUMBER}}': actNumber,
      '{{DATE}}': Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd.MM.yyyy'),
      '{{CONTRACT_NUMBER}}': contractData.contractNumber,
      '{{CONTRACT_DATE}}': contractData.contractDate,
      '{{CLIENT_NAME}}': contractData.client,
      '{{CLIENT_EDRPOU}}': contractData.edrpou,
      '{{DIRECTOR_NAME}}': contractData.director,
      '{{PERFORMER}}': contractData.performer,
      '{{PERFORMER_FULL_NAME}}': contractData.performerFullName || contractData.performer,
      '{{PERFORMER_EDRPOU}}': contractData.performerEdrpou || '',
      '{{PERFORMER_DIRECTOR}}': contractData.performerDirector || 'Директор',
      '{{PERFORMER_BASIS}}': contractData.performerBasis || 'Статуту',
      '{{DESCRIPTION}}': contractData.description,
      '{{AMOUNT}}': contractData.amount,
      '{{AMOUNT_WORDS}}': numberToWords(parseFloat(contractData.amount) || 0)
    };
    
    // Виконуємо заміни
    for (const [placeholder, value] of Object.entries(replacements)) {
      body.replaceText(placeholder, value || '');
    }
    
    doc.saveAndClose();
    
    // Оновлюємо таблицю
    updateContractWithAct(contractNumber, actNumber, actCopy.getUrl());
    
    Logger.log('✅ Акт створено:', actNumber);
    return {
      actNumber: actNumber,
      url: actCopy.getUrl(),
      fileName: fileName
    };
    
  } catch (error) {
    Logger.error('❌ Помилка створення акту:', error);
    throw error;
  }
}

/**
 * Отримання даних договору з таблиці
 */
function getContractData(contractNumber) {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
  const data = sheet.getDataRange().getValues();
  
  // Знаходимо договір за номером
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === contractNumber) {
      return {
        contractNumber: data[i][0],
        timestamp: data[i][1],
        client: data[i][2],
        activityType: data[i][3],
        director: data[i][4],
        edrpou: data[i][5],
        description: data[i][6],
        amount: data[i][7],
        performer: data[i][8],
        performerFullName: data[i][9],
        performerEdrpou: data[i][10],
        performerAddress: data[i][11],
        status: data[i][12],
        folderUrl: data[i][13],
        contractUrl: data[i][14],
        contractDate: data[i][15] ? Utilities.formatDate(data[i][15], Session.getScriptTimeZone(), 'dd.MM.yyyy') : '',
        // Додаткові поля для документів
        performerDirector: 'Директор', // Можна додати в таблицю
        bankDetails: 'р/р: 00000000000000000000, МФО: 000000, Банк', // Можна додати в таблицю
        performerBasis: 'Статуту',
        clientAddress: '' // Можна додати в таблицю
      };
    }
  }
  
  return null;
}

/**
 * Генерація номера рахунку
 */
function generateInvoiceNumber() {
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  
  // Генеруємо послідовний номер
  const sequence = getNextSequenceNumber('INVOICE');
  
  return `INV-${year}${month}-${sequence.toString().padStart(3, '0')}`;
}

/**
 * Генерація номера акту
 */
function generateActNumber() {
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  
  // Генеруємо послідовний номер
  const sequence = getNextSequenceNumber('ACT');
  
  return `ACT-${year}${month}-${sequence.toString().padStart(3, '0')}`;
}

/**
 * Отримання наступного послідовного номера
 */
function getNextSequenceNumber(type) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.SETTINGS);
    const data = sheet.getDataRange().getValues();
    
    const paramName = `Останній номер ${type.toLowerCase()}`;
    let currentNumber = 1;
    let rowIndex = -1;
    
    // Шукаємо параметр
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === paramName) {
        currentNumber = (data[i][1] || 0) + 1;
        rowIndex = i + 1;
        break;
      }
    }
    
    // Якщо параметр не знайдено, додаємо новий рядок
    if (rowIndex === -1) {
      sheet.appendRow([paramName, currentNumber]);
    } else {
      sheet.getRange(rowIndex, 2).setValue(currentNumber);
    }
    
    return currentNumber;
    
  } catch (error) {
    Logger.log('Помилка отримання послідовного номера:', error);
    // Повертаємо номер на основі часу як запасний варіант
    return Math.floor(Math.random() * 999) + 1;
  }
}

/**
 * Оновлення договору з інформацією про рахунок
 */
function updateContractWithInvoice(contractNumber, invoiceNumber, invoiceUrl) {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === contractNumber) {
      // Додаємо колонки для рахунків (якщо немає)
      const lastColumn = sheet.getLastColumn();
      if (lastColumn < 17) {
        sheet.getRange(1, 16).setValue('Номер рахунку');
        sheet.getRange(1, 17).setValue('Посилання на рахунок');
      }
      
      sheet.getRange(i + 1, 16).setValue(invoiceNumber);
      sheet.getRange(i + 1, 17).setValue(invoiceUrl);
      break;
    }
  }
}

/**
 * Оновлення договору з інформацією про акт
 */
function updateContractWithAct(contractNumber, actNumber, actUrl) {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === contractNumber) {
      // Додаємо колонки для актів (якщо немає)
      const lastColumn = sheet.getLastColumn();
      if (lastColumn < 19) {
        sheet.getRange(1, 18).setValue('Номер акту');
        sheet.getRange(1, 19).setValue('Посилання на акт');
      }
      
      sheet.getRange(i + 1, 18).setValue(actNumber);
      sheet.getRange(i + 1, 19).setValue(actUrl);
      
      // Змінюємо статус на "Виконаний"
      sheet.getRange(i + 1, 13).setValue(CONFIG.CONTRACT_STATUS.COMPLETED);
      break;
    }
  }
}

/**
 * Конвертація числа в слова (спрощена версія для української)
 */
function numberToWords(number) {
  if (number === 0) return 'нуль';
  
  const ones = ['', 'одна', 'дві', 'три', 'чотири', 'п\'ять', 'шість', 'сім', 'вісім', 'дев\'ять'];
  const tens = ['', '', 'двадцять', 'тридцять', 'сорок', 'п\'ятдесят', 'шістдесят', 'сімдесят', 'вісімдесят', 'дев\'яносто'];
  const hundreds = ['', 'сто', 'двісті', 'триста', 'чотириста', 'п\'ятсот', 'шістсот', 'сімсот', 'вісімсот', 'дев\'ятсот'];
  const teens = ['десять', 'одинадцять', 'дванадцять', 'тринадцять', 'чотирнадцять', 'п\'ятнадцять', 'шістнадцять', 'сімнадцять', 'вісімнадцять', 'дев\'ятнадцять'];
  
  let result = '';
  const num = Math.floor(number);
  
  // Мільйони
  if (num >= 1000000) {
    const millions = Math.floor(num / 1000000);
    result += numberToWords(millions) + ' мільйон';
    if (millions > 1 && millions < 5) result += 'и';
    else if (millions >= 5) result += 'ів';
    result += ' ';
  }
  
  // Тисячі
  const remainder = num % 1000000;
  if (remainder >= 1000) {
    const thousands = Math.floor(remainder / 1000);
    result += numberToWords(thousands) + ' тисяч';
    result += ' ';
  }
  
  // Сотні, десятки, одиниці
  const lastThreeDigits = num % 1000;
  const h = Math.floor(lastThreeDigits / 100);
  const t = Math.floor((lastThreeDigits % 100) / 10);
  const o = lastThreeDigits % 10;
  
  if (h > 0) result += hundreds[h] + ' ';
  if (t > 1) result += tens[t] + ' ';
  if (t === 1) {
    result += teens[o] + ' ';
  } else if (o > 0) {
    result += ones[o] + ' ';
  }
  
  return result.trim();
}

/**
 * Функції для роботи з Telegram Bot API з Google Apps Script
 */
function triggerTelegramInvoiceGeneration(contractNumber) {
  try {
    Logger.log('Генерація рахунку через Telegram для договору:', contractNumber);
    const result = generateInvoice(contractNumber);
    
    const message = `✅ Рахунок успішно створено!

📄 Номер: ${result.invoiceNumber}
📋 Договір: ${contractNumber}
🔗 Документ: ${result.url}

⏰ Час: ${new Date().toLocaleString()}`;
    
    sendTelegramMessage(message);
    
    return result;
  } catch (error) {
    const errorMessage = `❌ Помилка створення рахунку для договору ${contractNumber}:

${error.toString()}

⏰ Час: ${new Date().toLocaleString()}`;
    sendTelegramMessage(errorMessage);
    throw error;
  }
}

function triggerTelegramActGeneration(contractNumber) {
  try {
    Logger.log('Генерація акту через Telegram для договору:', contractNumber);
    const result = generateAct(contractNumber);
    
    const message = `✅ Акт виконаних робіт успішно створено!

📄 Номер: ${result.actNumber}
📋 Договір: ${contractNumber}
🔗 Документ: ${result.url}

⏰ Час: ${new Date().toLocaleString()}`;
    
    sendTelegramMessage(message);
    
    return result;
  } catch (error) {
    const errorMessage = `❌ Помилка створення акту для договору ${contractNumber}:

${error.toString()}

⏰ Час: ${new Date().toLocaleString()}`;
    sendTelegramMessage(errorMessage);
    throw error;
  }
}

function sendTelegramMessage(text) {
  if (!CONFIG.TELEGRAM.CHAT_ID) {
    Logger.log('Chat ID не налаштовано');
    return;
  }
  
  const payload = {
    chat_id: CONFIG.TELEGRAM.CHAT_ID,
    text: text,
    parse_mode: 'HTML'
  };
  
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
  
  try {
    UrlFetchApp.fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`, options);
  } catch (error) {
    Logger.error('Помилка відправки в Telegram:', error);
  }
}

/**
 * Тестові функції
 */
function testInvoiceGeneration() {
  Logger.log('=== ТЕСТ ГЕНЕРАЦІЇ РАХУНКУ ===');
  
  // Знаходимо перший активний договір для тестування
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { // Якщо є номер договору
      const contractNumber = data[i][0];
      Logger.log('Тестування з договором:', contractNumber);
      
      try {
        const result = generateInvoice(contractNumber);
        Logger.log('✅ Тест успішний:', result);
        return result;
      } catch (error) {
        Logger.error('❌ Тест неуспішний:', error);
        return null;
      }
    }
  }
  
  Logger.log('❌ Не знайдено договорів для тестування');
}

function testActGeneration() {
  Logger.log('=== ТЕСТ ГЕНЕРАЦІЇ АКТУ ===');
  
  // Знаходимо перший активний договір для тестування
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEETS.CONTRACTS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { // Якщо є номер договору
      const contractNumber = data[i][0];
      Logger.log('Тестування з договором:', contractNumber);
      
      try {
        const result = generateAct(contractNumber);
        Logger.log('✅ Тест успішний:', result);
        return result;
      } catch (error) {
        Logger.error('❌ Тест неуспішний:', error);
        return null;
      }
    }
  }
  
  Logger.log('❌ Не знайдено договорів для тестування');
}