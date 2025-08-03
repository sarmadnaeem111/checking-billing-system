import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { Translate } from '../utils';
import { addExpense, getExpenseCategories, addExpenseCategory } from '../utils/expenseUtils';

const AddExpense = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    categoryId: '',
    paymentMethod: 'cash',
    notes: '',
    receiptImage: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  
  // Fetch expense categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError('');
      
      try {
        const categoriesData = await getExpenseCategories(currentUser.uid);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching expense categories:', error);
        setError('Failed to load expense categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [currentUser]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle new category form changes
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
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
        shopId: currentUser.uid,
        timestamp: new Date().toISOString()
      };
      
      // Add expense to database
      await addExpense(expenseData);
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        description: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        categoryId: formData.categoryId, // Keep the same category for convenience
        paymentMethod: 'cash',
        notes: '',
        receiptImage: ''
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/expenses');
      }, 1500);
    } catch (error) {
      console.error('Error adding expense:', error);
      setError('Failed to add expense. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle adding a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    // Validate category name
    if (!newCategory.name.trim()) {
      setCategoryError('Category name is required');
      return;
    }
    
    setCategoryLoading(true);
    setCategoryError('');
    
    try {
      // Prepare category data
      const categoryData = {
        ...newCategory,
        shopId: currentUser.uid,
        timestamp: new Date().toISOString()
      };
      
      // Add category to database
      const categoryId = await addExpenseCategory(categoryData);
      
      // Add new category to state
      const newCategoryWithId = {
        id: categoryId,
        ...categoryData
      };
      
      setCategories(prev => [...prev, newCategoryWithId]);
      
      // Select the new category
      setFormData(prev => ({
        ...prev,
        categoryId: categoryId
      }));
      
      // Reset new category form
      setNewCategory({ name: '', description: '' });
      setShowNewCategoryForm(false);
    } catch (error) {
      console.error('Error adding category:', error);
      setCategoryError('Failed to add category. Please try again.');
    } finally {
      setCategoryLoading(false);
    }
  };
  
  return (
    <>
      <MainNavbar />
      <Container className="pb-4">
        <div className="d-flex justify-content-between align-items-center my-3">
          <h2><Translate textKey="addExpense" fallback="Add Expense" /></h2>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/expenses')}
          >
            <Translate textKey="back" fallback="Back to Expenses" />
          </Button>
        </div>
        
        {success && (
          <Alert variant="success">
            <Translate textKey="expenseAddedSuccess" fallback="Expense added successfully!" />
          </Alert>
        )}
        
        {error && <Alert variant="danger">{error}</Alert>}
        
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
                    <Form.Label className="d-flex justify-content-between">
                      <span><Translate textKey="category" fallback="Category" /></span>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0" 
                        onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                      >
                        {showNewCategoryForm ? (
                          <Translate textKey="cancel" fallback="Cancel" />
                        ) : (
                          <Translate textKey="addNewCategory" fallback="+ Add New Category" />
                        )}
                      </Button>
                    </Form.Label>
                    
                    {!showNewCategoryForm ? (
                      <Form.Select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        disabled={submitting || loading}
                      >
                        <option value="">
                          {loading ? (
                            <Translate textKey="loading" fallback="Loading..." />
                          ) : (
                            <Translate textKey="selectCategory" fallback="Select Category" />
                          )}
                        </option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                    ) : (
                      <Card className="mt-2 mb-3 border-light">
                        <Card.Body className="p-3">
                          <h6><Translate textKey="newCategory" fallback="New Category" /></h6>
                          {categoryError && <Alert variant="danger" className="py-2">{categoryError}</Alert>}
                          
                          <Form.Group className="mb-2">
                            <Form.Label><Translate textKey="categoryName" fallback="Category Name" /> *</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={newCategory.name}
                              onChange={handleCategoryChange}
                              required
                              disabled={categoryLoading}
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-2">
                            <Form.Label><Translate textKey="categoryDescription" fallback="Description (Optional)" /></Form.Label>
                            <Form.Control
                              type="text"
                              name="description"
                              value={newCategory.description}
                              onChange={handleCategoryChange}
                              disabled={categoryLoading}
                            />
                          </Form.Group>
                          
                          <div className="d-flex justify-content-end">
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={handleAddCategory}
                              disabled={categoryLoading}
                            >
                              {categoryLoading ? (
                                <>
                                  <Spinner animation="border" size="sm" className="me-1" />
                                  <Translate textKey="saving" fallback="Saving..." />
                                </>
                              ) : (
                                <Translate textKey="saveCategory" fallback="Save Category" />
                              )}
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    )}
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><Translate textKey="paymentMethod" fallback="Payment Method" /></Form.Label>
                    <Form.Select
                      name="paymentMethod"
                      value={formData.paymentMethod}
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
                      value={formData.notes}
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
                        <Translate textKey="saveExpense" fallback="Save Expense" />
                      )}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default AddExpense;