import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { validatePassword } from '../utils/passwordPolicy';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const { registerShop } = useAuth();
  const navigate = useNavigate();

  const [passwordError, setPasswordError] = useState('');

  // Validate password when it changes
  useEffect(() => {
    if (password) {
      const validationResult = validatePassword(password);
      if (!validationResult.isValid) {
        setPasswordError(validationResult.message);
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  }, [password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const validationResult = validatePassword(password);
    if (!validationResult.isValid) {
      setError(validationResult.message);
      return;
    }
    
    setError('');
    setLoading(true);
    
    const shopDetails = {
      shopName,
      address,
      phoneNumber,
      status: 'pending', // Set status to pending for admin approval
      createdAt: new Date().toISOString()
    };
    
    registerShop(email, password, shopDetails)
      .then(() => {
        setRegistrationComplete(true);
      })
      .catch(error => {
        setError('Failed to create an account. ' + error.message);
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2>Register Your Shop</h2>
                <p className="text-muted">Create an account to get started</p>
              </div>
              
              {registrationComplete ? (
                <Alert variant="success">
                  <Alert.Heading>Registration Successful!</Alert.Heading>
                  <p>
                    Your account has been submitted for approval. Once an administrator approves your account, 
                    you will be able to login. This process usually takes 1-2 business days.
                  </p>
                  <hr />
                  <div className="d-flex justify-content-center">
                    <Button 
                      variant="outline-success"
                      onClick={() => navigate('/login')}
                    >
                      Go to Login
                    </Button>
                  </div>
                </Alert>
              ) : (
                <>
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Shop Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            isInvalid={!!passwordError}
                          />
                          <PasswordStrengthMeter password={password} />
                          {passwordError && (
                            <Form.Control.Feedback type="invalid">
                              {passwordError}
                            </Form.Control.Feedback>
                          )}
                          <Form.Text className="text-muted">
                            Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirm Password</Form.Label>
                          <Form.Control
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength="6"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <div className="d-grid gap-2">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={loading}
                      >
                        {loading ? 'Creating Account...' : 'Register'}
                      </Button>
                    </div>
                  </Form>
                  
                  <div className="text-center mt-3">
                    <p>
                      Already have an account? <Link to="/login">Login</Link>
                    </p>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;