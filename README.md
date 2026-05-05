# 📋 Tasks

Prosta i nowoczesna aplikacja do zarządzania zadaniami, stworzona w oparciu o **Laravel** oraz **React**. Projekt wykorzystuje **Composer'a** oraz autoloading zgodny ze standardem **PSR-4**, zapewniając czytelną strukturę i łatwą rozbudowę.

---

## 🚀 Funkcjonalności

Aplikacja umożliwia:

- ➕ Tworzenie zadań  
- ✏️ Edycję istniejących zadań  
- ❌ Usuwanie zadań  
- 📄 Przeglądanie listy zadań  

---

## 🧱 Technologie

- **Backend:** PHP + Laravel  
- **Frontend:** React.js  
- **Zarządzanie zależnościami:** Composer  
- **Standard autoloadingu:** PSR-4  

---

## ⚙️ Wymagania systemowe

Aby uruchomić projekt, potrzebujesz:

- PHP >= 8.1  
- Composer  
- Node.js >= 18  
- npm lub yarn  
- Serwer WWW (np. Apache / Nginx) lub wbudowany serwer Laravel  
- Baza danych (np. MySQL / PostgreSQL / SQLite)

---

## 🛠️ Instalacja i uruchomienie projektu

### 1. Klonowanie repo

```bash
git clone https://github.com/Animowany/Tasks.git
cd tasks
```

### 2. Instalacja bibliotek backendu

```bash
composer install
```

### 3. Konfiguracja zmiennych środowiskowych

Skopiuj plik `.env`:

```bash
cp .env.example .env
```

Wygeneruj klucz aplikacji:

```bash
php artisan key:generate
```

Skonfiguruj połączenie z bazą danych w pliku `.env`.

### 4. Migracje bazy danych

```bash
php artisan migrate
```

### 5. Instalacja bibliotek frontendu

```bash
npm install
```

### 6. Uruchomienie aplikacji

Backend (Laravel):

```bash
php artisan serve
```

Frontend (React):

```bash
npm run dev
```

Aplikacja będzie domyślnie dostępna pod:

```
http://localhost:8000
```

---

## 🧪 Uruchamianie testów

Projekt wykorzystuje system testów Laravel.

Aby uruchomić testy:

```bash
php artisan test
```