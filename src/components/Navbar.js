import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import Translate from './Translate';

const MainNavbar = () => {
  const { currentUser, logout, shopData } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout()
      .then(() => {
        navigate('/login');
      })
      .catch(error => {
        console.error('Failed to log out', error);
      });
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">
          {shopData ? shopData.shopName : 'Shop Billing System'}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser && (
              <>
                <Nav.Link as={Link} to="/dashboard"><Translate textKey="dashboard" /></Nav.Link>
                <Nav.Link as={Link} to="/new-receipt"><Translate textKey="newReceipt" /></Nav.Link>
                <Nav.Link as={Link} to="/receipts"><Translate textKey="receipts" /></Nav.Link>
                <Nav.Link as={Link} to="/sales-analytics"><Translate textKey="salesAnalytics" fallback="Sales Analytics" /></Nav.Link>
                <Nav.Link as={Link} to="/stock"><Translate textKey="inventory" /></Nav.Link>
                
                {/* Employee Management Dropdown */}
                <NavDropdown title={<Translate textKey="employees" />} id="employee-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/employees"><Translate textKey="viewEmployees" /></NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/add-employee"><Translate textKey="addEmployee" /></NavDropdown.Item>
                </NavDropdown>
                
                {/* Expense Management Dropdown */}
                <NavDropdown title={<Translate textKey="expenses" fallback="Expenses" />} id="expense-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/expenses"><Translate textKey="viewExpenses" fallback="View Expenses" /></NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/add-expense"><Translate textKey="addExpense" fallback="Add Expense" /></NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/expense-categories"><Translate textKey="expenseCategories" fallback="Expense Categories" /></NavDropdown.Item>
                </NavDropdown>
                
                {/* Attendance Management Dropdown */}
                <NavDropdown title={<Translate textKey="attendance" />} id="attendance-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/attendance"><Translate textKey="viewAttendance" /></NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/mark-attendance"><Translate textKey="markAttendance" /></NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/attendance-report"><Translate textKey="attendanceReport" /></NavDropdown.Item>
                </NavDropdown>
                
                {/* Settings */}
                <Nav.Link as={Link} to="/settings"><Translate textKey="settings" /></Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {currentUser ? (
              <>
                <Button variant="outline-light" onClick={handleLogout}><Translate textKey="logout" /></Button>
                <LanguageToggle />
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login"><Translate textKey="login" /></Nav.Link>
                <Nav.Link as={Link} to="/register"><Translate textKey="register" /></Nav.Link>
                <LanguageToggle />
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar;