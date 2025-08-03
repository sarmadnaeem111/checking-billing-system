import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Row, Col, Alert, Form, InputGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { getShopSalaryRecords, deleteSalaryRecord, getSalaryStatistics } from '../utils/salaryUtils';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Translate, useTranslatedAttribute } from '../utils';

const SalaryManagement = () => {
  const { currentUser } = useAuth();
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statistics, setStatistics] = useState({
    totalAllTime: 0,
    totalCurrentMonth: 0,
    recordCount: 0,
    currentMonthCount: 0
  });
  const navigate = useNavigate();
  
  // Get translations for attributes
  const getTranslatedAttr = useTranslatedAttribute();

  // Fetch salary records and employees data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch salary records
        try {
          const records = await getShopSalaryRecords(currentUser.uid);
          setSalaryRecords(records);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load salary records. You may need to create Firestore indexes. Check console for details.');
          setSalaryRecords([]);
        }
        
        // Fetch employees for the shop
        try {
          const employeesRef = collection(db, 'employees');
          const employeesQuery = query(employeesRef, where('shopId', '==', currentUser.uid));
          const employeesSnapshot = await getDocs(employeesQuery);
          const employeesList = employeesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setEmployees(employeesList);
        } catch (err) {
          console.error('Error fetching employees:', err);
          setError(prev => prev ? `${prev} Failed to load employees.` : 'Failed to load employees.');
          setEmployees([]);
        }
        
        // Fetch salary statistics
        try {
          const stats = await getSalaryStatistics(currentUser.uid);
          setStatistics(stats);
        } catch (err) {
          console.error('Error fetching statistics:', err);
          // We already have default statistics from the updated getSalaryStatistics function
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);

  // Handle delete salary record
  const handleDelete = async (salaryId) => {
    if (window.confirm(getTranslatedAttr('confirmDeleteSalary'))) {
      try {
        await deleteSalaryRecord(salaryId);
        setSalaryRecords(salaryRecords.filter(record => record.id !== salaryId));
        
        // Update statistics
        const stats = await getSalaryStatistics(currentUser.uid);
        setStatistics(stats);
      } catch (err) {
        console.error('Error deleting salary record:', err);
        setError('Failed to delete salary record. Please try again.');
      }
    }
  };

  // Get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  // Filter salary records
  const filteredRecords = salaryRecords.filter(record => {
    const employeeName = getEmployeeName(record.employeeId);
    const matchesSearch = 
      employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEmployee = employeeFilter ? record.employeeId === employeeFilter : true;
    
    const matchesDate = dateFilter ? record.paymentDate.includes(dateFilter) : true;
    
    return matchesSearch && matchesEmployee && matchesDate;
  });

  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="mb-4"><Translate textKey="salaryManagement" defaultValue="Salary Management" /></h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Row className="mb-4">
          <Col md={6} lg={3}>
            <Card className="mb-3 h-100">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <Card.Title><Translate textKey="monthlyExpense" defaultValue="This Month" /></Card.Title>
                <h3 className="text-success">RS{statistics.totalCurrentMonth.toFixed(2)}</h3>
                <Card.Text className="text-muted">
                  <Translate textKey="paymentCount" defaultValue="Payments" />: {statistics.currentMonthCount}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="mb-3 h-100">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <Card.Title><Translate textKey="totalExpense" defaultValue="Total Expense" /></Card.Title>
                <h3 className="text-primary">RS{statistics.totalAllTime.toFixed(2)}</h3>
                <Card.Text className="text-muted">
                  <Translate textKey="totalPayments" defaultValue="Total Payments" />: {statistics.recordCount}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6} className="d-flex align-items-center justify-content-end">
            <Button 
              variant="success" 
              onClick={() => navigate('/add-salary-payment')}
              className="me-2"
            >
              <Translate textKey="addSalaryPayment" defaultValue="Add Salary Payment" />
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={() => navigate('/salary-reports')}
            >
              <Translate textKey="salaryReports" defaultValue="Salary Reports" />
            </Button>
          </Col>
        </Row>
        
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label><Translate textKey="search" defaultValue="Search" /></Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder={getTranslatedAttr("searchPlaceholder", "Search by employee name or description")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setSearchTerm('')}
                      >
                        <Translate textKey="clear" defaultValue="Clear" />
                      </Button>
                    )}
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label><Translate textKey="filterByEmployee" defaultValue="Filter by Employee" /></Form.Label>
                  <Form.Select
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                  >
                    <option value=""><Translate textKey="allEmployees" defaultValue="All Employees" /></option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label><Translate textKey="filterByDate" defaultValue="Filter by Date" /></Form.Label>
                  <Form.Control
                    type="month"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        {loading ? (
          <p className="text-center"><Translate textKey="loadingData" defaultValue="Loading data..." /></p>
        ) : (
          <Card>
            <Card.Body>
              {filteredRecords.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th><Translate textKey="employee" defaultValue="Employee" /></th>
                        <th><Translate textKey="amount" defaultValue="Amount" /></th>
                        <th><Translate textKey="paymentDate" defaultValue="Payment Date" /></th>
                        <th><Translate textKey="description" defaultValue="Description" /></th>
                        <th><Translate textKey="paymentMethod" defaultValue="Payment Method" /></th>
                        <th><Translate textKey="status" defaultValue="Status" /></th>
                        <th><Translate textKey="actions" defaultValue="Actions" /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map(record => (
                        <tr key={record.id}>
                          <td>{getEmployeeName(record.employeeId)}</td>
                          <td>RS{parseFloat(record.amount).toFixed(2)}</td>
                          <td>{new Date(record.paymentDate).toLocaleDateString()}</td>
                          <td>{record.description || '-'}</td>
                          <td>{record.paymentMethod}</td>
                          <td>
                            <Badge bg={record.status === 'paid' ? 'success' : 'warning'}>
                              {record.status === 'paid' ? 
                                <Translate textKey="paid" defaultValue="Paid" /> : 
                                <Translate textKey="pending" defaultValue="Pending" />
                              }
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => navigate(`/edit-salary-payment/${record.id}`)}
                            >
                              <Translate textKey="edit" defaultValue="Edit" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                            >
                              <Translate textKey="delete" defaultValue="Delete" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-center">
                  {salaryRecords.length > 0 ? 
                    <Translate textKey="noRecordsFound" defaultValue="No records match your filters." /> : 
                    <Translate textKey="noSalaryRecords" defaultValue="No salary records found. Add a payment to get started." />
                  }
                </p>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>
    </>
  );
};

export default SalaryManagement; 