/**
 * Тестова функція для перевірки системи
 * Test function for system verification
 */

/**
 * Тест створення договору з тестовими даними
 */
function testCreateContract() {
  Logger.log('=== ТЕСТ СТВОРЕННЯ ДОГОВОРУ ===');
  
  // Тестові дані
  const testFormData = {
    contractNumber: 'TEST-001',
    timestamp: new Date(),
    client: 'ТОВ "Тестова Компанія"',
    activityType: 'IT послуги',
    director: 'Іваненко Іван Іванович',
    edrpou: '12345678',
    description: 'Розробка веб-сайту та мобільного додатку',
    amount: '75000',
    performer: 'IT Company LLC'
  };
  
  try {
    Logger.log('Крок 1: Генерація номера договору...');
    const contractNumber = generateContractNumber();
    testFormData.contractNumber = contractNumber;
    Logger.log('✅ Номер згенеровано:', contractNumber);
    
    Logger.log('Крок 2: Додавання до таблиці...');
    addToSpreadsheet(testFormData);
    Logger.log('✅ Додано до таблиці');
    
    Logger.log('Крок 3: Створення папки...');
    const folderUrl = createFolderStructure(testFormData);
    Logger.log('✅ Папка створена:', folderUrl);
    
    Logger.log('Крок 4: Генерація договору...');
    const contractUrl = generateContract(testFormData, folderUrl);
    Logger.log('✅ Договір створено:', contractUrl);
    
    Logger.log('Крок 5: Оновлення таблиці з посиланнями...');
    updateSpreadsheetWithLinks(testFormData.contractNumber, folderUrl, contractUrl);
    Logger.log('✅ Таблиця оновлена');
    
    Logger.log('Крок 6: Відправка Telegram сповіщення...');
    sendTelegramNotification(testFormData, contractUrl);
    Logger.log('✅ Сповіщення відправлено');
    
    Logger.log('🎉 ТЕСТ ПРОЙШОВ УСПІШНО!');
    Logger.log(`📋 Номер тестового договору: ${testFormData.contractNumber}`);
    
    return {
      success: true,
      contractNumber: testFormData.contractNumber,
      folderUrl: folderUrl,
      contractUrl: contractUrl
    };
    
  } catch (error) {
    Logger.log('❌ ПОМИЛКА В ТЕСТІ:', error.toString());
    Logger.log('Stack trace:', error.stack);
    
    // Відправляємо повідомлення про помилку в Telegram
    sendQuickTelegramMessage(`❌ Помилка в тесті створення договору:\n${error.toString()}`);
    
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Швидкий тест підключення до Telegram
 */
function testTelegramConnection() {
  Logger.log('=== ТЕСТ ПІДКЛЮЧЕННЯ ДО TELEGRAM ===');
  
  try {
    const testMessage = `🧪 Тест підключення до Telegram\n\n⏰ Час: ${new Date().toLocaleString()}\n✅ Система працює!`;
    
    sendQuickTelegramMessage(testMessage);
    
    Logger.log('✅ Telegram повідомлення відправлено успішно');
    return true;
    
  } catch (error) {
    Logger.log('❌ Помилка підключення до Telegram:', error.toString());
    return false;
  }
}

/**
 * Тест ініціалізації системи
 */
function testSystemInitialization() {
  Logger.log('=== ТЕСТ ІНІЦІАЛІЗАЦІЇ СИСТЕМИ ===');
  
  try {
    // Ініціалізуємо систему
    initializeSystem();
    
    Logger.log('✅ Система успішно ініціалізована');
    return true;
    
  } catch (error) {
    Logger.log('❌ Помилка ініціалізації:', error.toString());
    return false;
  }
}

/**
 * Повний тест системи
 */
function runFullSystemTest() {
  Logger.log('=== ПОВНИЙ ТЕСТ СИСТЕМИ ===');
  
  const results = {
    telegram: false,
    initialization: false,
    contractCreation: false
  };
  
  try {
    // Тест 1: Telegram
    Logger.log('Тест 1: Підключення до Telegram...');
    results.telegram = testTelegramConnection();
    
    // Тест 2: Ініціалізація
    Logger.log('Тест 2: Ініціалізація системи...');
    results.initialization = testSystemInitialization();
    
    // Тест 3: Створення договору
    Logger.log('Тест 3: Створення договору...');
    const contractTest = testCreateContract();
    results.contractCreation = contractTest.success;
    
    // Підсумок
    const allPassed = results.telegram && results.initialization && results.contractCreation;
    
    const summary = `
🧪 РЕЗУЛЬТАТИ ТЕСТУВАННЯ СИСТЕМИ:

✅ Telegram: ${results.telegram ? 'ПРАЦЮЄ' : '❌ ПОМИЛКА'}
✅ Ініціалізація: ${results.initialization ? 'ПРАЦЮЄ' : '❌ ПОМИЛКА'}  
✅ Створення договору: ${results.contractCreation ? 'ПРАЦЮЄ' : '❌ ПОМИЛКА'}

${allPassed ? '🎉 ВСІ ТЕСТИ ПРОЙШЛИ УСПІШНО!' : '⚠️ Є проблеми, перевірте логи'}

⏰ Час тестування: ${new Date().toLocaleString()}
    `;
    
    Logger.log(summary);
    sendQuickTelegramMessage(summary);
    
    return {
      allPassed: allPassed,
      results: results
    };
    
  } catch (error) {
    Logger.log('❌ КРИТИЧНА ПОМИЛКА В ТЕСТУВАННІ:', error.toString());
    sendQuickTelegramMessage(`❌ Критична помилка в тестуванні:\n${error.toString()}`);
    
    return {
      allPassed: false,
      error: error.toString()
    };
  }
}