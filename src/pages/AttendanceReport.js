import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Table, Button, Form, Row, Col, Alert, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './AttendanceReport.css'; // Import the CSS for responsive styles

const AttendanceReport = () => {
  const { currentUser, shopData } = useAuth();
  const navigate = useNavigate();
  const reportRef = useRef(null);
  
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  // Tab state
  const [reportType, setReportType] = useState('monthly');
  
  // Monthly report filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  
  // Date range filters
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployeeRange, setSelectedEmployeeRange] = useState('all');
  
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
        setError('Failed to load employees. Please try again.');
      }
    };
    
    fetchEmployees();
  }, [currentUser]);
  
  // Generate attendance report when filters change
  useEffect(() => {
    const generateReport = async () => {
      if (!currentUser || employees.length === 0) return;
      
      try {
        setLoading(true);
        
        let startDateStr, endDateStr;
        
        if (reportType === 'monthly') {
          // Calculate the date range for the selected month
          const startDate = new Date(selectedYear, selectedMonth, 1);
          const endDate = new Date(selectedYear, parseInt(selectedMonth) + 1, 0);
          
          startDateStr = startDate.toISOString().split('T')[0];
          endDateStr = endDate.toISOString().split('T')[0];
        } else {
          // Use the date range selected by the user
          startDateStr = startDate;
          endDateStr = endDate;
        }
        
        // Modified approach to avoid requiring a composite index
        // First, query by shopId only, then filter the results in memory
        const attendanceRef = collection(db, 'attendance');
        const attendanceQuery = query(
          attendanceRef,
          where('shopId', '==', currentUser.uid)
        );
        
        const snapshot = await getDocs(attendanceQuery);
        const allAttendance = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter by date range and employee if needed
        const filteredAttendance = allAttendance.filter(record => {
          const recordDate = record.date;
          const isInDateRange = recordDate >= startDateStr && recordDate <= endDateStr;
          
          const selectedEmp = reportType === 'monthly' ? selectedEmployee : selectedEmployeeRange;
          
          if (selectedEmp === 'all') {
            return isInDateRange;
          } else {
            return isInDateRange && record.employeeId === selectedEmp;
          }
        });
        
        // Process attendance data
        const attendanceData = [];
        
        // Create a mapping of employeeId to name
        const employeeMap = {};
        employees.forEach(emp => {
          employeeMap[emp.id] = emp.name;
        });
        
        // Group attendance by employee
        const groupedAttendance = {};
        
        filteredAttendance.forEach(record => {
          if (!groupedAttendance[record.employeeId]) {
            groupedAttendance[record.employeeId] = [];
          }
          
          groupedAttendance[record.employeeId].push(record);
        });
        
        // Create attendance summary for each employee
        for (const employeeId in groupedAttendance) {
          const employeeRecords = groupedAttendance[employeeId];
          
          // Count different attendance statuses
          const present = employeeRecords.filter(record => record.status === 'present').length;
          const absent = employeeRecords.filter(record => record.status === 'absent').length;
          const halfDay = employeeRecords.filter(record => record.status === 'half-day').length;
          const leave = employeeRecords.filter(record => record.status === 'leave').length;
          
          // Calculate attendance percentage
          const totalDays = employeeRecords.length;
          const presentEquivalent = present + (halfDay * 0.5);
          const attendancePercentage = totalDays > 0 
            ? ((presentEquivalent / totalDays) * 100).toFixed(2) 
            : '0.00';
          
          attendanceData.push({
            employeeId,
            name: employeeMap[employeeId] || 'Unknown Employee',
            totalDays,
            present,
            absent,
            halfDay,
            leave,
            attendancePercentage
          });
        }
        
        setAttendance(attendanceData);
        setLoading(false);
      } catch (err) {
        setError('Failed to generate attendance report. Please try again.');
        setLoading(false);
      }
    };
    
    generateReport();
  }, [currentUser, employees, selectedMonth, selectedYear, selectedEmployee, reportType, startDate, endDate, selectedEmployeeRange]);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    
    for (let year = currentYear; year >= currentYear - 3; year--) {
      options.push(
        <option key={year} value={year}>{year}</option>
      );
    }
    
    return options;
  };
  
  const handleGeneratePDF = async () => {
    if (!reportRef.current) return;
    
    try {
      setGeneratingPdf(true);
      
      const reportElement = reportRef.current;
      const canvas = await html2canvas(reportElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 20;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      let pdfName;
      if (reportType === 'monthly') {
        pdfName = `Attendance_Report_${months[selectedMonth]}_${selectedYear}.pdf`;
      } else {
        pdfName = `Attendance_Report_${startDate}_to_${endDate}.pdf`;
      }
      
      pdf.save(pdfName);
      
      setGeneratingPdf(false);
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
      setGeneratingPdf(false);
    }
  };
  
  const handleTabChange = (key) => {
    setReportType(key);
  };
  
  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="mb-4">Attendance Report</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Card className="mb-4">
          <Card.Body>
            <Tabs
              activeKey={reportType}
              onSelect={handleTabChange}
              className="mb-3"
            >
              <Tab eventKey="monthly" title="Monthly Report">
                <Row className="report-filters">
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Month</Form.Label>
                      <Form.Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                      >
                        {months.map((month, index) => (
                          <option key={index} value={index}>{month}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Year</Form.Label>
                      <Form.Select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                      >
                        {generateYearOptions()}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Employee</Form.Label>
                      <Form.Select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                      >
                        <option value="all">All Employees</option>
                        {employees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>
              
              <Tab eventKey="dateRange" title="Date Range Report">
                <Row className="report-filters">
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Employee</Form.Label>
                      <Form.Select
                        value={selectedEmployeeRange}
                        onChange={(e) => setSelectedEmployeeRange(e.target.value)}
                      >
                        <option value="all">All Employees</option>
                        {employees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
        
        <div ref={reportRef}>
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <h3>{shopData?.shopName || 'Shop'}</h3>
                <h5>Attendance Report</h5>
                {reportType === 'monthly' ? (
                  <p>{months[selectedMonth]} {selectedYear}</p>
                ) : (
                  <p>From {startDate} to {endDate}</p>
                )}
              </div>
              
              {loading ? (
                <p className="text-center">Generating report...</p>
              ) : attendance.length > 0 ? (
                <div className="report-table-container">
                  <Table striped bordered hover className="report-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Working Days</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Half Day</th>
                        <th>Leave</th>
                        <th>Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map(record => (
                        <tr key={record.employeeId}>
                          <td data-label="Employee">{record.name}</td>
                          <td data-label="Working Days">{record.totalDays}</td>
                          <td data-label="Present">{record.present}</td>
                          <td data-label="Absent">{record.absent}</td>
                          <td data-label="Half Day">{record.halfDay}</td>
                          <td data-label="Leave">{record.leave}</td>
                          <td data-label="Attendance %">{record.attendancePercentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-center">No attendance records found for the selected period.</p>
              )}
            </Card.Body>
          </Card>
        </div>
        
        <div className="d-flex justify-content-between mt-4 report-actions">
          <Button variant="secondary" onClick={() => navigate('/attendance')}>
            Back to Attendance
          </Button>
          
          <Button
            variant="primary"
            onClick={handleGeneratePDF}
            disabled={generatingPdf || attendance.length === 0}
          >
            {generatingPdf ? 'Generating PDF...' : 'Download as PDF'}
          </Button>
        </div>
      </Container>
    </>
  );
};

export default AttendanceReport; 