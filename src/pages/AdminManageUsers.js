import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Card, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import { useAdmin } from '../contexts/AdminContext';
import AdminNavbar from '../components/AdminNavbar';
import { db, auth } from '../firebase/config';
import { getDoc, doc } from 'firebase/firestore';
import { getAuth, listUsers } from 'firebase/auth';

// Simple mock data for direct use
const MOCK_USERS = [
  {
    id: 'mock-user-1',
    shopName: 'Active Shop',
    email: 'activeshop@example.com',
    address: '123 Active Street',
    phoneNumber: '123-456-7890',
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-user-2',
    shopName: 'Pending Shop',
    email: 'pendingshop@example.com',
    address: '456 Pending Avenue',
    phoneNumber: '098-765-4321',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: 'mock-user-3',
    shopName: 'Frozen Shop',
    email: 'frozenshop@example.com',
    address: '789 Frozen Lane',
    phoneNumber: '555-123-4567',
    status: 'frozen',
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  },
  {
    id: 'mock-user-4',
    shopName: 'Rejected Shop',
    email: 'rejectedshop@example.com',
    address: '321 Rejected Road',
    phoneNumber: '111-222-3333',
    status: 'rejected',
    createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
  }
];

const AdminManageUsers = () => {
  const { getAllUsers, toggleUserFreeze } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge bg="success">Active</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      case 'frozen':
        return <Badge bg="secondary">Frozen</Badge>;
      default:
        return <Badge bg="info">{status}</Badge>;
    }
  };

  // Enhanced fetch users function to include email data
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching all users...");
      
      // Get users from context
      const fetchedUsers = await getAllUsers();
      console.log("Fetched users from context:", fetchedUsers);
      
      // Get user auth data with email
      // Since we can't directly call Firebase Admin SDK from client,
      // we need to ensure emails are stored in Firestore during registration
      // For now, we'll use the current approach and enhance with user emails
      
      // Map the email from auth data if available, or use existing email field
      const usersWithEmail = fetchedUsers.map(user => {
        // If user already has email field, use it
        if (user.email) {
          return user;
        }
        
        // Otherwise, check if we have email in auth object or set to "Email not available"
        return {
          ...user,
          email: user.userEmail || "Email not available" // Add this fallback
        };
      });
      
      setUsers(usersWithEmail);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError('Failed to load users. Using mock data instead.');
      // Fall back to mock data on any error
      setUsers(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  }, [getAllUsers]);

  // Load users on component mount
  useEffect(() => {
    console.log("Component mounted, fetching users...");
    fetchUsers();
  }, [fetchUsers]);

  // Handle freeze/unfreeze user
  const handleToggleFreeze = async (userId, currentStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const shouldFreeze = currentStatus !== 'frozen';
      await toggleUserFreeze(userId, shouldFreeze);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: shouldFreeze ? 'frozen' : 'approved' } 
            : user
        )
      );
    } catch (error) {
      console.error('Error toggling user freeze status:', error);
      setError(`Failed to ${currentStatus === 'frozen' ? 'unfreeze' : 'freeze'} user. Please try again.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
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

  return (
    <>
      <AdminNavbar />
      <div className="d-none d-lg-block" style={contentStyle}>
        <Container fluid>
          <h2 className="mb-4">Manage Users - Debug View</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Card className="border-0 shadow-sm">
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-3">Loading users...</p>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <pre>{JSON.stringify({ usersCount: users.length }, null, 2)}</pre>
                  </div>
                  
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Shop Name</th>
                          <th>Email</th>
                          <th>Address</th>
                          <th>Phone</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>{user.shopName}</td>
                            <td>{user.email}</td>
                            <td>{user.address || 'N/A'}</td>
                            <td>{user.phoneNumber || 'N/A'}</td>
                            <td>{getStatusBadge(user.status)}</td>
                            <td>
                              {user.status !== 'pending' && user.status !== 'rejected' && (
                                <Button
                                  variant={user.status === 'frozen' ? 'outline-success' : 'outline-secondary'}
                                  size="sm"
                                  onClick={() => handleToggleFreeze(user.id, user.status)}
                                  disabled={actionLoading[user.id]}
                                >
                                  {actionLoading[user.id] ? (
                                    <Spinner
                                      as="span"
                                      animation="border"
                                      size="sm"
                                      role="status"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    user.status === 'frozen' ? 'Unfreeze' : 'Freeze'
                                  )}
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
      
      {/* Mobile view */}
      <div className="d-block d-lg-none" style={mobileContentStyle}>
        <Container fluid>
          <h2 className="mb-4">Manage Users - Debug View</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Card className="border-0 shadow-sm">
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-3">Loading users...</p>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <pre>{JSON.stringify({ usersCount: users.length }, null, 2)}</pre>
                  </div>
                  
                  {users.map((user) => (
                    <Card key={user.id} className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5>{user.shopName}</h5>
                          {getStatusBadge(user.status)}
                        </div>
                        <p className="mb-1">{user.email}</p>
                        <p className="mb-1">{user.address || 'No address'}</p>
                        <p className="mb-1">{user.phoneNumber || 'No phone'}</p>
                        
                        {user.status !== 'pending' && user.status !== 'rejected' && (
                          <Button
                            variant={user.status === 'frozen' ? 'outline-success' : 'outline-secondary'}
                            size="sm"
                            onClick={() => handleToggleFreeze(user.id, user.status)}
                            disabled={actionLoading[user.id]}
                            className="mt-2"
                          >
                            {actionLoading[user.id] ? (
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                              />
                            ) : (
                              user.status === 'frozen' ? 'Unfreeze' : 'Freeze'
                            )}
                          </Button>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                </>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default AdminManageUsers; 