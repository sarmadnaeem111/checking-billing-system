import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { getStockItemById, updateStockItem } from '../utils/stockUtils';

const EditStockItem = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('units'); // Default to units
  const [costPrice, setCostPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [sku, setSku] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemLoading, setItemLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch stock item data
  useEffect(() => {
    if (!currentUser || !id) return;
    
    getStockItemById(id)
      .then(item => {
        // Check if item belongs to current user
        if (item.shopId !== currentUser.uid) {
          throw new Error('You do not have permission to edit this item');
        }
        
        // Populate form fields
        setName(item.name || '');
        setDescription(item.description || '');
        setCategory(item.category || '');
        setPrice(item.price?.toString() || '');
        setQuantity(item.quantity?.toString() || '');
        setQuantityUnit(item.quantityUnit || 'units'); // Set quantityUnit from item data or default to units
        setCostPrice(item.costPrice?.toString() || '');
        setSupplier(item.supplier || '');
        setSku(item.sku || '');
      })
      .catch(error => {
        setError('Failed to load item: ' + error.message);
        console.error('Error loading stock item:', error);
      })
      .finally(() => {
        setItemLoading(false);
      });
  }, [id, currentUser]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);
    
    // Validation
    if (!name.trim()) {
      setError('Item name is required');
      setLoading(false);
      return;
    }
    
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      setError('Price must be a valid number');
      setLoading(false);
      return;
    }
    
    if (isNaN(parseFloat(quantity)) || parseFloat(quantity) < 0) {
      setError('Quantity must be a valid number');
      setLoading(false);
      return;
    }
    
    if (costPrice && (isNaN(parseFloat(costPrice)) || parseFloat(costPrice) < 0)) {
      setError('Cost price must be a valid number');
      setLoading(false);
      return;
    }
    
    // Create updated item data
    const itemData = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      price: parseFloat(price),
      quantity: parseFloat(quantity), // Changed to parseFloat to support decimal values for kg
      quantityUnit: quantityUnit, // Store the unit (kg or units)
      costPrice: costPrice ? parseFloat(costPrice) : null,
      supplier: supplier.trim(),
      sku: sku.trim()
    };
    
    // Update in Firestore
    updateStockItem(id, itemData)
      .then(() => {
        navigate('/stock');
      })
      .catch(error => {
        setError('Failed to update stock item: ' + error.message);
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (itemLoading) {
    return (
      <>
        <MainNavbar />
        <Container className="text-center mt-5">
          <p>Loading item data...</p>
        </Container>
      </>
    );
  }

  if (error && !name) {
    return (
      <>
        <MainNavbar />
        <Container className="mt-4">
          <Alert variant="danger">{error}</Alert>
          <Button 
            variant="primary" 
            onClick={() => navigate('/stock')}
          >
            Back to Inventory
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <MainNavbar />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Edit Stock Item</h2>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/stock')}
          >
            Back to Inventory
          </Button>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Item Name*</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Electronics, Groceries, etc."
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product details, specifications, etc."
                />
              </Form.Group>
              
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Selling Price (RS)*</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cost Price (RS)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="Optional"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity*</Form.Label>
                    <Row>
                      <Col xs={7}>
                        <Form.Control
                          type="number"
                          min="0"
                          step={quantityUnit === 'kg' ? '0.01' : '1'} // Allow decimals for kg
                          required
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </Col>
                      <Col xs={5}>
                        <Form.Select 
                          value={quantityUnit}
                          onChange={(e) => setQuantityUnit(e.target.value)}
                        >
                          <option value="units">Units</option>
                          <option value="kg">KG</option>
                        </Form.Select>
                      </Col>
                    </Row>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Supplier</Form.Label>
                    <Form.Control
                      type="text"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      placeholder="Optional"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>SKU/Barcode</Form.Label>
                    <Form.Control
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="Optional"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex mt-4">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                  className="me-2"
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/stock')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default EditStockItem; 