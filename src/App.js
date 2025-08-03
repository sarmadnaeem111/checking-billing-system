import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useLanguage } from './contexts/LanguageContext';
import PrivateRoute from './components/PrivateRoute';
import AdminPrivateRoute from './components/AdminPrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewReceipt from './pages/NewReceipt';
import ViewReceipts from './pages/ViewReceipts';
import ViewReceipt from './pages/ViewReceipt';
import EditReceipt from './pages/EditReceipt';
import ReturnProducts from './pages/ReturnProducts';
import ViewStock from './pages/ViewStock';
import AddStockItem from './pages/AddStockItem';
import EditStockItem from './pages/EditStockItem';
import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import Attendance from './pages/Attendance';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceReport from './pages/AttendanceReport';
import Settings from './pages/Settings';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPendingUsers from './pages/AdminPendingUsers';
import AdminManageUsers from './pages/AdminManageUsers';
import SalesAnalytics from './pages/SalesAnalytics';
import SalaryManagement from './pages/SalaryManagement';
import AddSalaryPayment from './pages/AddSalaryPayment';
import EditSalaryPayment from './pages/EditSalaryPayment';
import SalaryReports from './pages/SalaryReports';
import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditExpense';
import ExpenseCategories from './pages/ExpenseCategories';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Wrapper component to apply RTL class based on language
function AppContent() {
  const { language } = useLanguage();
  const isRTL = language === 'ur';
  
  console.log('AppContent rendering, language:', language);
  
  return (
    <Router>
      <div className={`App ${isRTL ? 'rtl' : ''}`}>
        <Routes>
          {/* User Routes */}
          <Route path="/login" element={
            <ErrorBoundary>
              <Login />
            </ErrorBoundary>
          } />
          <Route path="/register" element={
            <ErrorBoundary>
              <Register />
            </ErrorBoundary>
          } />
          <Route path="/dashboard" element={
            <ErrorBoundary>
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/new-receipt" element={
            <ErrorBoundary>
              <PrivateRoute>
                <NewReceipt />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/receipts" element={
            <ErrorBoundary>
              <PrivateRoute>
                <ViewReceipts />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/receipt/:id" element={
            <ErrorBoundary>
              <PrivateRoute>
                <ViewReceipt />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/edit-receipt/:id" element={
            <ErrorBoundary>
              <PrivateRoute>
                <EditReceipt />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/return-products/:id" element={
            <ErrorBoundary>
              <PrivateRoute>
                <ReturnProducts />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          {/* Sales Analytics Route */}
          <Route path="/sales-analytics" element={
            <ErrorBoundary>
              <PrivateRoute>
                <SalesAnalytics />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          {/* Stock Management Routes */}
          <Route path="/stock" element={
            <ErrorBoundary>
              <PrivateRoute>
                <ViewStock />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/add-stock" element={
            <ErrorBoundary>
              <PrivateRoute>
                <AddStockItem />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/edit-stock/:id" element={
            <ErrorBoundary>
              <PrivateRoute>
                <EditStockItem />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          {/* Employee Management Routes */}
          <Route path="/employees" element={
            <ErrorBoundary>
              <PrivateRoute>
                <Employees />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/add-employee" element={
            <ErrorBoundary>
              <PrivateRoute>
                <AddEmployee />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/edit-employee/:id" element={
            <ErrorBoundary>
              <PrivateRoute>
                <EditEmployee />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          {/* Salary Management Routes */}
          <Route path="/salary-management" element={
            <ErrorBoundary>
              <PrivateRoute>
                <SalaryManagement />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/add-salary-payment" element={
            <ErrorBoundary>
              <PrivateRoute>
                <AddSalaryPayment />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/edit-salary-payment/:id" element={
            <ErrorBoundary>
              <PrivateRoute>
                <EditSalaryPayment />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/salary-reports" element={
            <ErrorBoundary>
              <PrivateRoute>
                <SalaryReports />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          {/* Attendance Management Routes */}
          <Route path="/attendance" element={
            <ErrorBoundary>
              <PrivateRoute>
                <Attendance />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/mark-attendance" element={
            <ErrorBoundary>
              <PrivateRoute>
                <MarkAttendance />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/attendance-report" element={
            <ErrorBoundary>
              <PrivateRoute>
                <AttendanceReport />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          
          {/* Expense Management Routes */}
          <Route path="/expenses" element={
            <ErrorBoundary>
              <PrivateRoute>
                <Expenses />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/add-expense" element={
            <ErrorBoundary>
              <PrivateRoute>
                <AddExpense />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/edit-expense/:id" element={
            <ErrorBoundary>
              <PrivateRoute>
                <EditExpense />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/expense-categories" element={
            <ErrorBoundary>
              <PrivateRoute>
                <ExpenseCategories />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          
          {/* Settings Route */}
          <Route path="/settings" element={
            <ErrorBoundary>
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={
            <ErrorBoundary>
              <AdminLogin />
            </ErrorBoundary>
          } />
          <Route path="/admin/dashboard" element={
            <ErrorBoundary>
              <AdminPrivateRoute>
                <AdminDashboard />
              </AdminPrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/admin/pending-users" element={
            <ErrorBoundary>
              <AdminPrivateRoute>
                <AdminPendingUsers />
              </AdminPrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/admin/users" element={
            <ErrorBoundary>
              <AdminPrivateRoute>
                <AdminManageUsers />
              </AdminPrivateRoute>
            </ErrorBoundary>
          } />
          
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/admin" element={<Navigate replace to="/admin/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  console.log('App component rendering');
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </AdminProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
