import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import "./Attendance.css";  // Import the CSS file for responsive styles
import { Translate, useTranslatedAttribute } from '../utils';

const Attendance = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Get translations for attributes
  const getTranslatedAttr = useTranslatedAttribute();
  
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!currentUser) return;
      
      try {
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
      } catch (err) {
        setError(getTranslatedAttr('failedToLoadEmployees'));
      }
    };
    
    fetchEmployees();
  }, [currentUser, getTranslatedAttr]);
  
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const attendanceRef = collection(db, 'attendance');
        
        // Modified approach: Query by shopId only, then filter in memory
        const attendanceQuery = query(
          attendanceRef,
          where('shopId', '==', currentUser.uid)
        );
        
        const snapshot = await getDocs(attendanceQuery);
        const allAttendanceRecords = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter records by date and employee ID (if selected)
        const filteredAttendance = allAttendanceRecords.filter(record => {
          if (selectedEmployee === 'all') {
            return record.date === selectedDate;
          } else {
            return record.date === selectedDate && record.employeeId === selectedEmployee;
          }
        });
        
        // Get employee names for each attendance record
        const attendanceWithNames = filteredAttendance.map(record => {
          const employee = employees.find(emp => emp.id === record.employeeId);
          return {
            ...record,
            employeeName: employee ? employee.name : getTranslatedAttr('unknownEmployee')
          };
        });
        
        setAttendance(attendanceWithNames);
        setLoading(false);
      } catch (err) {
        setError(getTranslatedAttr('failedToLoadAttendance'));
        setLoading(false);
      }
    };
    
    if (employees.length > 0) {
      fetchAttendance();
    }
  }, [currentUser, selectedDate, selectedEmployee, employees, getTranslatedAttr]);
  
  // Translate status
  const getTranslatedStatus = (status) => {
    switch(status) {
      case 'present':
        return <Translate textKey="present" />;
      case 'absent':
        return <Translate textKey="absent" />;
      case 'half-day':
        return <Translate textKey="halfDay" />;
      case 'leave':
        return <Translate textKey="onLeave" />;
      default:
        return status;
    }
  };
  
  return (
    <>
      <MainNavbar />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2><Translate textKey="attendanceRecords" /></h2>
          <Button 
            variant="success" 
            onClick={() => navigate('/mark-attendance')}
            className="me-2"
          >
            <Translate textKey="markAttendance" />
          </Button>
        </div>
        
        <div className="mb-4">
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label><Translate textKey="date" /></Form.Label>
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label><Translate textKey="employee" /></Form.Label>
                <Form.Select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="all"><Translate textKey="allEmployees" /></option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </div>
        
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2"><Translate textKey="loadingAttendance" /></p>
          </div>
        ) : (
          <>
            {attendance.length > 0 ? (
              <div className="table-responsive attendance-table-container">
                <Table striped hover responsive="sm" className="attendance-table">
                  <thead>
                    <tr>
                      <th><Translate textKey="employee" /></th>
                      <th><Translate textKey="status" /></th>
                      <th><Translate textKey="checkIn" /></th>
                      <th><Translate textKey="checkOut" /></th>
                      <th><Translate textKey="notes" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map(record => (
                      <tr key={record.id}>
                        <td data-label={getTranslatedAttr("employee")}>{record.employeeName}</td>
                        <td data-label={getTranslatedAttr("status")}>{getTranslatedStatus(record.status)}</td>
                        <td data-label={getTranslatedAttr("checkIn")}>{record.checkIn || '-'}</td>
                        <td data-label={getTranslatedAttr("checkOut")}>{record.checkOut || '-'}</td>
                        <td data-label={getTranslatedAttr("notes")}>{record.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-4">
                <p><Translate textKey="noAttendanceRecords" /></p>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/mark-attendance')}
                >
                  <Translate textKey="markAttendance" />
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default Attendance; 