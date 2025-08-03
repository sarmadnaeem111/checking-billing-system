import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Spinner, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { Translate } from '../utils';
import { getExpenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from '../utils/expenseUtils';

const ExpenseCategories = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New category form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  
  // Edit category form
  const [showEditForm, setShowEditForm] = useState(false);
  const [editCategory, setEditCategory] = useState({ id: '', name: '', description: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  
  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // Fetch categories
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
  
  // Handle new category form changes
  const handleNewCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle edit category form changes
  const handleEditCategoryChange = (e) => {
    const { name, value } = e.target;
    setEditCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle add category form submission
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    // Validate category name
    if (!newCategory.name.trim()) {
      setAddError('Category name is required');
      return;
    }
    
    setAddLoading(true);
    setAddError('');
    
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
      
      // Reset form and hide it
      setNewCategory({ name: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding category:', error);
      setAddError('Failed to add category. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };
  
  // Handle edit category form submission
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    
    if (!currentUser || !editCategory.id) return;
    
    // Validate category name
    if (!editCategory.name.trim()) {
      setEditError('Category name is required');
      return;
    }
    
    setEditLoading(true);
    setEditError('');
    
    try {
      // Prepare update data
      const updateData = {
        name: editCategory.name,
        description: editCategory.description,
        updatedAt: new Date().toISOString()
      };
      
      // Update category in database
      await updateExpenseCategory(editCategory.id, updateData);
      
      // Update category in state
      setCategories(prev => 
        prev.map(cat => 
          cat.id === editCategory.id ? { ...cat, ...updateData } : cat
        )
      );
      
      // Reset form and hide it
      setEditCategory({ id: '', name: '', description: '' });
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating category:', error);
      setEditError('Failed to update category. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };
  
  // Handle delete category
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      await deleteExpenseCategory(categoryToDelete.id);
      
      // Remove category from state
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
      
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category. Please try again.');
    }
  };
  
  // Handle edit button click
  const handleEditClick = (category) => {
    setEditCategory({
      id: category.id,
      name: category.name,
      description: category.description || ''
    });
    setShowEditForm(true);
  };
  
  return (
    <>
      <MainNavbar />
      <Container className="pb-4">
        <div className="d-flex justify-content-between align-items-center my-3">
          <h2><Translate textKey="expenseCategories" fallback="Expense Categories" /></h2>
          <div>
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/expenses')}
              className="me-2"
            >
              <Translate textKey="backToExpenses" fallback="Back to Expenses" />
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm}
            >
              <Translate textKey="addCategory" fallback="Add Category" />
            </Button>
          </div>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {/* Add Category Form */}
        {showAddForm && (
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5><Translate textKey="addNewCategory" fallback="Add New Category" /></h5>
                <Button 
                  variant="link" 
                  className="p-0" 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewCategory({ name: '', description: '' });
                    setAddError('');
                  }}
                >
                  <Translate textKey="cancel" fallback="Cancel" />
                </Button>
              </div>
              
              {addError && <Alert variant="danger">{addError}</Alert>}
              
              <Form onSubmit={handleAddCategory}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><Translate textKey="categoryName" fallback="Category Name" /> *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={newCategory.name}
                        onChange={handleNewCategoryChange}
                        required
                        disabled={addLoading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><Translate textKey="description" fallback="Description (Optional)" /></Form.Label>
                      <Form.Control
                        type="text"
                        name="description"
                        value={newCategory.description}
                        onChange={handleNewCategoryChange}
                        disabled={addLoading}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={addLoading}
                  >
                    {addLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        <Translate textKey="saving" fallback="Saving..." />
                      </>
                    ) : (
                      <Translate textKey="saveCategory" fallback="Save Category" />
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        )}
        
        {/* Edit Category Form */}
        {showEditForm && (
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5><Translate textKey="editCategory" fallback="Edit Category" /></h5>
                <Button 
                  variant="link" 
                  className="p-0" 
                  onClick={() => {
                    setShowEditForm(false);
                    setEditCategory({ id: '', name: '', description: '' });
                    setEditError('');
                  }}
                >
                  <Translate textKey="cancel" fallback="Cancel" />
                </Button>
              </div>
              
              {editError && <Alert variant="danger">{editError}</Alert>}
              
              <Form onSubmit={handleUpdateCategory}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><Translate textKey="categoryName" fallback="Category Name" /> *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={editCategory.name}
                        onChange={handleEditCategoryChange}
                        required
                        disabled={editLoading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><Translate textKey="description" fallback="Description (Optional)" /></Form.Label>
                      <Form.Control
                        type="text"
                        name="description"
                        value={editCategory.description}
                        onChange={handleEditCategoryChange}
                        disabled={editLoading}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        <Translate textKey="saving" fallback="Saving..." />
                      </>
                    ) : (
                      <Translate textKey="updateCategory" fallback="Update Category" />
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        )}
        
        {/* Categories Table */}
        <Card className="shadow-sm">
          <Card.Body>
            <h5><Translate textKey="categoriesList" fallback="Categories List" /></h5>
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" />
                <p className="mt-2"><Translate textKey="loading" fallback="Loading..." /></p>
              </div>
            ) : categories.length > 0 ? (
              <Table hover responsive>
                <thead>
                  <tr>
                    <th><Translate textKey="categoryName" fallback="Category Name" /></th>
                    <th><Translate textKey="description" fallback="Description" /></th>
                    <th><Translate textKey="actions" fallback="Actions" /></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.description || '-'}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          className="me-1"
                          onClick={() => handleEditClick(category)}
                        >
                          <Translate textKey="edit" fallback="Edit" />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteClick(category)}
                        >
                          <Translate textKey="delete" fallback="Delete" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Alert variant="info">
                <Translate textKey="noCategoriesYet" fallback="No categories yet. Add your first category!" />
              </Alert>
            )}
          </Card.Body>
        </Card>
      </Container>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title><Translate textKey="confirmDelete" fallback="Confirm Delete" /></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Translate 
            textKey="confirmDeleteCategoryMessage" 
            fallback="Are you sure you want to delete this category? This action cannot be undone."
          />
          {categoryToDelete && (
            <div className="mt-3">
              <p><strong><Translate textKey="categoryName" fallback="Category Name" />:</strong> {categoryToDelete.name}</p>
              {categoryToDelete.description && (
                <p><strong><Translate textKey="description" fallback="Description" />:</strong> {categoryToDelete.description}</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            <Translate textKey="cancel" fallback="Cancel" />
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <Translate textKey="delete" fallback="Delete" />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ExpenseCategories;