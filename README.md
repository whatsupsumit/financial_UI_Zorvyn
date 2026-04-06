# Finance Dashboard UI

## Overview
A reactive, responsive, and cleanly architected Finance Dashboard built to demonstrate frontend development paradigms, interactive state management, and real-time visualization without relying on heavy third-party chart libraries. Built with React and TypeScript.

## Features
- **Summary Metrics:** Live calculation of Total Balance, Income, and Expenses.
- **Transactions Management:** View, search, sort, and filter transactions smoothly.
- **Insight Engine:** Dynamically calculates top spending categories, monthly averages, and savings rate.
- **Interactive Visualizations:** Custom-built lightweight SVGs for Donuts, Sparklines, and Balance Trends.
- **Role-Based Access Control (RBAC):** Simulated header toggle. Switch between Admin (can edit/add) and Viewer (read-only mode).
- **Data Persistence:** Automatically saves all configurations and transactions to `localStorage`.
- **Dark Mode Support:** Crisp layout transitions.
- **CSV Exports:** Quick one-click download of filtered reports.
- **Fully Responsive:** Designed for Desktop, Tablet, and Mobile viewport adaptations.

## Setup Instructions

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/whatsupsumit/financial_UI_Zorvyn.git
   cd financial_UI_Zorvyn
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Approach & Structure
- Developed entirely focused on functional UI requirements.
- Uses `useReducer` and `useMemo` to safely handle complex derived states and cross-filtering mechanisms.
- Pure CSS (via styled/inline layouts + injected media queries) ensures the dashboard is perfectly responsive without importing large CSS frameworks.

