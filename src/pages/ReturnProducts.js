import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Table, Alert, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { getReceiptById, formatCurrency, updateReceipt } from '../utils/receiptUtils';
import { restoreStockQuantity } from '../utils/stockUtils';
import { Translate, useTranslatedData } from '../utils';
import './ViewReceipt.css'; // Reuse the receipt styling

const ReturnProducts = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [returnItems, setReturnItems] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [processingReturn, setProcessingReturn] = useState(false);
  const navigate = useNavigate();

  // Translate receipt data
  const translatedReceipt = useTranslatedData(receipt);

  useEffect(() => {
    // Fetch the receipt data
    const fetchReceipt = () => {
      if (currentUser && id) {
        getReceiptById(id)
          .then(receiptData => {
            // Check if receipt belongs to current user
            if (receiptData.shopId !== currentUser.uid) {
              throw new Error('You do not have permission to view this receipt');
            }
            
            setReceipt(receiptData);
            
            // Initialize return items with all receipt items set to 0 quantity
            const initialReturnItems = receiptData.items.map(item => ({
              ...item,
              returnQuantity: 0,
              isReturning: false
            }));
            setReturnItems(initialReturnItems);
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

  // Handle checkbox change for returning an item
  const handleReturnCheckboxChange = (index) => {
    const updatedItems = [...returnItems];
    updatedItems[index].isReturning = !updatedItems[index].isReturning;
    
    // If checked, set return quantity to max available quantity
    if (updatedItems[index].isReturning) {
      updatedItems[index].returnQuantity = parseFloat(updatedItems[index].quantity);
    } else {
      updatedItems[index].returnQuantity = 0;
    }
    
    setReturnItems(updatedItems);
  };

  // Handle return quantity change
  const handleReturnQuantityChange = (index, value) => {
    const updatedItems = [...returnItems];
    const maxQuantity = parseFloat(updatedItems[index].quantity);
    let newQuantity = parseFloat(value) || 0;
    
    // Ensure return quantity doesn't exceed original quantity
    newQuantity = Math.min(newQuantity, maxQuantity);
    newQuantity = Math.max(newQuantity, 0);
    
    updatedItems[index].returnQuantity = newQuantity;
    updatedItems[index].isReturning = newQuantity > 0;
    
    setReturnItems(updatedItems);
  };

  // Calculate total return amount
  const calculateReturnTotal = () => {
    return returnItems
      .filter(item => item.isReturning && item.returnQuantity > 0)
      .reduce((total, item) => {
        return total + (parseFloat(item.price) * parseFloat(item.returnQuantity));
      }, 0);
  };

  // Check if any items are selected for return
  const hasItemsToReturn = () => {
    return returnItems.some(item => item.isReturning && item.returnQuantity > 0);
  };

  // Handle return confirmation
  const handleConfirmReturn = () => {
    if (!hasItemsToReturn()) {
      setError('Please select at least one item to return');
      return;
    }
    
    setShowConfirmModal(true);
  };

  // Process the return
  const processReturn = async () => {
    if (!hasItemsToReturn() || !receipt) return;
    
    setProcessingReturn(true);
    setError('');
    
    try {
      // 1. Get items being returned
      const itemsToReturn = returnItems
        .filter(item => item.isReturning && item.returnQuantity > 0)
        .map(item => ({
          name: item.name,
          quantity: item.returnQuantity,
          quantityUnit: item.quantityUnit || 'units',
          price: item.price,
          costPrice: item.costPrice || 0,
          category: item.category || 'Uncategorized'
        }));
      
      // 2. Restore stock quantities for returned items
      await restoreStockQuantity(receipt.shopId, itemsToReturn);
      
      // 3. Update the receipt with return information
      const returnAmount = calculateReturnTotal();
      const returnData = {
        returnInfo: {
          returnDate: new Date().toISOString(),
          returnedItems: returnItems
            .filter(item => item.isReturning && item.returnQuantity > 0)
            .map(item => ({
              name: item.name,
              quantity: item.returnQuantity,
              price: item.price,
              costPrice: item.costPrice || 0,
              category: item.category || 'Uncategorized',
              total: (parseFloat(item.price) * parseFloat(item.returnQuantity)).toFixed(2)
            })),
          returnTotal: returnAmount.toFixed(2),
          returnReason: returnReason.trim(),
          processedBy: currentUser.email,
          // Flag to indicate this receipt has returns for sales analytics
          affectsSalesAnalytics: true
        }
      };
      
      // 4. Update the receipt with return information
      await updateReceipt(receipt.id, returnData);
      
      // Show success message
      setSuccess(`Successfully processed return. Amount: ${formatCurrency(returnAmount)}`);
      setShowConfirmModal(false);
      
      // Reset form
      const resetItems = returnItems.map(item => ({
        ...item,
        returnQuantity: 0,
        isReturning: false
      }));
      setReturnItems(resetItems);
      setReturnReason('');
      
      // Refresh receipt data
      const updatedReceipt = await getReceiptById(id);
      setReceipt(updatedReceipt);
      
    } catch (error) {
      console.error('Error processing return:', error);
      setError('Failed to process return: ' + error.message);
    } finally {
      setProcessingReturn(false);
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

  // Check if this receipt already has returns processed
  const hasReturns = receipt.returnInfo && receipt.returnInfo.returnedItems;

  return (
    <>
      <MainNavbar />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Return Products</h2>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate(`/receipt/${id}`)}
          >
            Back to Receipt
          </Button>
        </div>
        
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        {/* Receipt Information */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Receipt Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>Receipt #:</strong> {receipt.transactionId}</p>
                <p><strong>Date:</strong> {new Date(receipt.timestamp).toLocaleDateString()}</p>
                <p><strong>Cashier:</strong> {receipt.cashierName}</p>
              </Col>
              <Col md={6}>
                <p><strong>Total Amount:</strong> {formatCurrency(receipt.totalAmount)}</p>
                <p><strong>Payment Method:</strong> {receipt.paymentMethod}</p>
                {receipt.discount > 0 && (
                  <p><strong>Discount Applied:</strong> {formatCurrency(receipt.discount)}</p>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        {/* Previous Returns (if any) */}
        {hasReturns && (
          <Card className="mb-4">
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">Previous Returns</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Return Date:</strong> {new Date(receipt.returnInfo.returnDate).toLocaleString()}</p>
              <p><strong>Return Total:</strong> {formatCurrency(receipt.returnInfo.returnTotal)}</p>
              {receipt.returnInfo.returnReason && (
                <p><strong>Return Reason:</strong> {receipt.returnInfo.returnReason}</p>
              )}
              
              <h6 className="mt-3">Returned Items:</h6>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.returnInfo.returnedItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
        
        {/* Return Items Form */}
        <Card>
          <Card.Header>
            <h5 className="mb-0">Select Items to Return</h5>
          </Card.Header>
          <Card.Body>
            {hasReturns ? (
              <Alert variant="info">
                This receipt already has processed returns. To process additional returns, please contact an administrator.
              </Alert>
            ) : (
              <>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Return</th>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Original Qty</th>
                      <th>Return Qty</th>
                      <th>Return Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <Form.Check 
                            type="checkbox"
                            checked={item.isReturning}
                            onChange={() => handleReturnCheckboxChange(index)}
                          />
                        </td>
                        <td>{item.name}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{item.quantity} {item.quantityUnit === 'kg' ? 'KG' : ''}</td>
                        <td>
                          <Form.Control
                            type="number"
                            min="0"
                            max={item.quantity}
                            step={item.quantityUnit === 'kg' ? '0.001' : '1'}
                            value={item.returnQuantity}
                            onChange={(e) => handleReturnQuantityChange(index, e.target.value)}
                            disabled={!item.isReturning}
                          />
                        </td>
                        <td>
                          {formatCurrency(parseFloat(item.price) * parseFloat(item.returnQuantity))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="5" className="text-end">Total Return Amount:</th>
                      <th>{formatCurrency(calculateReturnTotal())}</th>
                    </tr>
                  </tfoot>
                </Table>
                
                <Form.Group className="mb-3">
                  <Form.Label>Return Reason</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Enter reason for return (optional)"
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="primary"
                    onClick={handleConfirmReturn}
                    disabled={!hasItemsToReturn()}
                  >
                    Process Return
                  </Button>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
        
        {/* Confirmation Modal */}
        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Return</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to process this return?</p>
            <p><strong>Return Amount:</strong> {formatCurrency(calculateReturnTotal())}</p>
            <p><strong>Items to Return:</strong></p>
            <ul>
              {returnItems
                .filter(item => item.isReturning && item.returnQuantity > 0)
                .map((item, index) => (
                  <li key={index}>
                    {item.name} - {item.returnQuantity} {item.quantityUnit === 'kg' ? 'KG' : 'units'} 
                    ({formatCurrency(parseFloat(item.price) * parseFloat(item.returnQuantity))})
                  </li>
                ))}
            </ul>
            <p className="text-danger">This action will update inventory and modify the receipt.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={processReturn}
              disabled={processingReturn}
            >
              {processingReturn ? 'Processing...' : 'Confirm Return'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default ReturnProducts;