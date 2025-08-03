import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import './MarkAttendance.css'; // Import the CSS for responsive styles
import { Translate, useTranslatedAttribute } from '../utils';

const MarkAttendance = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Get translations for attributes
  const getTranslatedAttr = useTranslatedAttribute();
  
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Current date for marking attendance
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Set viewport meta tag for better mobile experience
  useEffect(() => {
    // Check if viewport meta tag exists
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    // If it doesn't exist, create it
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    
    // Set the viewport content for better mobile responsive design
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    
    // Cleanup function
    return () => {
      // Reset to default viewport if needed
      if (viewportMeta) {
        viewportMeta.content = 'width=device-width, initial-scale=1.0';
      }
    };
  }, []);
  
  // Fetch employees
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
  
  // Check for existing attendance records for this date
  useEffect(() => {
    const checkExistingAttendance = async () => {
      if (!currentUser || employees.length === 0) return;
      
      try {
        setLoading(true);
        const attendanceRef = collection(db, 'attendance');
        
        // Query all attendance records for this shop
        const attendanceQuery = query(
          attendanceRef,
          where('shopId', '==', currentUser.uid)
        );
        
        const snapshot = await getDocs(attendanceQuery);
        
        // Filter records for the selected date
        const existingAttendance = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(record => record.date === selectedDate);
        
        // Initialize attendance data for all employees
        const attendanceForAllEmployees = employees.map(employee => {
          // Check if attendance record exists for this employee
          const existingRecord = existingAttendance.find(
            record => record.employeeId === employee.id
          );
          
          return {
            employeeId: employee.id,
            employeeName: employee.name,
            status: existingRecord ? existingRecord.status : 'present',
            checkIn: existingRecord ? existingRecord.checkIn : '',
            checkOut: existingRecord ? existingRecord.checkOut : '',
            notes: existingRecord ? existingRecord.notes : '',
            recordId: existingRecord ? existingRecord.id : null
          };
        });
        
        setAttendanceData(attendanceForAllEmployees);
        setLoading(false);
      } catch (err) {
        console.error('Error checking existing attendance:', err);
        setError(getTranslatedAttr('failedToLoadAttendance'));
        setLoading(false);
      }
    };
    
    checkExistingAttendance();
  }, [currentUser, employees, selectedDate, getTranslatedAttr]);
  
  // Handle status change
  const handleStatusChange = (index, value) => {
    const updatedData = [...attendanceData];
    updatedData[index].status = value;
    setAttendanceData(updatedData);
  };
  
  // Handle time input change
  const handleTimeChange = (index, field, value) => {
    const updatedData = [...attendanceData];
    updatedData[index][field] = value;
    setAttendanceData(updatedData);
  };
  
  // Handle notes change
  const handleNotesChange = (index, value) => {
    const updatedData = [...attendanceData];
    updatedData[index].notes = value;
    setAttendanceData(updatedData);
  };
  
  // Submit attendance
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      const batch = [];
      
      for (const record of attendanceData) {
        const attendanceRecord = {
          employeeId: record.employeeId,
          shopId: currentUser.uid,
          date: selectedDate,
          status: record.status,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          notes: record.notes,
          updatedAt: new Date().toISOString()
        };
        
        if (record.recordId) {
          // Update existing record
          batch.push(updateDoc(doc(db, 'attendance', record.recordId), attendanceRecord));
        } else {
          // Create new record
          batch.push(addDoc(collection(db, 'attendance'), {
            ...attendanceRecord,
            createdAt: new Date().toISOString()
          }));
        }
      }
      
      await Promise.all(batch);
      
      setSuccess(getTranslatedAttr('attendanceMarkedSuccess'));
      setSubmitting(false);
      
      // Redirect to attendance view after 1.5 seconds
      setTimeout(() => {
        navigate('/attendance');
      }, 1500);
    } catch (err) {
      setError(getTranslatedAttr('failedToSubmitAttendance'));
      setSubmitting(false);
    }
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  
  return (
    <>
      <MainNavbar />
      <Container className="attendance-container">
        <h2 className="mb-4"><Translate textKey="markAttendance" /></h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Card className="mb-4">
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label><Translate textKey="selectDate" /></Form.Label>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="date-input"
              />
            </Form.Group>
          </Card.Body>
        </Card>
        
        {loading ? (
          <div className="text-center p-3">
            <p><Translate textKey="loadingEmployees" /></p>
          </div>
        ) : attendanceData.length === 0 ? (
          <div className="text-center p-3">
            <p><Translate textKey="noEmployeesFound" /></p>
          </div>
        ) : (
          <>
            <div className="table-responsive attendance-mark-table-container">
              <Table responsive="sm" className="attendance-mark-table">
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
                  {attendanceData.map((record, index) => (
                    <tr key={record.employeeId}>
                      <td data-label={getTranslatedAttr("employee")}>{record.employeeName}</td>
                      <td data-label={getTranslatedAttr("status")}>
                        <Form.Select
                          value={record.status}
                          onChange={(e) => handleStatusChange(index, e.target.value)}
                          className="form-select-sm"
                        >
                          <option value="present"><Translate textKey="present" /></option>
                          <option value="absent"><Translate textKey="absent" /></option>
                          <option value="half-day"><Translate textKey="halfDay" /></option>
                          <option value="leave"><Translate textKey="onLeave" /></option>
                        </Form.Select>
                      </td>
                      <td data-label={getTranslatedAttr("checkIn")}>
                        <Form.Control
                          type="time"
                          size="sm"
                          value={record.checkIn}
                          onChange={(e) => handleTimeChange(index, 'checkIn', e.target.value)}
                          disabled={record.status === 'absent' || record.status === 'leave'}
                        />
                      </td>
                      <td data-label={getTranslatedAttr("checkOut")}>
                        <Form.Control
                          type="time"
                          size="sm"
                          value={record.checkOut}
                          onChange={(e) => handleTimeChange(index, 'checkOut', e.target.value)}
                          disabled={record.status === 'absent' || record.status === 'leave'}
                        />
                      </td>
                      <td data-label={getTranslatedAttr("notes")}>
                        <Form.Control
                          as="textarea"
                          rows={1}
                          size="sm"
                          value={record.notes}
                          onChange={(e) => handleNotesChange(index, e.target.value)}
                          placeholder={getTranslatedAttr("optionalNotes")}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            
            <div className="d-flex mt-4 attendance-actions">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/attendance')}
                className="me-2 btn-cancel"
              >
                <Translate textKey="cancel" />
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-save"
              >
                {submitting ? 
                  <Translate textKey="submitting" /> : 
                  <Translate textKey="submitAttendance" />
                }
              </Button>
            </div>
          </>
        )}
      </Container>
    </>
  );
};

export default MarkAttendance; 