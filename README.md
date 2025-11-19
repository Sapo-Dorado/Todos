# Todo Tracker

A Next.js todo tracking application with PostgreSQL database, compatible with Vercel deployment.

## Features

- **Today View**: Shows all items scheduled for today
- **Overview View**: Displays items organized by categories
- **Item Management**:
  - Add items to categories
  - Mark items as complete (strikethrough, moves to bottom)
  - Schedule dates for items
  - Reorder items with up/down arrows
  - Delete items by hovering and pressing Delete/Backspace
  - Right-click to set item due today
- **Category Management**:
  - Create named categories
  - Delete empty categories
  - Add items to specific categories
- **Cleanup**: Erase all completed items with one button

## Setup

### 1. Install Dependencies

```bash
cd todo-tracker
npm install
```

### 2. Set Up Vercel Postgres

1. Create a Vercel account if you don't have one
2. Install Vercel CLI: `npm i -g vercel`
3. Create a new Postgres database in your Vercel project
4. Get your database credentials from Vercel dashboard
5. Copy the environment variables to `.env.local`

Your `.env.local` file should contain:
```
POSTGRES_URL="..."
POSTGRES_PRISMA_URL="..."
POSTGRES_URL_NON_POOLING="..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

### 3. Initialize Database

Run the application and visit `/api/init` to create the database tables:

```bash
npm run dev
```

Then open your browser and navigate to:
```
http://localhost:3000/api/init
```

You should see a success message.

### 4. Start Using the App

Navigate to `http://localhost:3000` and you'll be redirected to the Today view.

## Deployment

Deploy to Vercel:

```bash
vercel
```

Make sure to:
1. Add a Postgres database in your Vercel project settings
2. Environment variables will be automatically populated

After deployment, visit `https://your-app.vercel.app/api/init` once to initialize the database tables.

## Usage

### Today View
- View all items scheduled for today
- Add new items (select category)
- Reorder items with up/down arrows
- Mark items complete
- Delete completed items

### Overview View
- View all categories and their items
- Create new categories
- Add items to specific categories
- Delete empty categories (minus button appears)
- Reorder items within categories

### Keyboard Shortcuts
- **Delete/Backspace**: Delete hovered item
- **Right-click**: Show context menu to set item due today

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Vercel Postgres
- React Hooks

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres) - learn about Vercel Postgres.
