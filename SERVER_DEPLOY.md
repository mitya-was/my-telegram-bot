# 🚀 ДЕПЛОЙ БОТА НА СЕРВЕР HETZNER

## 🎯 **ПЕРЕВАГИ ЗАПУСКУ НА СЕРВЕРІ:**

### ✅ **Надійність:**
- Бот працює 24/7 без перебоїв
- Автоматичний перезапуск при збоях
- Незалежність від локального комп'ютера

### ✅ **Моніторинг:**
- Логи та статистика роботи
- Сповіщення про помилки
- Легке управління через PM2

### ✅ **Безпека:**
- Токени зберігаються на сервері
- Захист від втрати даних
- Резервне копіювання

---

## 📋 **ПОКРОКОВІ ІНСТРУКЦІЇ:**

### **Крок 1: Підготовка сервера**

1. **Підключіться до сервера:**
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. **Встановіть Node.js та PM2:**
   ```bash
   # Оновлення системи
   apt update && apt upgrade -y
   
   # Встановлення Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs
   
   # Встановлення PM2
   npm install -g pm2
   ```

3. **Створіть папку для проекту:**
   ```bash
   mkdir -p /root/contract-automation
   cd /root/contract-automation
   ```

### **Крок 2: Завантаження коду**

1. **Клонуйте репозиторій:**
   ```bash
   git clone https://github.com/mitya-was/my-telegram-bot.git .
   ```

2. **Або завантажте файли вручну:**
   ```bash
   # Створіть структуру папок
   mkdir -p telegram-bot
   
   # Скопіюйте файли з локального комп'ютера
   # (використовуйте scp або завантажте через браузер)
   ```

### **Крок 3: Налаштування конфігурації**

1. **Створіть файл .env:**
   ```bash
   cd telegram-bot
   cp config.env.example .env
   nano .env
   ```

2. **Заповніть конфігурацію:**
   ```env
   # Telegram Bot Configuration
   TELEGRAM_BOT_TOKEN=8391553382:AAGhnyEswcHCVvwxwpBzeQIH58vALOpT1HA
   TELEGRAM_CHAT_ID=156212174
   
   # Google Workspace Configuration
   GOOGLE_FORM_ID=1Jy7STz5k4y2tUJ-BG0OIGlP72BWNaeY8HHx8kHc31Qs
   GOOGLE_SPREADSHEET_ID=1IG8tGF8g8sulW5snTKt_yUXmscUNUkVOQR9_6UO3vlk
   GOOGLE_DRIVE_FOLDER_ID=1uVNZTdCgZAu5q-oc7lAzKvn-FRfkJBx9
   
   # Application Settings
   NODE_ENV=production
   LOG_LEVEL=info
   ```

### **Крок 4: Запуск бота**

1. **Запустіть деплой скрипт:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **Або запустіть вручну:**
   ```bash
   # Встановлення залежностей
   npm install
   
   # Запуск через PM2
   pm2 start ecosystem.config.js
   pm2 save
   ```

### **Крок 5: Перевірка роботи**

1. **Перевірте статус:**
   ```bash
   pm2 status
   pm2 logs contract-bot
   ```

2. **Тестуйте бота:**
   - Відправте `/start` в Telegram
   - Перевірте відповіді

---

## 🔧 **УПРАВЛІННЯ БОТОМ:**

### **Основні команди:**
```bash
# Статус
pm2 status

# Логи
pm2 logs contract-bot

# Перезапуск
pm2 restart contract-bot

# Зупинка
pm2 stop contract-bot

# Видалення
pm2 delete contract-bot
```

### **Моніторинг:**
```bash
# Детальна інформація
pm2 show contract-bot

# Моніторинг в реальному часі
pm2 monit

# Статистика
pm2 stats
```

---

## 📝 **ОНОВЛЕННЯ БОТА:**

### **Автоматичне оновлення:**
```bash
cd /root/contract-automation
git pull origin main
cd telegram-bot
./deploy.sh
```

### **Ручне оновлення:**
```bash
cd /root/contract-automation/telegram-bot
git pull origin main
pm2 restart contract-bot
```

---

## 🛠️ **НАЛАШТУВАННЯ GOOGLE APPS SCRIPT:**

1. **Відкрийте Google Apps Script:**
   ```
   https://script.google.com
   ```

2. **Скопіюйте файли з папки `google-apps-script/`**

3. **Запустіть ініціалізацію:**
   ```javascript
   function testSystem() {
     initializeSystem();
   }
   ```

---

## 🔒 **БЕЗПЕКА:**

### **Файрвол:**
```bash
# Відкрийте тільки необхідні порти
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

### **Резервне копіювання:**
```bash
# Створіть скрипт для резервного копіювання
mkdir -p /root/backups
cp -r /root/contract-automation /root/backups/$(date +%Y%m%d_%H%M%S)
```

---

## 📞 **ПІДТРИМКА:**

### **Логи та діагностика:**
```bash
# Логи PM2
pm2 logs contract-bot --lines 100

# Логи системи
journalctl -u pm2-root -f

# Перевірка процесів
ps aux | grep node
```

### **При проблемах:**
1. Перевірте логи: `pm2 logs contract-bot`
2. Перезапустіть: `pm2 restart contract-bot`
3. Перевірте конфігурацію в `.env`
4. Перевірте підключення до Telegram API

**Бот готовий до роботи на сервері! 🎉** 