import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, ListGroup, Image, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { Translate, useTranslatedAttribute } from '../utils';
import cloudinaryConfig from '../utils/cloudinaryConfig';

const Settings = () => {
  const { shopData, updateShopData } = useAuth();
  
  // Get translations for attributes
  const getTranslatedAttr = useTranslatedAttribute();
  
  // Basic shop info
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [receiptDescription, setReceiptDescription] = useState('');
  
  // Phone numbers
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  
  // Cashier and Manager names
  const [cashierNames, setCashierNames] = useState([]);
  const [newCashierName, setNewCashierName] = useState('');
  const [managerNames, setManagerNames] = useState([]);
  const [newManagerName, setNewManagerName] = useState('');
  
  // UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // File input reference
  const fileInputRef = useRef(null);
  
  // Load shop data
  useEffect(() => {
    if (shopData) {
      setShopName(shopData.shopName || '');
      setAddress(shopData.address || '');
      setLogoUrl(shopData.logoUrl || '');
      setReceiptDescription(shopData.receiptDescription || '');
      
      // Load phone numbers (convert from string if necessary)
      if (shopData.phoneNumbers && Array.isArray(shopData.phoneNumbers)) {
        setPhoneNumbers(shopData.phoneNumbers);
      } else if (shopData.phoneNumber) {
        setPhoneNumbers([shopData.phoneNumber]);
      } else {
        setPhoneNumbers([]);
      }
      
      // Load cashier and manager names
      setCashierNames(shopData.cashierNames || []);
      setManagerNames(shopData.managerNames || []);
    }
  }, [shopData]);
  
  // Handle logo upload to Cloudinary
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file should be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.upload_preset);
      
      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      const data = await response.json();
      
      if (data.secure_url) {
        setLogoUrl(data.secure_url);
        setSuccess('Logo uploaded successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.error?.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setError('Failed to upload logo: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle removing the logo
  const handleRemoveLogo = () => {
    setLogoUrl('');
  };
  
  // Handle adding a new phone number
  const handleAddPhoneNumber = () => {
    if (!newPhoneNumber.trim()) return;
    
    // Check if phone number already exists
    if (phoneNumbers.includes(newPhoneNumber.trim())) {
      setError(getTranslatedAttr('phoneNumberExists'));
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setPhoneNumbers([...phoneNumbers, newPhoneNumber.trim()]);
    setNewPhoneNumber('');
  };
  
  // Handle removing a phone number
  const handleRemovePhoneNumber = (index) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers.splice(index, 1);
    setPhoneNumbers(newPhoneNumbers);
  };
  
  // Handle adding a new cashier name
  const handleAddCashierName = () => {
    if (!newCashierName.trim()) return;
    
    // Check if name already exists
    if (cashierNames.includes(newCashierName.trim())) {
      setError(getTranslatedAttr('cashierNameExists'));
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setCashierNames([...cashierNames, newCashierName.trim()]);
    setNewCashierName('');
  };
  
  // Handle removing a cashier name
  const handleRemoveCashierName = (index) => {
    const newCashierNames = [...cashierNames];
    newCashierNames.splice(index, 1);
    setCashierNames(newCashierNames);
  };
  
  // Handle adding a new manager name
  const handleAddManagerName = () => {
    if (!newManagerName.trim()) return;
    
    // Check if name already exists
    if (managerNames.includes(newManagerName.trim())) {
      setError(getTranslatedAttr('managerNameExists'));
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setManagerNames([...managerNames, newManagerName.trim()]);
    setNewManagerName('');
  };
  
  // Handle removing a manager name
  const handleRemoveManagerName = (index) => {
    const newManagerNames = [...managerNames];
    newManagerNames.splice(index, 1);
    setManagerNames(newManagerNames);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate shop name
    if (!shopName.trim()) {
      setError(getTranslatedAttr('shopNameRequired'));
      return;
    }
    
    setError('');
    setLoading(true);
    
    // Create updated shop data
    const updatedData = {
      shopName: shopName.trim(),
      address: address.trim(),
      phoneNumbers: phoneNumbers,
      phoneNumber: phoneNumbers[0] || '', // Keep the first phone as main for backward compatibility
      cashierNames: cashierNames,
      managerNames: managerNames,
      logoUrl: logoUrl, // Include the logo URL in shop data
      receiptDescription: receiptDescription.trim(),
      updatedAt: new Date().toISOString()
    };
    
    // Update shop data in Firestore
    updateShopData(updatedData)
      .then(() => {
        setSuccess(getTranslatedAttr('settingsUpdated'));
        setTimeout(() => setSuccess(''), 5000);
      })
      .catch(error => {
        setError(getTranslatedAttr('failedToUpdateSettings') + error.message);
        console.error('Error updating settings:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="mb-4"><Translate textKey="shopSettings" /></h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <h4 className="mb-3"><Translate textKey="basicInformation" /></h4>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><Translate textKey="shopName" /></Form.Label>
                    <Form.Control
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder={getTranslatedAttr("enterShopName")}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><Translate textKey="address" /></Form.Label>
                    <Form.Control
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={getTranslatedAttr("enterShopAddress")}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Receipt Description */}
              <Form.Group className="mb-3">
                <Form.Label><Translate textKey="receiptDescription" fallback="Receipt Description" /></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={receiptDescription}
                  onChange={(e) => setReceiptDescription(e.target.value)}
                  placeholder="Enter a custom message to display at the bottom of receipts"
                />
                <Form.Text className="text-muted">
                  This message will appear at the bottom of all receipts.
                </Form.Text>
              </Form.Group>
              
              {/* Shop Logo Upload Section */}
              <h4 className="mb-3 mt-4"><Translate textKey="shopLogo" fallback="Shop Logo" /></h4>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><Translate textKey="uploadLogo" fallback="Upload Logo" /></Form.Label>
                    <div className="d-flex mb-3">
                      <Form.Control
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="me-2"
                        disabled={isUploading}
                      />
                    </div>
                    <Form.Text className="text-muted">
                      <Translate textKey="logoUploadHelp" fallback="Upload a logo to display on receipts. Maximum size: 5MB." />
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex align-items-center justify-content-center">
                  {isUploading ? (
                    <div className="text-center">
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span><Translate textKey="uploading" fallback="Uploading..." /></span>
                    </div>
                  ) : logoUrl ? (
                    <div className="text-center">
                      <div className="mb-2" style={{ maxWidth: '150px', margin: '0 auto' }}>
                        <Image src={logoUrl} alt="Shop Logo" fluid className="mb-2" style={{ maxHeight: '150px' }} />
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={handleRemoveLogo}
                      >
                        <Translate textKey="removeLogo" fallback="Remove Logo" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted">
                      <div style={{ border: '2px dashed #ccc', padding: '2rem', borderRadius: '8px' }}>
                        <Translate textKey="noLogoUploaded" fallback="No logo uploaded" />
                      </div>
                    </div>
                  )}
                </Col>
              </Row>
              
              <h4 className="mb-3 mt-4"><Translate textKey="phoneNumbers" /></h4>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label><Translate textKey="addNewPhoneNumber" /></Form.Label>
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        value={newPhoneNumber}
                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                        placeholder={getTranslatedAttr("enterPhoneNumber")}
                        className="me-2"
                      />
                      <Button 
                        variant="outline-primary" 
                        onClick={handleAddPhoneNumber}
                      >
                        <Translate textKey="add" />
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              
              {phoneNumbers.length > 0 && (
                <ListGroup className="mb-4">
                  {phoneNumbers.map((phone, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                      {phone}
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleRemovePhoneNumber(index)}
                      >
                        <Translate textKey="remove" />
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
              
              <h4 className="mb-3 mt-4"><Translate textKey="staffInformation" /></h4>
              
              <Row>
                <Col md={6}>
                  <h5 className="mb-2"><Translate textKey="cashierNames" /></h5>
                  <Form.Group className="mb-3">
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        value={newCashierName}
                        onChange={(e) => setNewCashierName(e.target.value)}
                        placeholder={getTranslatedAttr("enterCashierName")}
                        className="me-2"
                      />
                      <Button 
                        variant="outline-primary" 
                        onClick={handleAddCashierName}
                      >
                        <Translate textKey="add" />
                      </Button>
                    </div>
                  </Form.Group>
                  
                  {cashierNames.length > 0 && (
                    <ListGroup className="mb-4">
                      {cashierNames.map((name, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                          {name}
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRemoveCashierName(index)}
                          >
                            <Translate textKey="remove" />
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Col>
                
                <Col md={6}>
                  <h5 className="mb-2"><Translate textKey="managerNames" /></h5>
                  <Form.Group className="mb-3">
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        value={newManagerName}
                        onChange={(e) => setNewManagerName(e.target.value)}
                        placeholder={getTranslatedAttr("enterManagerName")}
                        className="me-2"
                      />
                      <Button 
                        variant="outline-primary" 
                        onClick={handleAddManagerName}
                      >
                        <Translate textKey="add" />
                      </Button>
                    </div>
                  </Form.Group>
                  
                  {managerNames.length > 0 && (
                    <ListGroup className="mb-4">
                      {managerNames.map((name, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                          {name}
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRemoveManagerName(index)}
                          >
                            <Translate textKey="remove" />
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end mt-4">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? <Translate textKey="saving" /> : <Translate textKey="save" />}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default Settings; 