import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col, Form, Alert, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { getReceiptById, updateReceipt, formatCurrency } from '../utils/receiptUtils';
import './ViewReceipt.css';

const EditReceipt = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [cashierName, setCashierName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Create a non-async function for useEffect
    const fetchReceipt = () => {
      if (currentUser && id) {
        getReceiptById(id)
          .then(receiptData => {
            // Check if receipt belongs to current user
            if (receiptData.shopId !== currentUser.uid) {
              throw new Error('You do not have permission to edit this receipt');
            }
            
            setReceipt(receiptData);
            // Initialize form state with receipt data
            setCashierName(receiptData.cashierName || '');
            setManagerName(receiptData.managerName || '');
            setPaymentMethod(receiptData.paymentMethod || '');
            setDiscount(receiptData.discount || 0);
            setItems(receiptData.items || []);
          })
          .catch(error => {
            setError('Failed to load receipt: ' + error.message);
            console.error('Error fetching receipt:', error);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };

    fetchReceipt();
  }, [id, currentUser]);

  // Handle item quantity change
  const handleQuantityChange = (index, value) => {
    const newItems = [...items];
    newItems[index].quantity = value;
    setItems(newItems);
  };

  // Handle item price change
  const handlePriceChange = (index, value) => {
    const newItems = [...items];
    newItems[index].price = value;
    setItems(newItems);
  };

  // Calculate item total
  const calculateItemTotal = (price, quantity) => {
    return (parseFloat(price) * parseFloat(quantity)).toFixed(2);
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (parseFloat(item.price) * parseFloat(item.quantity)), 0).toFixed(2);
  };

  // Calculate total amount
  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const discountAmount = parseFloat(discount) || 0;
    return (subtotal - discountAmount).toFixed(2);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      // Prepare updated receipt data
      const updatedData = {
        cashierName,
        managerName,
        paymentMethod,
        discount: parseFloat(discount) || 0,
        items,
        totalAmount: parseFloat(calculateTotal())
      };

      // Update receipt in Firestore
      await updateReceipt(id, updatedData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/receipt/${id}`);
      }, 2000);
    } catch (error) {
      setError('Failed to update receipt: ' + error.message);
      console.error('Error updating receipt:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <MainNavbar />
        <Container className="text-center mt-5">
          <p>Loading receipt...</p>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MainNavbar />
        <Container className="mt-4">
          <Alert variant="danger">{error}</Alert>
          <Button 
            variant="primary" 
            onClick={() => navigate('/receipts')}
          >
            Back to Receipts
          </Button>
        </Container>
      </>
    );
  }

  if (!receipt) {
    return (
      <>
        <MainNavbar />
        <Container className="mt-4">
          <Alert variant="warning">Receipt not found</Alert>
          <Button 
            variant="primary" 
            onClick={() => navigate('/receipts')}
          >
            Back to Receipts
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <MainNavbar />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4 receipt-header">
          <h2>Edit Receipt</h2>
          <div className="receipt-buttons">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate(`/receipt/${id}`)}
            >
              Cancel
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={() => navigate('/receipts')}
            >
              Back to Receipts
            </Button>
          </div>
        </div>

        {success && (
          <Alert variant="success" className="mb-4">
            Receipt updated successfully! Redirecting...
          </Alert>
        )}
        
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Transaction ID</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={receipt.transactionId} 
                      disabled 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={new Date(receipt.timestamp).toLocaleString()} 
                      disabled 
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cashier Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={cashierName} 
                      onChange={(e) => setCashierName(e.target.value)} 
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Manager Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={managerName} 
                      onChange={(e) => setManagerName(e.target.value)} 
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Payment">Mobile Payment</option>
                </Form.Select>
              </Form.Group>

              <h4 className="mt-4 mb-3">Items</h4>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>
                          <Form.Control 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            value={item.price} 
                            onChange={(e) => handlePriceChange(index, e.target.value)} 
                            required 
                          />
                        </td>
                        <td>
                          <Form.Control 
                            type="number" 
                            min="0.01" 
                            step="0.01" 
                            value={item.quantity} 
                            onChange={(e) => handleQuantityChange(index, e.target.value)} 
                            required 
                          />
                        </td>
                        <td>{formatCurrency(calculateItemTotal(item.price, item.quantity))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="3" className="text-end">Subtotal:</th>
                      <th>{formatCurrency(calculateSubtotal())}</th>
                    </tr>
                    <tr>
                      <th colSpan="3" className="text-end">Discount:</th>
                      <td>
                        <Form.Control 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          value={discount} 
                          onChange={(e) => setDiscount(e.target.value)} 
                        />
                      </td>
                    </tr>
                    <tr>
                      <th colSpan="3" className="text-end">Total:</th>
                      <th>{formatCurrency(calculateTotal())}</th>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <Button 
                  variant="secondary" 
                  className="me-2" 
                  onClick={() => navigate(`/receipt/${id}`)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default EditReceipt;