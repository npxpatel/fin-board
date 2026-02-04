# Finance Dashboard

A customizable, real-time finance dashboard that transforms any JSON API into beautiful, interactive widgets. Connect to finance APIs, visualize data as cards, tables, or charts, and build your perfect dashboard.

![Finance Dashboard](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

### 🎯 Core Functionality

- **Multi-Format Widgets**: Display data as Cards, Tables, or Charts
- **Real-Time Updates**: Auto-refresh widgets at customizable intervals
- **Drag & Drop**: Reposition widgets with intuitive drag-and-drop
- **API Integration**: Connect to any JSON API endpoint
- **CORS Proxy**: Built-in proxy to handle CORS restrictions
- **Data Persistence**: Widget configurations saved to localStorage
- **Theme Support**: Dark/Light mode toggle
- **Import/Export**: Backup and share widget configurations

### 📊 Widget Types

#### Card Widget
- Display key-value pairs in clean card format
- Auto-formats large numbers (1.2K, 1.5M)
- Perfect for single metrics or exchange rates

#### Table Widget
- Sortable columns with search functionality
- Handles arrays and nested object structures
- Auto-detects columns from data structure
- Supports up to 1000 rows

#### Chart Widget
- Line charts for time series data
- Bar charts for comparisons
- Interactive legend with field focusing
- Logarithmic scale for large value ranges
- Smart auto-detection of numeric fields

### 🔧 Advanced Features

- **Smart Field Detection**: Automatically identifies array fields and nested structures
- **Field Search**: Quick search through available API fields
- **Edit Widgets**: Modify existing widgets via settings icon
- **Error Handling**: Graceful error states with retry functionality
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd finance-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
finance-dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── proxy/          # CORS proxy endpoint
│   │   │   └── test/           # API testing endpoint
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main dashboard page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── widgets/
│   │   │   ├── WidgetCard.tsx      # Card display component
│   │   │   ├── WidgetTable.tsx     # Table display component
│   │   │   ├── WidgetChart.tsx     # Chart display component
│   │   │   └── WidgetContainer.tsx  # Widget wrapper with controls
│   │   ├── AddWidgetModal.tsx       # Widget creation/edit modal
│   │   ├── DashboardGrid.tsx        # Drag-and-drop grid layout
│   │   ├── Header.tsx               # Top navigation bar
│   │   └── ThemeProvider.tsx        # Theme context provider
│   ├── hooks/
│   │   └── useWidgetData.ts         # Widget data fetching hook
│   ├── lib/
│   │   ├── api-client.ts            # API request handling
│   │   └── data-mapper.ts           # Data extraction utilities
│   ├── store/
│   │   └── dashboard-store.ts       # Zustand state management
│   └── types/
│       ├── api.ts                   # API-related types
│       └── widget.ts                # Widget-related types
├── public/                           # Static assets
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 🎮 Usage Guide

### Creating a Widget

1. **Click "Add Widget"** button in the header or placeholder
2. **Enter Widget Name** (e.g., "Bitcoin Price Tracker")
3. **Enter API URL** (e.g., `https://api.coinbase.com/v2/exchange-rates?currency=BTC`)
4. **Click "Test"** to verify the API connection
5. **Select Display Mode**: Card, Table, or Chart
6. **Choose Fields** to display from the available fields list
7. **Set Refresh Interval** (5-3600 seconds)
8. **Click "Add Widget"**

### Editing a Widget

1. Click the **Settings icon** (⚙️) on any widget
2. Modify any configuration (name, URL, fields, etc.)
3. Click **"Save Changes"**

### Widget Controls

Each widget has several controls:

- **Card/Table/Chart Toggle**: Switch between display modes
- **Refresh** (🔄): Manually refresh widget data
- **Settings** (⚙️): Edit widget configuration
- **Delete** (🗑️): Remove widget from dashboard

### Drag & Drop

- Click and drag any widget to reposition it
- Widgets automatically arrange in a responsive grid
- Positions are saved automatically

## 📡 API Examples

### Card Widget Examples

**Coinbase Exchange Rates**
```
URL: https://api.coinbase.com/v2/exchange-rates?currency=BTC
Fields: data.rates.USD, data.rates.EUR
```

**Crypto Prices**
```
URL: https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd
Fields: bitcoin.usd
```

### Table Widget Examples

**Crypto Markets**
```
URL: https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=10
Fields: Select the root array, then choose fields like: id, name, current_price, market_cap
```

**Stock Data**
```
URL: https://api.example.com/stocks
Fields: Select array field, then nested fields
```

### Chart Widget Examples

**Price History**
```
URL: https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=20
Fields: Select array, then numeric fields like: current_price, market_cap, total_volume
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Charts**: [Recharts](https://recharts.org/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🔌 API Proxy

The dashboard includes a built-in CORS proxy at `/api/proxy` that forwards requests to external APIs. This allows you to connect to APIs that don't support CORS.

**Usage:**
```
GET /api/proxy?url=<encoded-api-url>
```

The proxy automatically handles:
- CORS headers
- Error responses
- Request forwarding

## 💾 Data Persistence

Widget configurations are automatically saved to `localStorage` using Zustand's persist middleware. This includes:

- Widget configurations (name, URL, fields, display mode)
- Widget positions
- Theme preference

**Note**: Widget data is not persisted - only configurations. Data is fetched fresh on page load.

## 🎨 Theming

The dashboard supports dark and light themes:

- **Dark Theme** (default): Modern dark interface
- **Light Theme**: Clean light interface
- Toggle via the sun/moon icon in the header
- Preference is saved automatically

## 📦 Import/Export

### Export Configuration

1. Click **"Export Config"** button in the header
2. Configuration downloads as JSON file
3. Includes all widgets and theme preference

### Import Configuration

1. Click **"Import"** button in the header
2. Select a previously exported JSON file
3. All widgets are restored with their configurations

**Export Format:**
```json
{
  "widgets": [
    {
      "id": "uuid",
      "name": "Widget Name",
      "apiUrl": "https://api.example.com/data",
      "refreshInterval": 30,
      "displayMode": "card",
      "selectedFields": [...]
    }
  ],
  "theme": "dark",
  "exportedAt": "2024-01-15T10:30:00.000Z"
}
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js settings
   - Click "Deploy"

3. **Your app is live!**
   - Accessible at `https://your-project.vercel.app`
   - Auto-deploys on every push to main branch

### Deploy via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

### Environment Variables

No environment variables required! The dashboard works out of the box.

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Code Structure

- **Components**: Reusable UI components in `src/components/`
- **Widgets**: Display components in `src/components/widgets/`
- **Hooks**: Custom React hooks in `src/hooks/`
- **Store**: State management in `src/store/`
- **Utils**: Helper functions in `src/lib/`
- **Types**: TypeScript definitions in `src/types/`

### Adding New Widget Types

1. Create component in `src/components/widgets/`
2. Add display mode to `WidgetDisplayMode` type
3. Add case in `WidgetContainer.tsx` renderContent
4. Update `AddWidgetModal.tsx` mode buttons

## 🐛 Troubleshooting

### Widget Not Showing Data

- **Check API URL**: Verify the URL is correct and accessible
- **Test API**: Use the "Test" button to verify connection
- **Check Fields**: Ensure you've selected appropriate fields
- **Check Console**: Look for errors in browser console

### CORS Errors

- The built-in proxy handles CORS automatically
- If issues persist, check API endpoint accessibility

### Chart Not Rendering

- Ensure selected fields contain numeric data
- For arrays, select the array field and nested numeric fields
- Check browser console for errors

### Table Empty

- Verify API returns array data
- Select the array field (or nested array field)
- Check if data structure matches expected format

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Charts powered by [Recharts](https://recharts.org/)
- Icons from [Lucide](https://lucide.dev/)

---

Made with ❤️ for finance data visualization
