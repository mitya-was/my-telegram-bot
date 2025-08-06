#!/bin/bash

# Скрипт для деплою бота на сервер
echo "🚀 Початок деплою Contract Bot..."

# Створюємо папки для логів
mkdir -p logs

# Встановлюємо залежності
echo "📦 Встановлення залежностей..."
npm install

# Зупиняємо попередній процес якщо він існує
echo "🛑 Зупинка попереднього процесу..."
pm2 stop contract-bot 2>/dev/null || true
pm2 delete contract-bot 2>/dev/null || true

# Запускаємо бота через PM2
echo "🤖 Запуск бота через PM2..."
pm2 start ecosystem.config.js

# Зберігаємо конфігурацію PM2
echo "💾 Збереження конфігурації PM2..."
pm2 save

# Показуємо статус
echo "📊 Статус процесів:"
pm2 status

echo "✅ Деплой завершено!"
echo "📝 Логи: pm2 logs contract-bot"
echo "🛑 Зупинка: pm2 stop contract-bot"
echo "🔄 Перезапуск: pm2 restart contract-bot" 