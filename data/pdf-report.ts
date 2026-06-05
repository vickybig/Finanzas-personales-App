import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  getBalance,
  getTotalExpense,
  getTotalIncome,
  loadTransactions,
} from '@/data/transactions';
import { getGoalProgress, loadGoals } from '@/data/goals';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export async function generateFinancialReportPdf() {
  const transactions = await loadTransactions();
  const goals = await loadGoals();

  const totalIncome = getTotalIncome(transactions);
  const totalExpense = getTotalExpense(transactions);
  const balance = getBalance(transactions);

  const latestTransactions = [...transactions]
    .reverse()
    .slice(0, 10);

  const goalsHtml =
    goals.length === 0
      ? '<p class="muted">No hay metas registradas.</p>'
      : goals
          .map((goal) => {
            const progress = getGoalProgress(goal);
            const missing = goal.targetAmount - goal.currentAmount;

            return `
              <tr>
                <td>${goal.title}</td>
                <td>$${goal.currentAmount.toFixed(2)}</td>
                <td>$${goal.targetAmount.toFixed(2)}</td>
                <td>${progress.toFixed(1)}%</td>
                <td>$${missing.toFixed(2)}</td>
              </tr>
            `;
          })
          .join('');

  const transactionsHtml =
    latestTransactions.length === 0
      ? '<p class="muted">No hay movimientos registrados.</p>'
      : latestTransactions
          .map((transaction) => {
            const sign = transaction.type === 'income' ? '+' : '-';
            const amountClass = transaction.type === 'income' ? 'income' : 'expense';

            return `
              <tr>
                <td>${formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>${transaction.category}</td>
                <td class="${amountClass}">${sign}$${transaction.amount.toFixed(2)}</td>
              </tr>
            `;
          })
          .join('');

  const currentDate = new Date().toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 28px;
            color: #1E293B;
            background: #FFFFFF;
          }

          .header {
            background: #2563EB;
            color: white;
            padding: 24px;
            border-radius: 18px;
            margin-bottom: 22px;
          }

          .app {
            font-size: 18px;
            font-weight: bold;
            color: #BBF7D0;
            margin-bottom: 8px;
          }

          h1 {
            margin: 0;
            font-size: 28px;
          }

          .date {
            margin-top: 8px;
            color: #DBEAFE;
            font-size: 14px;
          }

          .section {
            margin-top: 22px;
          }

          h2 {
            font-size: 20px;
            margin-bottom: 12px;
            color: #0F172A;
          }

          .summary {
            display: flex;
            gap: 12px;
            margin-bottom: 18px;
          }

          .card {
            flex: 1;
            border: 1px solid #E2E8F0;
            border-radius: 14px;
            padding: 14px;
            background: #F8FAFC;
          }

          .label {
            color: #64748B;
            font-size: 13px;
            margin-bottom: 8px;
          }

          .value {
            font-size: 22px;
            font-weight: bold;
          }

          .income {
            color: #16A34A;
            font-weight: bold;
          }

          .expense {
            color: #DC2626;
            font-weight: bold;
          }

          .balance {
            color: #2563EB;
            font-weight: bold;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }

          th {
            background: #F1F5F9;
            color: #334155;
            text-align: left;
            padding: 10px;
            font-size: 13px;
          }

          td {
            border-bottom: 1px solid #E2E8F0;
            padding: 10px;
            font-size: 13px;
          }

          .muted {
            color: #64748B;
          }

          .footer {
            margin-top: 32px;
            text-align: center;
            color: #64748B;
            font-size: 12px;
          }
        </style>
      </head>

      <body>
        <div class="header">
          <div class="app">FinGo</div>
          <h1>Reporte Financiero</h1>
          <div class="date">Generado el ${currentDate}</div>
        </div>

        <div class="section">
          <h2>Resumen general</h2>

          <div class="summary">
            <div class="card">
              <div class="label">Ingresos totales</div>
              <div class="value income">$${totalIncome.toFixed(2)}</div>
            </div>

            <div class="card">
              <div class="label">Gastos totales</div>
              <div class="value expense">$${totalExpense.toFixed(2)}</div>
            </div>

            <div class="card">
              <div class="label">Saldo disponible</div>
              <div class="value balance">$${balance.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Metas de ahorro</h2>

          ${
            goals.length === 0
              ? goalsHtml
              : `
                <table>
                  <thead>
                    <tr>
                      <th>Meta</th>
                      <th>Ahorrado</th>
                      <th>Objetivo</th>
                      <th>Progreso</th>
                      <th>Faltante</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${goalsHtml}
                  </tbody>
                </table>
              `
          }
        </div>

        <div class="section">
          <h2>Últimos movimientos</h2>

          ${
            latestTransactions.length === 0
              ? transactionsHtml
              : `
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Descripción</th>
                      <th>Categoría</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${transactionsHtml}
                  </tbody>
                </table>
              `
          }
        </div>

        <div class="footer">
          Reporte generado automáticamente por FinGo.
        </div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Compartir reporte financiero',
      UTI: 'com.adobe.pdf',
    });
  }

  return uri;
}