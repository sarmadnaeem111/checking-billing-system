import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import Translate from './Translate';

const AdminNavbar = () => {
  const { adminUser, adminLogout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  
  const handleClose = () => setShowSidebar(false);
  const handleShow = () => setShowSidebar(true);

  const handleLogout = () => {
    adminLogout()
      .then(() => {
        navigate('/admin/login');
      })
      .catch(error => {
        console.error('Failed to log out', error);
      });
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container fluid>
          <Navbar.Brand as={Link} to="/admin/dashboard">
            Golden Oil Admin
          </Navbar.Brand>
          
          <Button 
            variant="outline-light" 
            className="d-lg-none"
            onClick={handleShow}
          >
            <i className="bi bi-list"></i> <Translate textKey="menu" fallback="Menu" />
          </Button>
          
          <div className="d-none d-lg-flex align-items-center">
            <LanguageToggle />
            {adminUser && (
              <Button variant="outline-light" onClick={handleLogout} className="ms-2">
                <Translate textKey="logout" />
              </Button>
            )}
          </div>
        </Container>
      </Navbar>
      
      {/* Sidebar for mobile view */}
      <Offcanvas show={showSidebar} onHide={handleClose} className="bg-dark text-white" placement="start">
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title><Translate textKey="adminPanel" fallback="Admin Panel" /></Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link 
              as={Link} 
              to="/admin/dashboard" 
              className={isActive('/admin/dashboard') ? 'active' : ''}
              onClick={handleClose}
            >
              <Translate textKey="dashboard" />
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/admin/pending-users" 
              className={isActive('/admin/pending-users') ? 'active' : ''}
              onClick={handleClose}
            >
              <Translate textKey="pendingApprovals" fallback="Pending Approvals" />
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/admin/users" 
              className={isActive('/admin/users') ? 'active' : ''}
              onClick={handleClose}
            >
              <Translate textKey="manageUsers" fallback="Manage Users" />
            </Nav.Link>
            <hr className="bg-secondary" />
            <div className="d-flex mt-3">
              <LanguageToggle />
              <Button 
                variant="outline-danger" 
                onClick={() => {
                  handleLogout();
                  handleClose();
                }}
                className="ms-2"
              >
                <Translate textKey="logout" />
              </Button>
            </div>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
      
      {/* Sidebar for desktop */}
      <div className="d-none d-lg-block" style={{ width: '250px', position: 'fixed', top: '70px', bottom: 0, left: 0, zIndex: 100, padding: '20px 0', boxShadow: '0 4px 12px 0 rgba(0,0,0,.05)', backgroundColor: '#f8f9fa' }}>
        <Nav className="flex-column px-3">
          <Nav.Link 
            as={Link} 
            to="/admin/dashboard" 
            className={`rounded py-2 ${isActive('/admin/dashboard') ? 'active bg-primary text-white' : ''}`}
          >
            <i className="bi bi-speedometer2 me-2"></i> <Translate textKey="dashboard" />
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/admin/pending-users" 
            className={`rounded py-2 ${isActive('/admin/pending-users') ? 'active bg-primary text-white' : ''}`}
          >
            <i className="bi bi-person-plus me-2"></i> <Translate textKey="pendingApprovals" fallback="Pending Approvals" />
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/admin/users" 
            className={`rounded py-2 ${isActive('/admin/users') ? 'active bg-primary text-white' : ''}`}
          >
            <i className="bi bi-people me-2"></i> <Translate textKey="manageUsers" fallback="Manage Users" />
          </Nav.Link>
        </Nav>
      </div>
    </>
  );
};

export default AdminNavbar; 