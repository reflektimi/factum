import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from './lib/AuthRoutes';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import Welcome from './Pages/Welcome';

// Invoices
import Invoices from './Pages/Invoices';
import InvoiceCreate from './Pages/Invoices/Create';
import InvoiceEdit from './Pages/Invoices/Edit';
import InvoiceShow from './Pages/Invoices/Show';
import InvoicePublic from './Pages/Invoices/PublicShow';

// Accounts
import Accounts from './Pages/Accounts';
import AccountCreate from './Pages/Accounts/Create';
import AccountEdit from './Pages/Accounts/Edit';
import AccountShow from './Pages/Accounts/Show';

// Payments
import Payments from './Pages/Payments';
import PaymentCreate from './Pages/Payments/Create';
import PaymentEdit from './Pages/Payments/Edit';
import PaymentShow from './Pages/Payments/Show';

// Quotes
import Quotes from './Pages/Quotes';
import QuoteCreate from './Pages/Quotes/Create';
import QuoteEdit from './Pages/Quotes/Edit';
import QuoteShow from './Pages/Quotes/Show';
import QuotePublic from './Pages/Quotes/PublicShow';

// Credit Notes
import CreditNotes from './Pages/CreditNotes';
import CreditNoteCreate from './Pages/CreditNotes/Create';
import CreditNoteEdit from './Pages/CreditNotes/Edit';
import CreditNoteShow from './Pages/CreditNotes/Show';

// Expenses
import Expenses from './Pages/Expenses';
import ExpenseCreate from './Pages/Expenses/Create';
import ExpenseEdit from './Pages/Expenses/Edit';
import ExpenseShow from './Pages/Expenses/Show';

// Recurring Invoices
import RecurringInvoices from './Pages/RecurringInvoices';
import RecurringInvoiceCreate from './Pages/RecurringInvoices/Create';
import RecurringInvoiceEdit from './Pages/RecurringInvoices/Edit';
import RecurringInvoiceShow from './Pages/RecurringInvoices/Show';

// General
import Reports from './Pages/Reports';
import ReportShow from './Pages/Reports/Show';
import Users from './Pages/Users';
import Settings from './Pages/Settings';
import ProfileEdit from './Pages/Profile/Edit';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/public/quotes/:id" element={<QuotePublic />} />
        <Route path="/public/invoices/:id" element={<InvoicePublic />} />

        {/* Guest Routes */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Invoices */}
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/create" element={<InvoiceCreate />} />
          <Route path="/invoices/:id" element={<InvoiceShow />} />
          <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />

          {/* Accounts */}
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/accounts/create" element={<AccountCreate />} />
          <Route path="/accounts/:id" element={<AccountShow />} />
          <Route path="/accounts/:id/edit" element={<AccountEdit />} />

          {/* Payments */}
          <Route path="/payments" element={<Payments />} />
          <Route path="/payments/create" element={<PaymentCreate />} />
          <Route path="/payments/:id" element={<PaymentShow />} />
          <Route path="/payments/:id/edit" element={<PaymentEdit />} />

          {/* Quotes */}
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/quotes/create" element={<QuoteCreate />} />
          <Route path="/quotes/:id" element={<QuoteShow />} />
          <Route path="/quotes/:id/edit" element={<QuoteEdit />} />

          {/* Credit Notes */}
          <Route path="/credit-notes" element={<CreditNotes />} />
          <Route path="/credit-notes/create" element={<CreditNoteCreate />} />
          <Route path="/credit-notes/:id" element={<CreditNoteShow />} />
          <Route path="/credit-notes/:id/edit" element={<CreditNoteEdit />} />

          {/* Expenses */}
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/expenses/create" element={<ExpenseCreate />} />
          <Route path="/expenses/:id" element={<ExpenseShow />} />
          <Route path="/expenses/:id/edit" element={<ExpenseEdit />} />

          {/* Recurring Invoices */}
          <Route path="/recurring-invoices" element={<RecurringInvoices />} />
          <Route path="/recurring-invoices/create" element={<RecurringInvoiceCreate />} />
          <Route path="/recurring-invoices/:id" element={<RecurringInvoiceShow />} />
          <Route path="/recurring-invoices/:id/edit" element={<RecurringInvoiceEdit />} />

          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportShow />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<ProfileEdit />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
