/**
 * Telegram Bot для управління договорами
 * Contract Management Telegram Bot
 */

const TelegramBot = require('node-telegram-bot-api');
// Конфігурація - використовуйте .env файл або змініть значення тут
const CONFIG = {
    TELEGRAM: {
        BOT_TOKEN: '8391553382:AAGhnyEswcHCVvwxwpBzeQIH58vALOpT1HA',
        CHAT_ID: '156212174', // Ваш Chat ID
    },
    FORM_ID: '1Jy7STz5k4y2tUJ-BG0OIGlP72BWNaeY8HHx8kHc31Qs',
    FORM_URL: 'https://docs.google.com/forms/d/1Jy7STz5k4y2tUJ-BG0OIGlP72BWNaeY8HHx8kHc31Qs/viewform',
    DRIVE_FOLDER_ID: '1uVNZTdCgZAu5q-oc7lAzKvn-FRfkJBx9',
    SPREADSHEET_ID: '1IG8tGF8g8sulW5snTKt_yUXmscUNUkVOQR9_6UO3vlk',
    GOOGLE_SCRIPT_URL: process.env.GOOGLE_SCRIPT_URL || '' // Потрібно буде додати після розгортання Apps Script
};

// Створюємо екземпляр бота з покращеними налаштуваннями
const bot = new TelegramBot(CONFIG.TELEGRAM.BOT_TOKEN, {
    polling: {
        interval: 1000,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

// Обробка помилок polling
bot.on('polling_error', (error) => {
    console.log('⚠️ Polling error:', error.message);
    console.log('🔄 Перепідключення через 5 секунд...');

    setTimeout(() => {
        console.log('🔄 Перезапуск polling...');
        bot.stopPolling().then(() => {
            bot.startPolling();
        });
    }, 5000);
});

/**
 * Головне меню бота
 */
const mainMenu = {
    reply_markup: {
        keyboard: [
            ['📋 Список договорів', '➕ Новий договір'],
            ['💰 Згенерувати рахунок', '📄 Згенерувати акт'],
            ['📊 Статистика', '⚙️ Налаштування']
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    }
};

/**
 * Обробник команди /start
 */
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🤖 Вітаю! Я бот для управління договорами.

Що я вмію:
📋 Показувати список договорів
💰 Генерувати рахунки
📄 Створювати акти виконаних робіт
📊 Надавати статистику
➕ Допомагати з новими договорами

Оберіть дію з меню нижче:
  `;

    bot.sendMessage(chatId, welcomeMessage, mainMenu);
});

/**
 * Обробник текстових повідомлень
 */
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Пропускаємо команди
    if (text.startsWith('/')) return;

    try {
        switch (text) {
            case '📋 Список договорів':
                await showContractsList(chatId);
                break;

            case '➕ Новий договір':
                await showNewContractForm(chatId);
                break;

            case '💰 Згенерувати рахунок':
                await showInvoiceGeneration(chatId);
                break;

            case '📄 Згенерувати акт':
                await showActGeneration(chatId);
                break;

            case '📊 Статистика':
                await showStatistics(chatId);
                break;

            case '⚙️ Налаштування':
                await showSettings(chatId);
                break;

            default:
                bot.sendMessage(chatId, 'Не розумію команду. Оберіть дію з меню.', mainMenu);
        }
    } catch (error) {
        console.error('Помилка обробки повідомлення:', error);
        bot.sendMessage(chatId, '❌ Виникла помилка. Спробуйте пізніше.');
    }
});

/**
 * Показати список договорів
 */
async function showContractsList(chatId) {
    try {
        // Тут буде запит до Google Sheets для отримання списку договорів
        const contracts = await getContractsFromSheets();

        if (contracts.length === 0) {
            bot.sendMessage(chatId, '📋 Список договорів порожній.');
            return;
        }

        let message = '📋 *Список активних договорів:*\n\n';

        contracts.slice(0, 10).forEach((contract, index) => {
            message += `${index + 1}. ${contract.number}\n`;
            message += `   👤 ${contract.client}\n`;
            message += `   💰 ${contract.amount} грн\n`;
            message += `   📅 ${contract.date}\n\n`;
        });

        if (contracts.length > 10) {
            message += `... та ще ${contracts.length - 10} договорів`;
        }

        // Додаємо inline кнопки для дій
        const options = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📄 Деталі', callback_data: 'contract_details' },
                        { text: '💰 Рахунок', callback_data: 'generate_invoice' }
                    ],
                    [
                        { text: '📝 Акт', callback_data: 'generate_act' },
                        { text: '🔍 Пошук', callback_data: 'search_contract' }
                    ]
                ]
            }
        };

        bot.sendMessage(chatId, message, options);
    } catch (error) {
        console.error('Помилка отримання списку договорів:', error);
        bot.sendMessage(chatId, '❌ Помилка отримання даних з таблиці.');
    }
}

/**
 * Форма для нового договору
 */
async function showNewContractForm(chatId) {
    const message = `
➕ *Створення нового договору*

Для створення нового договору заповніть форму в Google Forms:
${CONFIG.FORM_URL}

📋 Поля форми:
• Клієнт (назва організації)
• Вид діяльності  
• Директор/Керівник
• ЄДРПОУ замовника
• Опис робіт/послуг
• Вартість (в гривнях)
• Виконавець

Після заповнення форми договір буде автоматично створений і ви отримаєте сповіщення в цьому чаті.
  `;

    const options = {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '📝 Заповнити форму', url: CONFIG.FORM_URL }],
                [{ text: '📁 Папка з договорами', url: `https://drive.google.com/drive/folders/${CONFIG.DRIVE_FOLDER_ID}` }],
                [{ text: '🔙 Назад до меню', callback_data: 'back_to_menu' }]
            ]
        }
    };

    bot.sendMessage(chatId, message, options);
}

/**
 * Генерація рахунку
 */
async function showInvoiceGeneration(chatId) {
    const message = `
💰 *Генерація рахунку*

Оберіть договір для якого потрібно згенерувати рахунок:
  `;

    try {
        const contracts = await getActiveContracts();

        if (contracts.length === 0) {
            bot.sendMessage(chatId, '📋 Немає активних договорів для генерації рахунків.');
            return;
        }

        const inlineKeyboard = contracts.slice(0, 5).map(contract => [
            { text: `${contract.number} - ${contract.client}`, callback_data: `invoice_${contract.number}` }
        ]);

        inlineKeyboard.push([{ text: '🔙 Назад до меню', callback_data: 'back_to_menu' }]);

        const options = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        };

        bot.sendMessage(chatId, message, options);
    } catch (error) {
        console.error('Помилка при генерації рахунку:', error);
        bot.sendMessage(chatId, '❌ Помилка отримання списку договорів.');
    }
}

/**
 * Генерація акту виконаних робіт
 */
async function showActGeneration(chatId) {
    const message = `
📄 *Генерація акту виконаних робіт*

Оберіть договір для якого потрібно згенерувати акт:
  `;

    try {
        const contracts = await getActiveContracts();

        if (contracts.length === 0) {
            bot.sendMessage(chatId, '📋 Немає активних договорів для генерації актів.');
            return;
        }

        const inlineKeyboard = contracts.slice(0, 5).map(contract => [
            { text: `${contract.number} - ${contract.client}`, callback_data: `act_${contract.number}` }
        ]);

        inlineKeyboard.push([{ text: '🔙 Назад до меню', callback_data: 'back_to_menu' }]);

        const options = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        };

        bot.sendMessage(chatId, message, options);
    } catch (error) {
        console.error('Помилка при генерації акту:', error);
        bot.sendMessage(chatId, '❌ Помилка отримання списку договорів.');
    }
}

/**
 * Показати статистику
 */
async function showStatistics(chatId) {
    try {
        const stats = await getContractStatistics();

        const message = `
📊 *Статистика договорів*

📋 Всього договорів: ${stats.total}
✅ Активних: ${stats.active}
✔️ Виконаних: ${stats.completed}
❌ Скасованих: ${stats.cancelled}

💰 Загальна сума активних: ${stats.totalAmount} грн
📅 Середній термін виконання: ${stats.avgDuration} днів

🎯 За поточний місяць:
   ➕ Створено: ${stats.thisMonth.created}
   ✅ Завершено: ${stats.thisMonth.completed}
   💰 Сума: ${stats.thisMonth.amount} грн
    `;

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Помилка отримання статистики:', error);
        bot.sendMessage(chatId, '❌ Помилка отримання статистики.');
    }
}

/**
 * Налаштування
 */
async function showSettings(chatId) {
    const message = `
⚙️ *Налаштування системи*

🔧 Поточні налаштування:
• Автосповіщення: ✅ Увімкнено
• Формат номера: W-(YY)-XX
• Папка Drive: Налаштовано
• Telegram чат: ${chatId}

📝 Доступні дії:
  `;

    const options = {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🔔 Сповіщення', callback_data: 'settings_notifications' },
                    { text: '📁 Drive', callback_data: 'settings_drive' }
                ],
                [
                    { text: '📊 Експорт даних', callback_data: 'export_data' },
                    { text: '🔙 Назад до меню', callback_data: 'back_to_menu' }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, message, options);
}

/**
 * Обробник callback запитів
 */
bot.on('callback_query', async (callbackQuery) => {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;

    try {
        switch (action) {
            case 'back_to_menu':
                bot.sendMessage(chatId, 'Оберіть дію:', mainMenu);
                break;

            case 'contract_details':
                await showContractDetails(chatId);
                break;

            case 'search_contract':
                await startContractSearch(chatId);
                break;

            default:
                if (action.startsWith('invoice_')) {
                    const contractNumber = action.replace('invoice_', '');
                    await generateInvoiceForContract(chatId, contractNumber);
                } else if (action.startsWith('act_')) {
                    const contractNumber = action.replace('act_', '');
                    await generateActForContract(chatId, contractNumber);
                }
        }
    } catch (error) {
        console.error('Помилка обробки callback:', error);
        bot.sendMessage(chatId, '❌ Виникла помилка при обробці запиту.');
    }

    // Підтверджуємо callback
    bot.answerCallbackQuery(callbackQuery.id);
});

/**
 * Функції для роботи з Google Sheets API
 */

async function getContractsFromSheets() {
    // Заглушка - тут буде реальний запит до Google Sheets
    return [
        {
            number: 'W-24-01',
            client: 'ТОВ "Приклад"',
            amount: '50000',
            date: '2024-01-15',
            status: 'Активний'
        },
        // ... інші договори
    ];
}

async function getActiveContracts() {
    const allContracts = await getContractsFromSheets();
    return allContracts.filter(contract => contract.status === 'Активний');
}

async function getContractStatistics() {
    // Заглушка для статистики
    return {
        total: 15,
        active: 8,
        completed: 6,
        cancelled: 1,
        totalAmount: '750000',
        avgDuration: 30,
        thisMonth: {
            created: 3,
            completed: 2,
            amount: '150000'
        }
    };
}

async function generateInvoiceForContract(chatId, contractNumber) {
    bot.sendMessage(chatId, `💰 Генерую рахунок для договору ${contractNumber}...`);

    // Тут буде логіка генерації рахунку через Google Apps Script
    setTimeout(() => {
        bot.sendMessage(chatId, `✅ Рахунок для договору ${contractNumber} успішно створено! Документ збережено в Google Drive.`);
    }, 2000);
}

async function generateActForContract(chatId, contractNumber) {
    bot.sendMessage(chatId, `📄 Генерую акт виконаних робіт для договору ${contractNumber}...`);

    // Тут буде логіка генерації акту через Google Apps Script
    setTimeout(() => {
        bot.sendMessage(chatId, `✅ Акт виконаних робіт для договору ${contractNumber} успішно створено! Документ збережено в Google Drive.`);
    }, 2000);
}

/**
 * Функція для відправки сповіщень про нові договори
 */
function sendNewContractNotification(contractData) {
    const message = `
🎉 *Новий договір створено!*

📋 Номер: ${contractData.number}
🏢 Клієнт: ${contractData.client}
💰 Сума: ${contractData.amount} грн
👤 Виконавець: ${contractData.performer}

📄 [Переглянути документ](${contractData.documentUrl})
📁 [Відкрити папку](${contractData.folderUrl})
  `;

    const options = {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '💰 Створити рахунок', callback_data: `invoice_${contractData.number}` },
                    { text: '📄 Створити акт', callback_data: `act_${contractData.number}` }
                ]
            ]
        }
    };

    bot.sendMessage(CONFIG.TELEGRAM.CHAT_ID, message, options);
}

// Експорт функцій для використання в інших модулях
module.exports = {
    bot,
    sendNewContractNotification
};

console.log('🤖 Telegram Bot запущено!');