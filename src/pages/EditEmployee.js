import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';

const EditEmployee = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
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
  const [fetchLoading, setFetchLoading] = useState(true);
  
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setFetchLoading(true);
        const employeeDoc = await getDoc(doc(db, 'employees', id));
        
        if (employeeDoc.exists()) {
          const employeeData = employeeDoc.data();
          
          // Verify that this employee belongs to the current shop
          if (employeeData.shopId !== currentUser.uid) {
            setError('You do not have permission to edit this employee');
            setFetchLoading(false);
            return;
          }
          
          setFormData({
            name: employeeData.name || '',
            position: employeeData.position || '',
            contact: employeeData.contact || '',
            email: employeeData.email || '',
            address: employeeData.address || '',
            joiningDate: employeeData.joiningDate || '',
            salary: employeeData.salary ? employeeData.salary.toString() : ''
          });
        } else {
          setError('Employee not found');
        }
        
        setFetchLoading(false);
      } catch (err) {
        console.error('Error fetching employee:', err);
        setError('Failed to load employee data. Please try again.');
        setFetchLoading(false);
      }
    };
    
    if (id && currentUser) {
      fetchEmployee();
    }
  }, [id, currentUser]);
  
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
      setError('Name, position, and contact number are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Update the employee in Firestore
      await updateDoc(doc(db, 'employees', id), {
        ...formData,
        salary: parseFloat(formData.salary) || 0,
        updatedAt: new Date().toISOString()
      });
      
      navigate('/employees');
    } catch (err) {
      console.error('Error updating employee:', err);
      setError('Failed to update employee. Please try again.');
      setLoading(false);
    }
  };
  
  if (fetchLoading) {
    return (
      <>
        <MainNavbar />
        <Container>
          <p className="text-center">Loading employee data...</p>
        </Container>
      </>
    );
  }
  
  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="mb-4">Edit Employee</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name*</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Position*</Form.Label>
                <Form.Control
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Contact Number*</Form.Label>
                <Form.Control
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Joining Date</Form.Label>
                <Form.Control
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Monthly Salary</Form.Label>
                <Form.Control
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate('/employees')}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Employee'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default EditEmployee; 