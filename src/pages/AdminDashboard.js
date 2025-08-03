import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAdmin } from '../contexts/AdminContext';
import AdminNavbar from '../components/AdminNavbar';

const AdminDashboard = () => {
  const { adminUser } = useAdmin();
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [frozenUsers, setFrozenUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const shopRef = collection(db, 'shops');
        
        // Get total users count
        const totalCount = await getCountFromServer(shopRef);
        setTotalUsers(totalCount.data().count);
        
        // Get pending users count
        const pendingQuery = query(shopRef, where('status', '==', 'pending'));
        const pendingCount = await getCountFromServer(pendingQuery);
        setPendingUsers(pendingCount.data().count);
        
        // Get frozen users count
        const frozenQuery = query(shopRef, where('status', '==', 'frozen'));
        const frozenCount = await getCountFromServer(frozenQuery);
        setFrozenUsers(frozenCount.data().count);
        
        // Get active users count
        const activeQuery = query(shopRef, where('status', '==', 'approved'));
        const activeCount = await getCountFromServer(activeQuery);
        setActiveUsers(activeCount.data().count);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (adminUser) {
      fetchDashboardData();
    }
  }, [adminUser]);

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
          <h2 className="mb-4">Admin Dashboard</h2>
          
          <Row className="g-4">
            <Col sm={6} xl={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="card-subtitle text-muted">Total Users</h6>
                    <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                      <i className="bi bi-people text-primary fs-4"></i>
                    </div>
                  </div>
                  <h3 className="mb-0">{loading ? '...' : totalUsers}</h3>
                  <p className="text-muted mt-2 mb-0">Registered shops</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col sm={6} xl={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="card-subtitle text-muted">Pending Approvals</h6>
                    <div className="rounded-circle bg-warning bg-opacity-10 p-2">
                      <i className="bi bi-hourglass-split text-warning fs-4"></i>
                    </div>
                  </div>
                  <h3 className="mb-0">{loading ? '...' : pendingUsers}</h3>
                  <p className="text-muted mt-2 mb-0">
                    Awaiting admin approval
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col sm={6} xl={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="card-subtitle text-muted">Active Users</h6>
                    <div className="rounded-circle bg-success bg-opacity-10 p-2">
                      <i className="bi bi-check-circle text-success fs-4"></i>
                    </div>
                  </div>
                  <h3 className="mb-0">{loading ? '...' : activeUsers}</h3>
                  <p className="text-muted mt-2 mb-0">
                    Currently active accounts
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col sm={6} xl={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="card-subtitle text-muted">Frozen Accounts</h6>
                    <div className="rounded-circle bg-danger bg-opacity-10 p-2">
                      <i className="bi bi-lock text-danger fs-4"></i>
                    </div>
                  </div>
                  <h3 className="mb-0">{loading ? '...' : frozenUsers}</h3>
                  <p className="text-muted mt-2 mb-0">
                    Temporarily suspended
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      
      {/* Mobile view content */}
      <div className="d-block d-lg-none" style={mobileContentStyle}>
        <Container fluid>
          <h2 className="mb-4">Admin Dashboard</h2>
          
          <Row className="g-4">
            <Col xs={6}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="card-subtitle text-muted fs-6">Total Users</h6>
                    <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                      <i className="bi bi-people text-primary"></i>
                    </div>
                  </div>
                  <h3 className="mb-0 fs-4">{loading ? '...' : totalUsers}</h3>
                </Card.Body>
              </Card>
            </Col>
            
            <Col xs={6}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="card-subtitle text-muted fs-6">Pending</h6>
                    <div className="rounded-circle bg-warning bg-opacity-10 p-2">
                      <i className="bi bi-hourglass-split text-warning"></i>
                    </div>
                  </div>
                  <h3 className="mb-0 fs-4">{loading ? '...' : pendingUsers}</h3>
                </Card.Body>
              </Card>
            </Col>
            
            <Col xs={6}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="card-subtitle text-muted fs-6">Active</h6>
                    <div className="rounded-circle bg-success bg-opacity-10 p-2">
                      <i className="bi bi-check-circle text-success"></i>
                    </div>
                  </div>
                  <h3 className="mb-0 fs-4">{loading ? '...' : activeUsers}</h3>
                </Card.Body>
              </Card>
            </Col>
            
            <Col xs={6}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="card-subtitle text-muted fs-6">Frozen</h6>
                    <div className="rounded-circle bg-danger bg-opacity-10 p-2">
                      <i className="bi bi-lock text-danger"></i>
                    </div>
                  </div>
                  <h3 className="mb-0 fs-4">{loading ? '...' : frozenUsers}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default AdminDashboard; 