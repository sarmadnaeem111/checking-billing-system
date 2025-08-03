import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Card, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { format } from 'date-fns';
import { useAdmin } from '../contexts/AdminContext';
import AdminNavbar from '../components/AdminNavbar';

const AdminPendingUsers = () => {
  const { getPendingUsers, approveUser, rejectUser } = useAdmin();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal state for confirmation
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // For action loading states
  const [processingUserId, setProcessingUserId] = useState(null);

  // Fetch pending users - wrap in useCallback to prevent infinite loop
  const fetchPendingUsers = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching pending users...");
      const users = await getPendingUsers();
      console.log("Fetched users:", users);
      setPendingUsers(users);
    } catch (error) {
      setError('Failed to load pending users: ' + error.message);
      console.error("Error fetching pending users:", error);
    } finally {
      setLoading(false);
    }
  }, [getPendingUsers]);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  // Handle approval
  const handleApproveUser = async (userId) => {
    try {
      setProcessingUserId(userId);
      await approveUser(userId);
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      setSuccessMessage('User approved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError('Failed to approve user: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessingUserId(null);
    }
  };

  // Handle rejection
  const handleRejectUser = async (userId) => {
    try {
      setProcessingUserId(userId);
      await rejectUser(userId);
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      setSuccessMessage('User rejected successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError('Failed to reject user: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessingUserId(null);
    }
  };

  // Open confirmation modal
  const openConfirmModal = (user, action) => {
    setSelectedUser(user);
    setModalAction(action);
    setShowModal(true);
  };

  // Handle confirmation
  const handleConfirm = () => {
    if (modalAction === 'approve') {
      handleApproveUser(selectedUser.id);
    } else if (modalAction === 'reject') {
      handleRejectUser(selectedUser.id);
    }
    setShowModal(false);
  };

  // For content padding with sidebar
  const contentStyle = {
    marginLeft: '250px',
    padding: '20px',
    transition: 'all 0.3s'
  };

  // For mobile view
  const mobileContentStyle = {
    padding: '20px'
  };

  // Add debug/test tools
  const addTestRegistration = useCallback(async () => {
    try {
      if (!window.confirm('Add a test pending registration?')) return;
      
      setLoading(true);
      
      // This would normally be in a separate utility file
      const { collection, addDoc } = require('firebase/firestore');
      const { db } = require('../firebase/config');
      
      // Create a test shop document with pending status
      const testShop = {
        shopName: 'Test Shop ' + Math.floor(Math.random() * 1000),
        email: `testshop${Math.floor(Math.random() * 1000)}@example.com`,
        address: '123 Test Street',
        phoneNumber: '123-456-7890',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'shops'), testShop);
      
      // Refresh the pending users list
      await fetchPendingUsers();
      
      setSuccessMessage('Test registration added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding test registration:', error);
      setError('Failed to add test registration: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchPendingUsers]);

  return (
    <>
      <AdminNavbar />
      <div className="d-none d-lg-block" style={contentStyle}>
        <Container fluid>
          <h2 className="mb-4">Pending Approval Requests</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          
          {/* Debug tools in development mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-3">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={addTestRegistration}
                className="me-2"
              >
                Add Test Registration
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => fetchPendingUsers()}
              >
                Refresh Data
              </Button>
            </div>
          )}
          
          <Card className="border-0 shadow-sm">
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-3">Loading pending approval requests...</p>
                </div>
              ) : pendingUsers.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-check-circle text-success fs-1"></i>
                  <h4 className="mt-3">No Pending Requests</h4>
                  <p className="text-muted">All user registration requests have been processed.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Shop Name</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>Registration Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="fw-medium">{user.shopName}</td>
                          <td>{user.email}</td>
                          <td>{user.address || 'N/A'}</td>
                          <td>{user.phoneNumber || 'N/A'}</td>
                          <td>
                            {user.createdAt ? 
                              format(new Date(user.createdAt), 'MMM dd, yyyy HH:mm') : 
                              'N/A'}
                          </td>
                          <td>
                            <Badge bg="warning">Pending</Badge>
                          </td>
                          <td>
                            <Button
                              variant="success"
                              size="sm"
                              className="me-2"
                              onClick={() => openConfirmModal(user, 'approve')}
                              disabled={processingUserId === user.id}
                            >
                              {processingUserId === user.id ? (
                                <>
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-1"
                                  />
                                  Processing...
                                </>
                              ) : (
                                'Approve'
                              )}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => openConfirmModal(user, 'reject')}
                              disabled={processingUserId === user.id}
                            >
                              Reject
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
      
      {/* Mobile view */}
      <div className="d-block d-lg-none" style={mobileContentStyle}>
        <Container fluid>
          <h2 className="mb-4">Pending Approvals</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Loading pending requests...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-check-circle text-success fs-1"></i>
              <h4 className="mt-3">No Pending Requests</h4>
              <p className="text-muted">All user registration requests have been processed.</p>
            </div>
          ) : (
            <div>
              {pendingUsers.map((user) => (
                <Card key={user.id} className="mb-3 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="mb-0">{user.shopName}</h5>
                      <Badge bg="warning">Pending</Badge>
                    </div>
                    <p className="text-muted mb-1">{user.email}</p>
                    <p className="text-muted mb-1">{user.address || 'No address'}</p>
                    <p className="text-muted mb-1">{user.phoneNumber || 'No phone'}</p>
                    <p className="text-muted small mb-3">
                      Registered: {user.createdAt ? 
                        format(new Date(user.createdAt), 'MMM dd, yyyy') : 
                        'N/A'}
                    </p>
                    <div className="d-flex">
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2 flex-grow-1"
                        onClick={() => openConfirmModal(user, 'approve')}
                        disabled={processingUserId === user.id}
                      >
                        {processingUserId === user.id ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => openConfirmModal(user, 'reject')}
                        disabled={processingUserId === user.id}
                      >
                        Reject
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </div>
      
      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalAction === 'approve' ? 'Approve User' : 'Reject User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <p>
              Are you sure you want to {modalAction === 'approve' ? 'approve' : 'reject'} the registration for 
              <strong> {selectedUser.shopName}</strong>?
              {modalAction === 'reject' && (
                <span className="text-danger"> This action cannot be undone.</span>
              )}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={modalAction === 'approve' ? 'success' : 'danger'} 
            onClick={handleConfirm}
          >
            {modalAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminPendingUsers; 