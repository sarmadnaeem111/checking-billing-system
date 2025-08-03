import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Stack, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { Translate, TranslateData } from '../utils';
import useTranslatedData from '../hooks/useTranslatedData';
import { formatCurrency } from '../utils/receiptUtils';
import { getDailySalesAndProfit } from '../utils/salesUtils';

const Dashboard = () => {
  const { currentUser, shopData } = useAuth();
  const [receiptCount, setReceiptCount] = useState(0);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState({ present: 0, absent: 0, total: 0 });
  const [todaySales, setTodaySales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(true);
  const navigate = useNavigate();

  // Translate shop data
  const translatedShopData = useTranslatedData(shopData);
  // Translate recent receipts
  const translatedReceipts = useTranslatedData(recentReceipts);
  // Translate attendance data
  const translatedAttendance = useTranslatedData(todayAttendance);

  // Fetch daily sales and profit data
  useEffect(() => {
    if (!currentUser) return;

    setSalesLoading(true);
    
    // Adding error handling and more informative console messages
    getDailySalesAndProfit(currentUser.uid)
      .then(data => {
        setTodaySales(data);
      })
      .catch(error => {
        // Log error but don't show to user to avoid cluttering the UI
        console.error("Error fetching daily sales data:", error.message || error);
      })
      .finally(() => {
        setSalesLoading(false);
      });
  }, [currentUser]);

  useEffect(() => {
    // Convert to non-async function
    const fetchDashboardData = () => {
      if (!currentUser) return;

      try {
        // Create a simple query without ordering
        const receiptRef = collection(db, 'receipts');
        const receiptQuery = query(
          receiptRef,
          where("shopId", "==", currentUser.uid)
        );
        
        getDocs(receiptQuery)
          .then(receiptSnapshot => {
            // Set the count
            setReceiptCount(receiptSnapshot.size);
            
            // Get all receipts and sort them client-side
            const receipts = receiptSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            // Sort receipts by timestamp
            receipts.sort((a, b) => {
              return new Date(b.timestamp) - new Date(a.timestamp);
            });
            
            // Get just the first 5
            setRecentReceipts(receipts.slice(0, 5));
          })
          .catch(error => {
            console.error("Error fetching dashboard data:", error);
          });

        // Fetch employee count
        const employeesRef = collection(db, 'employees');
        const employeesQuery = query(
          employeesRef,
          where("shopId", "==", currentUser.uid)
        );
        
        getDocs(employeesQuery)
          .then(employeeSnapshot => {
            setEmployeeCount(employeeSnapshot.size);
            
            // Fetch today's attendance
            const today = new Date().toISOString().split('T')[0];
            const attendanceRef = collection(db, 'attendance');
            const attendanceQuery = query(
              attendanceRef,
              where("shopId", "==", currentUser.uid),
              where("date", "==", today)
            );
            
            return getDocs(attendanceQuery);
          })
          .then(attendanceSnapshot => {
            const attendanceRecords = attendanceSnapshot.docs.map(doc => ({
              ...doc.data()
            }));
            
            const presentCount = attendanceRecords.filter(record => 
              record.status === 'present' || record.status === 'half-day'
            ).length;
            
            const absentCount = attendanceRecords.filter(record => 
              record.status === 'absent' || record.status === 'leave'
            ).length;
            
            setTodayAttendance({
              present: presentCount,
              absent: absentCount,
              total: attendanceRecords.length
            });
          })
          .catch(error => {
            console.error("Error fetching employee data:", error);
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (error) {
        console.error("Error setting up queries:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  return (
    <>
      <MainNavbar />
      <Container className="pb-4">
        <h2 className="my-3"><Translate textKey="dashboard" /></h2>
        
        {shopData && (
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title as="h3">{translatedShopData.shopName}</Card.Title>
              <Card.Text>
                <strong><Translate textKey="address" />:</strong> {translatedShopData.address}<br />
                <strong><Translate textKey="phone" />:</strong> {translatedShopData.phoneNumber}
              </Card.Text>
            </Card.Body>
          </Card>
        )}
        
        {/* Today's sales and profit summary */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Card.Title><Translate textKey="todaysSummary" fallback="Today's Summary" /></Card.Title>
            <Row className="mt-3">
              {salesLoading ? (
                <Col xs={12} className="text-center py-3">
                  <Spinner animation="border" size="sm" /> <Translate textKey="loadingSalesData" fallback="Loading sales data..." />
                </Col>
              ) : todaySales ? (
                <>
                  <Col xs={6} md={3} className="text-center mb-3">
                    <h5><Translate textKey="sales" fallback="Sales" /></h5>
                    <h3>{formatCurrency(todaySales.sales)}</h3>
                  </Col>
                  <Col xs={6} md={3} className="text-center mb-3">
                    <h5><Translate textKey="profit" fallback="Profit" /></h5>
                    <h3>{formatCurrency(todaySales.profit)}</h3>
                  </Col>
                  <Col xs={6} md={3} className="text-center mb-3">
                    <h5><Translate textKey="transactions" fallback="Transactions" /></h5>
                    <h3>{todaySales.transactionCount}</h3>
                  </Col>
                  <Col xs={6} md={3} className="text-center mb-3">
                    <h5><Translate textKey="profitMargin" fallback="Profit Margin" /></h5>
                    <h3>
                      {todaySales.sales > 0 
                        ? `${((todaySales.profit / todaySales.sales) * 100).toFixed(2)}%` 
                        : '0%'}
                    </h3>
                    <small className="text-muted">
                      {formatCurrency(todaySales.profit)} / {formatCurrency(todaySales.sales)}
                    </small>
                  </Col>
                </>
              ) : (
                <Col xs={12} className="text-center py-3">
                  <Translate textKey="noSalesDataToday" fallback="No sales data available for today." />
                </Col>
              )}
            </Row>
            <div className="text-center mt-2">
              <Button 
                variant="primary" 
                onClick={() => navigate('/sales-analytics')}
                size="sm"
              >
                <Translate textKey="viewDetailedAnalytics" fallback="View Detailed Analytics" />
              </Button>
            </div>
          </Card.Body>
        </Card>
        
        <Row className="g-3">
          <Col xs={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title><Translate textKey="receipts" /></Card.Title>
                <Card.Text className="mb-4">
                  <TranslateData 
                    data={{
                      message: "You have generated {count} receipt(s) so far.",
                      count: receiptCount
                    }}
                  >
                    {(data) => (
                      <>
                        {data.message.replace('{count}', data.count)}
                      </>
                    )}
                  </TranslateData>
                </Card.Text>
                <div className="mt-auto">
                  <Stack direction="horizontal" gap={2} className="d-flex flex-wrap">
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/receipts')}
                      className="flex-grow-1"
                    >
                      <Translate textKey="view" />
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={() => navigate('/new-receipt')}
                      className="flex-grow-1"
                    >
                      <Translate textKey="add" />
                    </Button>
                  </Stack>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title><Translate textKey="employees" /></Card.Title>
                <Card.Text className="mb-4">
                  <TranslateData 
                    data={{
                      message: "You have {count} employee(s) registered.",
                      count: employeeCount
                    }}
                  >
                    {(data) => (
                      <>
                        {data.message.replace('{count}', data.count)}
                      </>
                    )}
                  </TranslateData>
                  
                  {todayAttendance.total > 0 && (
                    <div className="mt-2">
                      <div><Translate textKey="todaysAttendance" fallback="Today's Attendance:" /></div>
                      <div className="d-flex justify-content-between pe-5 mt-1">
                        <span><Translate textKey="present" fallback="Present" />:</span> 
                        <span>{translatedAttendance.present}</span>
                      </div>
                      <div className="d-flex justify-content-between pe-5">
                        <span><Translate textKey="absent" fallback="Absent" />:</span> 
                        <span>{translatedAttendance.absent}</span>
                      </div>
                    </div>
                  )}
                </Card.Text>
                <div className="mt-auto">
                  <Stack direction="horizontal" gap={2} className="d-flex flex-wrap">
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/employees')}
                      className="flex-grow-1"
                    >
                      <Translate textKey="viewEmployees" />
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={() => navigate('/mark-attendance')}
                      className="flex-grow-1"
                    >
                      <Translate textKey="markAttendance" />
                    </Button>
                  </Stack>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          {/* New Salary Management Card */}
          <Col xs={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title><Translate textKey="salaryManagement" fallback="Salary Management" /></Card.Title>
                <Card.Text className="mb-4">
                  <Translate 
                    textKey="salaryManagementDescription" 
                    fallback="Manage employee salary payments, track expenses, and generate detailed salary reports."
                  />
                </Card.Text>
                <div className="mt-auto">
                  <Stack direction="horizontal" gap={2} className="d-flex flex-wrap">
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/salary-management')}
                      className="flex-grow-1"
                    >
                      <Translate textKey="manageSalaries" fallback="Manage Salaries" />
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={() => navigate('/add-salary-payment')}
                      className="flex-grow-1"
                    >
                      <Translate textKey="addPayment" fallback="Add Payment" />
                    </Button>
                  </Stack>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Expense Management Card */}
          <Col xs={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title><Translate textKey="expenseManagement" fallback="Expense Management" /></Card.Title>
                <Card.Text className="mb-4">
                  <Translate 
                    textKey="expenseManagementDescription" 
                    fallback="Track and manage business expenses, categorize spending, and monitor expense trends."
                  />
                </Card.Text>
                <div className="mt-auto">
                  <Stack direction="horizontal" gap={2} className="d-flex flex-wrap">
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/expenses')}
                      className="flex-grow-1"
                    >
                      <Translate textKey="viewExpenses" fallback="View Expenses" />
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={() => navigate('/add-expense')}
                      className="flex-grow-1"
                    >
                      <Translate textKey="addExpense" fallback="Add Expense" />
                    </Button>
                  </Stack>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title><Translate textKey="salesAndProfit" fallback="Sales & Profit" /></Card.Title>
                <Card.Text className="mb-4">
                  <Translate 
                    textKey="salesAnalyticsDescription" 
                    fallback="View detailed sales and profit analytics on daily, monthly and yearly basis."
                  />
                </Card.Text>
                <div className="mt-auto">
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/sales-analytics')}
                    className="w-100"
                  >
                    <Translate textKey="viewAnalytics" fallback="View Analytics" />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title><Translate textKey="recentReceipts" fallback="Recent Receipts" /></Card.Title>
                {recentReceipts.length > 0 ? (
                  <div className="table-responsive small-table">
                    <table className="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th><Translate textKey="date" /></th>
                          <th><Translate textKey="receiptId" fallback="Receipt ID" /></th>
                          <th><Translate textKey="total" /></th>
                          <th><Translate textKey="action" /></th>
                        </tr>
                      </thead>
                      <tbody>
                        {translatedReceipts.map(receipt => (
                          <tr key={receipt.id}>
                            <td>{new Date(receipt.timestamp).toLocaleDateString()}</td>
                            <td className="text-truncate" style={{maxWidth: "80px"}}>{receipt.id.substring(0, 8)}</td>
                            <td>RS{receipt.totalAmount}</td>
                            <td>
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={() => navigate(`/receipt/${receipt.id}`)}
                              >
                                <Translate textKey="view" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center mt-4">
                    {loading ? <Translate textKey="loading" fallback="Loading..." /> : 
                      <Translate textKey="noReceiptsYet" fallback="No receipts yet. Start creating receipts!" />}
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx="true">{`
        @media (max-width: 576px) {
          .table-responsive.small-table {
            font-size: 0.875rem;
          }
          .table-responsive.small-table td, 
          .table-responsive.small-table th {
            padding: 0.3rem;
          }
        }
      `}</style>
    </>
  );
};

export default Dashboard;