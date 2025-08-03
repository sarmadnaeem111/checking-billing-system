import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { addSalaryPayment } from '../utils/salaryUtils';
import { Translate, useTranslatedAttribute } from '../utils';

const AddSalaryPayment = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Get translations for attributes
  const getTranslatedAttr = useTranslatedAttribute();
  
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    description: '',
    status: 'paid'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  
  // Fetch employees for the shop
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!currentUser) return;
      
      try {
        setEmployeesLoading(true);
        const employeesRef = collection(db, 'employees');
        const employeesQuery = query(employeesRef, where('shopId', '==', currentUser.uid));
        const snapshot = await getDocs(employeesQuery);
        
        const employeesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setEmployees(employeesList);
        
        // If there are employees, select the first one by default
        if (employeesList.length > 0) {
          setFormData(prev => ({
            ...prev,
            employeeId: employeesList[0].id,
            amount: employeesList[0].salary ? employeesList[0].salary.toString() : ''
          }));
        }
        
        setEmployeesLoading(false);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees. Please try again.');
        setEmployees([]);
        setEmployeesLoading(false);
      }
    };
    
    fetchEmployees();
  }, [currentUser]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'employeeId') {
      // When employee changes, update the amount to their salary if available
      const selectedEmployee = employees.find(emp => emp.id === value);
      if (selectedEmployee && selectedEmployee.salary) {
        setFormData({
          ...formData,
          employeeId: value,
          amount: selectedEmployee.salary.toString()
        });
      } else {
        setFormData({
          ...formData,
          employeeId: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
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
      
      // Add the salary payment to Firestore
      await addSalaryPayment({
        ...formData,
        amount: parseFloat(formData.amount),
        shopId: currentUser.uid
      });
      
      navigate('/salary-management');
    } catch (err) {
      console.error('Error adding salary payment:', err);
      setError(getTranslatedAttr('failedToAddPayment', 'Failed to add salary payment. Please try again.'));
      setLoading(false);
    }
  };
  
  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="mb-4">
          <Translate textKey="addSalaryPayment" defaultValue="Add Salary Payment" />
        </h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Card>
          <Card.Body>
            {employeesLoading ? (
              <p className="text-center">
                <Translate textKey="loadingEmployees" defaultValue="Loading employees..." />
              </p>
            ) : employees.length === 0 ? (
              <Alert variant="warning">
                <Translate 
                  textKey="noEmployeesFound" 
                  defaultValue="No employees found. Please add employees before recording salary payments." 
                />
                <div className="mt-3">
                  <Button variant="primary" onClick={() => navigate('/add-employee')}>
                    <Translate textKey="addNewEmployee" defaultValue="Add New Employee" />
                  </Button>
                </div>
              </Alert>
            ) : (
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <Translate textKey="selectEmployee" defaultValue="Select Employee" />*
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
                            {employee.salary ? ` (RS${employee.salary}/month)` : ''}
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
                    placeholder={getTranslatedAttr(
                      "descriptionPlaceholder", 
                      "E.g., Salary for July 2023, Bonus payment, Advance payment, etc."
                    )}
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
                      <Translate textKey="saving" defaultValue="Saving..." /> : 
                      <Translate textKey="saveSalaryPayment" defaultValue="Save Payment" />
                    }
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default AddSalaryPayment; 