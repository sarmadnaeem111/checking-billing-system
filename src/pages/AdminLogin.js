import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);
    
    try {
      // First check if the email exists and if the account is locked
      const emailLower = email.toLowerCase();
      const adminsQuery = query(
        collection(db, 'admins'),
        where('email', '==', emailLower)
      );
      
      const adminsSnapshot = await getDocs(adminsQuery);
      
      if (!adminsSnapshot.empty) {
        const adminDoc = adminsSnapshot.docs[0];
        const adminData = adminDoc.data();
        
        // Check if account is locked
        if (adminData.lockedUntil && adminData.lockDuration) {
          const lockTime = adminData.lockedUntil.toDate();
          const lockDurationMinutes = adminData.lockDuration;
          const lockExpiryTime = new Date(lockTime.getTime() + (lockDurationMinutes * 60 * 1000));
          
          if (lockExpiryTime > new Date()) {
            const timeLeft = Math.ceil((lockExpiryTime - new Date()) / 60000); // minutes
            setError(`Account is temporarily locked. Please try again in ${timeLeft} minute(s).`);
            setLoading(false);
            return;
          }
        }
      }
      
      // Proceed with login
      const adminUser = await adminLogin(email, password);
      
      // If we got here, login was successful
      // Reset failed attempts on successful login if the user exists in admins collection
      if (adminsSnapshot && !adminsSnapshot.empty) {
        const adminDoc = adminsSnapshot.docs[0];
        const adminRef = doc(db, 'admins', adminDoc.id);
        
        await updateDoc(adminRef, {
          failedLoginAttempts: 0,
          lastLoginAt: serverTimestamp()
        });
      }
      
      navigate('/admin/dashboard');
    } catch (error) {
      // Handle failed login attempts
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        try {
          // Find admin by email to update failed attempts
          const emailLower = email.toLowerCase();
          const adminsQuery = query(
            collection(db, 'admins'),
            where('email', '==', emailLower)
          );
          
          const adminsSnapshot = await getDocs(adminsQuery);
          
          if (!adminsSnapshot.empty) {
            const adminDoc = adminsSnapshot.docs[0];
            const adminData = adminDoc.data();
            const failedAttempts = (adminData.failedLoginAttempts || 0) + 1;
            
            // Update failed attempts
            const adminRef = doc(db, 'admins', adminDoc.id);
            
            // Lock account after 3 failed attempts for 30 minutes (stricter for admin)
            if (failedAttempts >= 3) {
              // Create a timestamp for 30 minutes from now
              const lockUntil = new Date();
              lockUntil.setMinutes(lockUntil.getMinutes() + 30);
              
              await updateDoc(adminRef, {
                failedLoginAttempts: failedAttempts,
                lockedUntil: serverTimestamp(),
                lockDuration: 30, // minutes
                lastFailedLoginAt: serverTimestamp()
              });
              
              setError('Too many failed login attempts. Your account has been locked for 30 minutes.');
            } else {
              await updateDoc(adminRef, {
                failedLoginAttempts: failedAttempts,
                lastFailedLoginAt: serverTimestamp()
              });
              
              setError(`Invalid email or password. ${3 - failedAttempts} attempts remaining before account is locked.`);
            }
          } else {
            // For security reasons, don't reveal whether the email exists or not
            setError('Invalid email or password.');
          }
        } catch (updateError) {
          console.error('Error updating failed login attempts:', updateError);
          setError('Invalid email or password.');
        }
      } else {
        setError('Failed to sign in: ' + error.message);
        console.error(error);
      }
      
      setLoading(false);
    }
  };

  return (
    <Container fluid className="bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6} xl={5}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="mb-3 text-primary">Admin Login</h2>
                  <p className="text-muted">Please sign in with your admin credentials</p>
                </div>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
            
            <div className="text-center mt-4">
              <p>
                Not an admin? <Link to="/login">Go to User Login</Link>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default AdminLogin;