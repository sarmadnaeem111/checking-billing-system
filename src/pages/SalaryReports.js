import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button, Row, Col, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { getShopSalaryRecords } from '../utils/salaryUtils';
import { Translate, useTranslatedAttribute } from '../utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SalaryReports = () => {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const navigate = useNavigate();
  const reportRef = useRef();
  
  // Get translations for attributes
  const getTranslatedAttr = useTranslatedAttribute();
  
  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    reportType: 'individual', // individual or summary
  });
  
  // Report data state
  const [reportData, setReportData] = useState({
    employee: null,
    records: [],
    totalAmount: 0,
    startDate: '',
    endDate: '',
    reportType: ''
  });
  
  // Fetch employees for the shop
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const employeesRef = collection(db, 'employees');
        const employeesQuery = query(employeesRef, where('shopId', '==', currentUser.uid));
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Reset report when form changes
    if (reportGenerated) {
      setReportGenerated(false);
    }
  };
  
  const handleGenerateReport = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.reportType === 'individual' && !formData.employeeId) {
      setError('Please select an employee for individual report');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      setError('Start date and end date are required');
      return;
    }
    
    try {
      setReportLoading(true);
      setError('');
      
      // Fetch salary records based on report type
      let records = [];
      try {
        if (formData.reportType === 'individual') {
          records = await getShopSalaryRecords(
            currentUser.uid, 
            formData.employeeId
          );
        } else {
          records = await getShopSalaryRecords(currentUser.uid);
        }
      } catch (err) {
        console.error('Error fetching salary records:', err);
        setError('Failed to fetch salary records. Please try creating Firestore indexes by clicking the link in the console.');
        setReportLoading(false);
        return;
      }
      
      // Filter records by date range
      const filteredRecords = records.filter(record => {
        return record.paymentDate >= formData.startDate && 
               record.paymentDate <= formData.endDate;
      });
      
      // Calculate total amount
      const totalAmount = filteredRecords.reduce(
        (total, record) => total + (parseFloat(record.amount) || 0), 
        0
      );
      
      // Get selected employee data for individual reports
      let selectedEmployee = null;
      if (formData.reportType === 'individual') {
        selectedEmployee = employees.find(emp => emp.id === formData.employeeId);
      }
      
      // Set report data
      setReportData({
        employee: selectedEmployee,
        records: filteredRecords,
        totalAmount,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reportType: formData.reportType
      });
      
      setReportGenerated(true);
      setReportLoading(false);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
      setReportLoading(false);
    }
  };
  
  // Get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };
  
  // Format date as readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Download report as PDF
  const downloadPdf = () => {
    const input = reportRef.current;
    
    html2canvas(input, {
      scale: 2, // Higher quality
      logging: false
    }).then(canvas => {
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
      
      const reportTitle = formData.reportType === 'individual' 
        ? `Salary_Report_${getEmployeeName(formData.employeeId).replace(/\s+/g, '_')}`
        : 'Salary_Summary_Report';
        
      pdf.save(`${reportTitle}_${formData.startDate}_to_${formData.endDate}.pdf`);
    });
  };
  
  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="mb-4">
          <Translate textKey="salaryReports" defaultValue="Salary Reports" />
        </h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleGenerateReport}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <Translate textKey="reportType" defaultValue="Report Type" />
                    </Form.Label>
                    <Form.Select
                      name="reportType"
                      value={formData.reportType}
                      onChange={handleChange}
                    >
                      <option value="individual">
                        <Translate textKey="individualEmployeeReport" defaultValue="Individual Employee Report" />
                      </option>
                      <option value="summary">
                        <Translate textKey="summaryReport" defaultValue="Summary Report (All Employees)" />
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                {formData.reportType === 'individual' && (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <Translate textKey="selectEmployee" defaultValue="Select Employee" />
                      </Form.Label>
                      <Form.Select
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        required={formData.reportType === 'individual'}
                      >
                        <option value="">
                          <Translate textKey="selectEmployee" defaultValue="Select Employee" />
                        </option>
                        {employees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name} {employee.position ? `- ${employee.position}` : ''}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <Translate textKey="startDate" defaultValue="Start Date" />
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <Translate textKey="endDate" defaultValue="End Date" />
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-between">
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/salary-management')}
                >
                  <Translate textKey="back" defaultValue="Back" />
                </Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading || reportLoading}
                >
                  {reportLoading ? 
                    <Translate textKey="generating" defaultValue="Generating..." /> : 
                    <Translate textKey="generateReport" defaultValue="Generate Report" />
                  }
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
        
        {reportGenerated && (
          <>
            <div className="d-flex justify-content-end mb-3">
              <Button 
                variant="success" 
                onClick={downloadPdf}
              >
                <Translate textKey="downloadAsPDF" defaultValue="Download as PDF" />
              </Button>
            </div>
            
            <Card>
              <Card.Body ref={reportRef} className="p-4">
                <div className="report-container">
                  <div className="text-center mb-4">
                    <h3>
                      {reportData.reportType === 'individual' ? 
                        <Translate 
                          textKey="employeeSalaryReport"
                          defaultValue="Employee Salary Report" 
                        /> : 
                        <Translate 
                          textKey="summarySalaryReport"
                          defaultValue="Summary Salary Report"
                        />
                      }
                    </h3>
                    <p className="mb-1">
                      <strong><Translate textKey="periodFrom" defaultValue="Period" />:</strong> {formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}
                    </p>
                    {reportData.reportType === 'individual' && reportData.employee && (
                      <>
                        <p className="mb-1">
                          <strong><Translate textKey="employee" defaultValue="Employee" />:</strong> {reportData.employee.name}
                        </p>
                        <p className="mb-1">
                          <strong><Translate textKey="position" defaultValue="Position" />:</strong> {reportData.employee.position || '-'}
                        </p>
                        {reportData.employee.salary && (
                          <p className="mb-1">
                            <strong><Translate textKey="monthlySalary" defaultValue="Monthly Salary" />:</strong> RS{reportData.employee.salary}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  
                  {reportData.records.length > 0 ? (
                    <>
                      <div className="table-responsive">
                        <Table bordered>
                          <thead>
                            <tr>
                              {reportData.reportType === 'summary' && (
                                <th><Translate textKey="employee" defaultValue="Employee" /></th>
                              )}
                              <th><Translate textKey="paymentDate" defaultValue="Payment Date" /></th>
                              <th><Translate textKey="amount" defaultValue="Amount" /></th>
                              <th><Translate textKey="paymentMethod" defaultValue="Payment Method" /></th>
                              <th><Translate textKey="status" defaultValue="Status" /></th>
                              <th><Translate textKey="description" defaultValue="Description" /></th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.records.map(record => (
                              <tr key={record.id}>
                                {reportData.reportType === 'summary' && (
                                  <td>{getEmployeeName(record.employeeId)}</td>
                                )}
                                <td>{formatDate(record.paymentDate)}</td>
                                <td>RS{parseFloat(record.amount).toFixed(2)}</td>
                                <td>{record.paymentMethod}</td>
                                <td>{record.status === 'paid' ? 
                                  <Translate textKey="paid" defaultValue="Paid" /> : 
                                  <Translate textKey="pending" defaultValue="Pending" />
                                }</td>
                                <td>{record.description || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <th colSpan={reportData.reportType === 'summary' ? 2 : 1} className="text-end">
                                <Translate textKey="total" defaultValue="Total" />:
                              </th>
                              <th>RS{reportData.totalAmount.toFixed(2)}</th>
                              <th colSpan={3}></th>
                            </tr>
                          </tfoot>
                        </Table>
                      </div>
                      
                      <div className="mt-4">
                        <p><Translate textKey="reportGeneratedDate" defaultValue="Report Generated On" />: {new Date().toLocaleDateString()}</p>
                      </div>
                    </>
                  ) : (
                    <Alert variant="info">
                      <Translate textKey="noSalaryRecordsPeriod" defaultValue="No salary records found for the selected period." />
                    </Alert>
                  )}
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </>
  );
};

export default SalaryReports; 