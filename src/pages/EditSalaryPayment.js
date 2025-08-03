import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { getSalaryRecordById, updateSalaryRecord } from '../utils/salaryUtils';
import { Translate, useTranslatedAttribute } from '../utils';

const EditSalaryPayment = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Get translations for attributes
  const getTranslatedAttr = useTranslatedAttribute();
  
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    amount: '',
    paymentDate: '',
    paymentMethod: '',
    description: '',
    status: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Fetch salary record and employees data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !id) return;
      
      try {
        setDataLoading(true);
        
        // Fetch the salary record
        let salaryRecord;
        try {
          salaryRecord = await getSalaryRecordById(id);
          
          // Check if the record belongs to the current user's shop
          if (salaryRecord.shopId !== currentUser.uid) {
            setError('You do not have permission to edit this record');
            setDataLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error fetching salary record:', err);
          setError('Failed to load salary record. Please try again.');
          setDataLoading(false);
          return;
        }
        
        // Fetch employees for the shop
        try {
          const employeesRef = collection(db, 'employees');
          const employeesQuery = query(employeesRef, where('shopId', '==', currentUser.uid));
          const snapshot = await getDocs(employeesQuery);
          
          const employeesList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setEmployees(employeesList);
        } catch (err) {
          console.error('Error fetching employees:', err);
          setError('Failed to load employees. Please try again.');
          setEmployees([]);
          // Continue with form setup even if employees can't be loaded
        }
        
        // Set form data from the salary record
        setFormData({
          employeeId: salaryRecord.employeeId || '',
          amount: salaryRecord.amount ? salaryRecord.amount.toString() : '',
          paymentDate: salaryRecord.paymentDate || '',
          paymentMethod: salaryRecord.paymentMethod || 'Cash',
          description: salaryRecord.description || '',
          status: salaryRecord.status || 'paid'
        });
        
        setDataLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser, id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.amount || !formData.paymentDate) {
      setError(getTranslatedAttr('requiredFieldsError', 'Employee, amount, and payment date are required'));
      return;
    }
    
    if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      setError(getTranslatedAttr('invalidAmount', 'Please enter a valid amount'));
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Update the salary payment
      await updateSalaryRecord(id, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      navigate('/salary-management');
    } catch (err) {
      console.error('Error updating salary payment:', err);
      setError(getTranslatedAttr('failedToUpdatePayment', 'Failed to update salary payment. Please try again.'));
      setLoading(false);
    }
  };
  
  if (dataLoading) {
    return (
      <>
        <MainNavbar />
        <Container className="text-center mt-5">
          <p><Translate textKey="loadingData" defaultValue="Loading data..." /></p>
        </Container>
      </>
    );
  }
  
  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="mb-4">
          <Translate textKey="editSalaryPayment" defaultValue="Edit Salary Payment" />
        </h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <Translate textKey="employee" defaultValue="Employee" />*
                    </Form.Label>
                    <Form.Select
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      required
                    >
                      {employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} 
                          {employee.position ? ` - ${employee.position}` : ''}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <Translate textKey="amount" defaultValue="Amount" /> (RS)*
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <Translate textKey="paymentDate" defaultValue="Payment Date" />*
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="paymentDate"
                      value={formData.paymentDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <Translate textKey="paymentMethod" defaultValue="Payment Method" />
                    </Form.Label>
                    <Form.Select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                    >
                      <option value="Cash">
                        <Translate textKey="cash" defaultValue="Cash" />
                      </option>
                      <option value="Bank Transfer">
                        <Translate textKey="bankTransfer" defaultValue="Bank Transfer" />
                      </option>
                      <option value="Check">
                        <Translate textKey="check" defaultValue="Check" />
                      </option>
                      <option value="Mobile Payment">
                        <Translate textKey="mobilePayment" defaultValue="Mobile Payment" />
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>
                  <Translate textKey="description" defaultValue="Description" />
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>
                  <Translate textKey="status" defaultValue="Status" />
                </Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="paid">
                    <Translate textKey="paid" defaultValue="Paid" />
                  </option>
                  <option value="pending">
                    <Translate textKey="pending" defaultValue="Pending" />
                  </option>
                </Form.Select>
              </Form.Group>
              
              <div className="d-flex justify-content-between">
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/salary-management')}
                >
                  <Translate textKey="cancel" defaultValue="Cancel" />
                </Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 
                    <Translate textKey="updating" defaultValue="Updating..." /> : 
                    <Translate textKey="updateSalaryPayment" defaultValue="Update Payment" />
                  }
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default EditSalaryPayment; 