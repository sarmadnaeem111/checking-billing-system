import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { Translate, useTranslatedAttribute } from '../utils';

const AddEmployee = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Get translations for attributes
  const getTranslatedAttr = useTranslatedAttribute();
  
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    contact: '',
    email: '',
    address: '',
    joiningDate: '',
    salary: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.position || !formData.contact) {
      setError(getTranslatedAttr('requiredFieldsError'));
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Add the employee to Firestore
      await addDoc(collection(db, 'employees'), {
        ...formData,
        salary: parseFloat(formData.salary) || 0,
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        shopId: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      navigate('/employees');
    } catch (err) {
      console.error('Error adding employee:', err);
      setError(getTranslatedAttr('failedToAddEmployee'));
      setLoading(false);
    }
  };
  
  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="mb-4"><Translate textKey="addNewEmployee" /></h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label><Translate textKey="nameRequired" /></Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label><Translate textKey="positionRequired" /></Form.Label>
                <Form.Control
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label><Translate textKey="contactRequired" /></Form.Label>
                <Form.Control
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label><Translate textKey="email" /></Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label><Translate textKey="address" /></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label><Translate textKey="joiningDate" /></Form.Label>
                <Form.Control
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label><Translate textKey="monthlySalary" /></Form.Label>
                <Form.Control
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate('/employees')}>
                  <Translate textKey="cancel" />
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? <Translate textKey="adding" /> : <Translate textKey="addEmployee" />}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default AddEmployee; 