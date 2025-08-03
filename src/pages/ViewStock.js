import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Card, Form, InputGroup, Row, Col, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { getShopStock, deleteStockItem } from '../utils/stockUtils';
import './ViewStock.css'; // Import the custom CSS
import { Translate, useTranslatedAttribute } from '../utils';

const ViewStock = () => {
  const { currentUser } = useAuth();
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();
  
  // Get translations for attributes
  const getTranslatedAttr = useTranslatedAttribute();

  const fetchStock = useCallback(() => {
    if (!currentUser) return;
    
    setLoading(true);
    
    // Create a simple function to fetch stock items
    getShopStock(currentUser.uid)
      .then(stockData => {
        console.log('Stock data fetched:', stockData);
        setStockItems(stockData);
      })
      .catch(error => {
        console.error('Error fetching stock items:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser]);

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    fetchStock();
  }, [fetchStock, currentUser, navigate]);

  // Get unique categories for filter dropdown
  const categories = [...new Set(stockItems.map(item => item.category))].filter(Boolean);

  // Handle search and filtering
  const filteredItems = stockItems
    .filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Handle client-side sorting
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'price') {
        comparison = parseFloat(a.price) - parseFloat(b.price);
      } else if (sortField === 'quantity') {
        comparison = parseFloat(a.quantity) - parseFloat(b.quantity);
      } else if (sortField === 'updatedAt') {
        comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // Delete stock item
  const handleDelete = () => {
    if (!itemToDelete) return;
    
    deleteStockItem(itemToDelete.id)
      .then(() => {
        fetchStock(); // Refresh the list
        setShowDeleteModal(false);
        setItemToDelete(null);
      })
      .catch(error => {
        console.error('Error deleting stock item:', error);
      });
  };

  // Determine badge color based on quantity
  const getQuantityBadgeVariant = (quantity) => {
    if (quantity <= 0) return 'danger';
    if (quantity <= 10) return 'warning';
    return 'success';
  };

  return (
    <>
      <MainNavbar />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2><Translate textKey="stockInventory" /></h2>
          <Button 
            variant="success" 
            onClick={() => navigate('/add-stock')}
          >
            <Translate textKey="addNewItem" />
          </Button>
        </div>
        
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={6} lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label><Translate textKey="searchItems" /></Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder={getTranslatedAttr("searchItemsPlaceholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setSearchTerm('')}
                      >
                        <Translate textKey="clear" />
                      </Button>
                    )}
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={6} lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label><Translate textKey="filterByCategory" /></Form.Label>
                  <Form.Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value=""><Translate textKey="allCategories" /></option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        {loading ? (
          <p className="text-center"><Translate textKey="loadingStockItems" /></p>
        ) : (
          <Card>
            <Card.Body>
              {filteredItems.length > 0 ? (
                <div className="table-responsive stock-table-container">
                  <Table hover responsive="sm" className="stock-table">
                    <thead>
                      <tr>
                        <th 
                          className="cursor-pointer" 
                          onClick={() => handleSort('name')}
                        >
                          <Translate textKey="itemName" />
                          {sortField === 'name' && (
                            <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th className="description-column"><Translate textKey="description" /></th>
                        <th><Translate textKey="category" /></th>
                        <th 
                          className="cursor-pointer"
                          onClick={() => handleSort('price')}
                        >
                          <Translate textKey="price" /> (RS)
                          {sortField === 'price' && (
                            <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th 
                          className="cursor-pointer"
                          onClick={() => handleSort('quantity')}
                        >
                          <Translate textKey="quantity" />
                          {sortField === 'quantity' && (
                            <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th 
                          className="cursor-pointer"
                          onClick={() => handleSort('updatedAt')}
                        >
                          <Translate textKey="lastUpdated" />
                          {sortField === 'updatedAt' && (
                            <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th><Translate textKey="actions" /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(item => (
                        <tr key={item.id}>
                          <td data-label={getTranslatedAttr("itemName")} className="text-nowrap">{item.name}</td>
                          <td data-label={getTranslatedAttr("description")} className="description-column">
                            <div className="description-cell-content">
                              {item.description || '-'}
                            </div>
                          </td>
                          <td data-label={getTranslatedAttr("category")}>{item.category || '-'}</td>
                          <td data-label={getTranslatedAttr("price")}>RS{parseFloat(item.price).toFixed(2)}</td>
                          <td data-label={getTranslatedAttr("quantity")}>
                            <Badge bg={getQuantityBadgeVariant(item.quantity)}>
                              {item.quantity} {item.quantityUnit === 'kg' ? 'KG' : 'Units'}
                            </Badge>
                          </td>
                          <td data-label={getTranslatedAttr("lastUpdated")}>{new Date(item.updatedAt).toLocaleDateString()}</td>
                          <td data-label={getTranslatedAttr("actions")}>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => navigate(`/edit-stock/${item.id}`)}
                              className="me-1 mb-1"
                            >
                              <Translate textKey="edit" />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => confirmDelete(item)}
                              className="mb-1"
                            >
                              <Translate textKey="delete" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-center">
                  {stockItems.length > 0 
                    ? <Translate textKey="noItemsMatch" />
                    : <Translate textKey="noItemsFound" />}
                </p>
              )}
            </Card.Body>
          </Card>
        )}
        
        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title><Translate textKey="confirmDelete" /></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><Translate textKey="deleteItemConfirmation" /></p>
            {itemToDelete && <p><strong>{itemToDelete.name}</strong></p>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              <Translate textKey="cancel" />
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <Translate textKey="delete" />
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default ViewStock; 