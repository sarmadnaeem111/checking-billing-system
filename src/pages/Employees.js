import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import './Employees.css'; // Import the custom CSS
import { Translate, useTranslatedAttribute } from '../utils';

const Employees = () => {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Get translations for attributes
  const getTranslatedAttr = useTranslatedAttribute();

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const employeesRef = collection(db, 'employees');
        const employeesQuery = query(
          employeesRef,
          where('shopId', '==', currentUser.uid)
        );

        const snapshot = await getDocs(employeesQuery);
        const employeesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setEmployees(employeesList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees. Please try again.');
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [currentUser]);

  const handleDelete = async (employeeId) => {
    if (window.confirm(getTranslatedAttr('confirmDeleteEmployee'))) {
      try {
        await deleteDoc(doc(db, 'employees', employeeId));
        setEmployees(employees.filter(emp => emp.id !== employeeId));
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError(getTranslatedAttr('failedToDeleteEmployee'));
      }
    }
  };

  return (
    <>
      <MainNavbar />
      <Container>
        <Row className="mb-4">
          <Col>
            <h2><Translate textKey="employees" /></h2>
          </Col>
          <Col className="text-end">
            <Button 
              variant="success" 
              onClick={() => navigate('/add-employee')}
            >
              <Translate textKey="addNewEmployee" />
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}

        <Card>
          <Card.Body>
            {loading ? (
              <p className="text-center"><Translate textKey="loadingEmployees" /></p>
            ) : employees.length > 0 ? (
              <div className="table-responsive employee-table-container">
                <Table striped hover responsive="sm" className="employees-table">
                  <thead>
                    <tr>
                      <th><Translate textKey="name" /></th>
                      <th><Translate textKey="position" /></th>
                      <th><Translate textKey="contact" /></th>
                      <th><Translate textKey="email" /></th>
                      <th><Translate textKey="joiningDate" /></th>
                      <th><Translate textKey="actions" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(employee => (
                      <tr key={employee.id}>
                        <td data-label={getTranslatedAttr("name")} className="text-nowrap">{employee.name}</td>
                        <td data-label={getTranslatedAttr("position")}>{employee.position}</td>
                        <td data-label={getTranslatedAttr("contact")}>{employee.contact}</td>
                        <td data-label={getTranslatedAttr("email")} className="email-cell">{employee.email}</td>
                        <td data-label={getTranslatedAttr("joiningDate")}>{new Date(employee.joiningDate).toLocaleDateString()}</td>
                        <td data-label={getTranslatedAttr("actions")}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => navigate(`/edit-employee/${employee.id}`)}
                          >
                            <Translate textKey="edit" />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(employee.id)}
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
              <p className="text-center"><Translate textKey="noEmployeesFound" /></p>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default Employees; 