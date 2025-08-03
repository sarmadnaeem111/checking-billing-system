import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { Translate } from '../utils';
import { getExpenseById, updateExpense, getExpenseCategories } from '../utils/expenseUtils';

const EditExpense = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    expenseDate: '',
    categoryId: '',
    paymentMethod: 'cash',
    notes: '',
    receiptImage: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Fetch expense data and categories
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !id) return;
      
      setLoading(true);
      setError('');
      
      try {
        // Fetch expense categories
        const categoriesData = await getExpenseCategories(currentUser.uid);
        setCategories(categoriesData);
        
        // Fetch expense data
        const expenseData = await getExpenseById(id);
        
        // Verify that this expense belongs to the current shop
        if (expenseData.shopId !== currentUser.uid) {
          throw new Error('You do not have permission to edit this expense');
        }
        
        // Format amount as string for form input
        expenseData.amount = expenseData.amount.toString();
        
        setFormData(expenseData);
      } catch (error) {
        console.error('Error fetching expense data:', error);
        setError('Failed to load expense data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser, id]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser || !id) return;
    
    // Validate form
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!formData.expenseDate) {
      setError('Date is required');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // Prepare expense data
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        shopId: currentUser.uid
      };
      
      // Update expense in database
      await updateExpense(id, expenseData);
      
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/expenses');
      }, 1500);
    } catch (error) {
      console.error('Error updating expense:', error);
      setError('Failed to update expense. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <>
      <MainNavbar />
      <Container className="pb-4">
        <div className="d-flex justify-content-between align-items-center my-3">
          <h2><Translate textKey="editExpense" fallback="Edit Expense" /></h2>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/expenses')}
          >
            <Translate textKey="back" fallback="Back to Expenses" />
          </Button>
        </div>
        
        {success && (
          <Alert variant="success">
            <Translate textKey="expenseUpdatedSuccess" fallback="Expense updated successfully!" />
          </Alert>
        )}
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-3"><Translate textKey="loadingExpenseData" fallback="Loading expense data..." /></p>
          </div>
        ) : (
          <Card className="shadow-sm">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><Translate textKey="description" fallback="Description" /> *</Form.Label>
                      <Form.Control
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><Translate textKey="amount" fallback="Amount" /> *</Form.Label>
                      <Form.Control
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        min="0.01"
                        step="0.01"
                        disabled={submitting}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><Translate textKey="date" fallback="Date" /> *</Form.Label>
                      <Form.Control
                        type="date"
                        name="expenseDate"
                        value={formData.expenseDate}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><Translate textKey="category" fallback="Category" /></Form.Label>
                      <Form.Select
                        name="categoryId"
                        value={formData.categoryId || ''}
                        onChange={handleChange}
                        disabled={submitting}
                      >
                        <option value="">
                          <Translate textKey="selectCategory" fallback="Select Category" />
                        </option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><Translate textKey="paymentMethod" fallback="Payment Method" /></Form.Label>
                      <Form.Select
                        name="paymentMethod"
                        value={formData.paymentMethod || 'cash'}
                        onChange={handleChange}
                        disabled={submitting}
                      >
                        <option value="cash"><Translate textKey="cash" fallback="Cash" /></option>
                        <option value="bank_transfer"><Translate textKey="bankTransfer" fallback="Bank Transfer" /></option>
                        <option value="credit_card"><Translate textKey="creditCard" fallback="Credit Card" /></option>
                        <option value="debit_card"><Translate textKey="debitCard" fallback="Debit Card" /></option>
                        <option value="check"><Translate textKey="check" fallback="Check" /></option>
                        <option value="other"><Translate textKey="other" fallback="Other" /></option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label><Translate textKey="notes" fallback="Notes (Optional)" /></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={12}>
                    <div className="d-flex justify-content-end mt-3">
                      <Button 
                        variant="secondary" 
                        className="me-2"
                        onClick={() => navigate('/expenses')}
                        disabled={submitting}
                      >
                        <Translate textKey="cancel" fallback="Cancel" />
                      </Button>
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            <Translate textKey="saving" fallback="Saving..." />
                          </>
                        ) : (
                          <Translate textKey="updateExpense" fallback="Update Expense" />
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        )}
      </Container>
    </>
  );
};

export default EditExpense;