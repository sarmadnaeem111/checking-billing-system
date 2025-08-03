import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Card, Button, Row, Col, Form, Table, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { formatCurrency } from '../utils/receiptUtils';
import { getDailySalesAndProfit, getMonthlySalesAndProfit, getYearlySalesAndProfit } from '../utils/salesUtils';
import './SalesAnalytics.css';
import { Translate } from '../utils';

// Memoized category row component to prevent unnecessary re-renders
const CategoryRow = React.memo(({ category, index }) => (
  <tr>
    <td>{category.category}</td>
    <td>{formatCurrency(category.sales)}</td>
    <td>{formatCurrency(category.profit)}</td>
    <td>{category.profitMargin}%</td>
    <td>{category.items}</td>
  </tr>
));

// Memoized category progress bar component
const CategoryProgressBar = React.memo(({ category, index, totalSales }) => {
  // Calculate percentage of total sales
  const percentage = totalSales > 0 
    ? (category.sales / totalSales * 100).toFixed(1) 
    : 0;
  
  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between mb-1">
        <span>{category.category}</span>
        <span>{formatCurrency(category.sales)} ({percentage}%)</span>
      </div>
      <div className="progress" style={{ height: '20px' }}>
        <div 
          className="progress-bar" 
          role="progressbar" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: `hsl(${210 - index * 30}, 70%, 50%)` // Different color for each category
          }} 
          aria-valuenow={percentage} 
          aria-valuemin="0" 
          aria-valuemax="100"
        >
          {percentage > 5 ? `${percentage}%` : ''}
        </div>
      </div>
    </div>
  );
});

// Memoized daily data row component
const DailyDataRow = React.memo(({ day }) => {
  const profitMargin = day.sales > 0 ? ((day.profit / day.sales) * 100).toFixed(2) : 0;
  
  return (
    <tr>
      <td>{day.day}</td>
      <td>{formatCurrency(day.sales)}</td>
      <td>{formatCurrency(day.profit)}</td>
      <td>{profitMargin}%</td>
    </tr>
  );
});

// Memoized monthly data row component
const MonthlyDataRow = React.memo(({ month }) => {
  const profitMargin = month.sales > 0 ? ((month.profit / month.sales) * 100).toFixed(2) : 0;
  
  return (
    <tr>
      <td>{month.month}</td>
      <td>{formatCurrency(month.sales)}</td>
      <td>{formatCurrency(month.profit)}</td>
      <td>{profitMargin}%</td>
    </tr>
  );
});

const SalesAnalytics = () => {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState('daily'); // 'daily', 'monthly', 'yearly'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Memoized function to fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Add validation for date and fallback to current date if invalid
      let date;
      try {
        date = new Date(selectedDate);
        // Check if date is valid
        if (isNaN(date.getTime())) {
          date = new Date(); // Fallback to current date
        }
      } catch (e) {
        date = new Date(); // Fallback to current date
      }
      
      let data;
      
      switch (viewMode) {
        case 'daily':
          data = await getDailySalesAndProfit(currentUser.uid, date);
          break;
        case 'monthly':
          data = await getMonthlySalesAndProfit(currentUser.uid, date);
          break;
        case 'yearly':
          data = await getYearlySalesAndProfit(currentUser.uid, date);
          break;
        default:
          data = await getDailySalesAndProfit(currentUser.uid, date);
      }
      
      setAnalytics(data);
    } catch (error) {
      // Only log minimal error details, not the full error object
      console.log('Analytics data fetch issue:', error.message || 'Error fetching data');
      
      // Set user-friendly error message without exposing internal details
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [currentUser, viewMode, selectedDate]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Handle date selector based on view mode - memoized to prevent unnecessary recalculations
  const renderDateSelector = useMemo(() => {
    switch (viewMode) {
      case 'daily':
        return (
          <Form.Control
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        );
      case 'monthly':
        return (
          <Form.Control
            type="month"
            value={selectedDate.substring(0, 7)}
            onChange={(e) => setSelectedDate(`${e.target.value}-01`)}
          />
        );
      case 'yearly':
        return (
          <Form.Control
            type="number"
            min="2000"
            max="2100"
            value={selectedDate.substring(0, 4)}
            onChange={(e) => setSelectedDate(`${e.target.value}-01-01`)}
          />
        );
      default:
        return null;
    }
  }, [viewMode, selectedDate]);

  // Memoized calculation of profit margin
  const profitMargin = useMemo(() => {
    if (!analytics || analytics.sales <= 0) return 0;
    return ((analytics.profit / analytics.sales) * 100).toFixed(2);
  }, [analytics]);

  // Render basic summary - memoized to prevent unnecessary recalculations
  const renderSummary = useMemo(() => {
    if (!analytics) return null;

    return (
      <>
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center p-3 mb-3 shadow-sm analytics-card">
              <Card.Title><Translate textKey="totalSales" fallback="Total Sales" /></Card.Title>
              <Card.Text className="display-6">{formatCurrency(analytics.sales)}</Card.Text>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center p-3 mb-3 shadow-sm analytics-card">
              <Card.Title><Translate textKey="totalProfit" fallback="Total Profit" /></Card.Title>
              <Card.Text className="display-6">{formatCurrency(analytics.profit)}</Card.Text>
              <small className="text-muted">{profitMargin}% margin</small>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center p-3 mb-3 shadow-sm analytics-card">
              <Card.Title><Translate textKey="itemsSold" fallback="Items Sold" /></Card.Title>
              <Card.Text className="display-6">{analytics.totalItems}</Card.Text>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center p-3 mb-3 shadow-sm analytics-card">
              <Card.Title><Translate textKey="transactions" fallback="Transactions" /></Card.Title>
              <Card.Text className="display-6">{analytics.transactionCount}</Card.Text>
            </Card>
          </Col>
        </Row>
        
        <Row className="mb-4">
          <Col md={12}>
            <Card className="shadow-sm profit-breakdown-card">
              <Card.Body>
                <h5><Translate textKey="profitBreakdown" fallback="Profit Breakdown" /></h5>
                <Row className="mt-3">
                  <Col xs={12} md={4} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span><Translate textKey="sales" fallback="Sales" />:</span>
                      <strong>{formatCurrency(analytics.sales)}</strong>
                    </div>
                  </Col>
                  <Col xs={12} md={4} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span><Translate textKey="profit" fallback="Profit" />:</span>
                      <strong>{formatCurrency(analytics.profit)}</strong>
                    </div>
                  </Col>
                  <Col xs={12} md={4} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span><Translate textKey="profitMargin" fallback="Profit Margin" />:</span>
                      <strong>{profitMargin}%</strong>
                    </div>
                  </Col>
                </Row>
                <div className="progress mt-2" style={{ height: '25px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: `${profitMargin}%` }} 
                    aria-valuenow={profitMargin} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {profitMargin}%
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Category-wise Sales and Profit */}
        {analytics.categoryData && analytics.categoryData.length > 0 && (
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5><Translate textKey="categoryBreakdown" fallback="Category Breakdown" /></h5>
              <div className="table-responsive mt-3">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th><Translate textKey="category" fallback="Category" /></th>
                      <th><Translate textKey="sales" fallback="Sales" /></th>
                      <th><Translate textKey="profit" fallback="Profit" /></th>
                      <th><Translate textKey="profitMargin" fallback="Profit Margin" /></th>
                      <th><Translate textKey="itemsSold" fallback="Items Sold" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.categoryData.map((category, index) => (
                      <CategoryRow key={index} category={category} index={index} />
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {/* Category Sales Distribution Chart (visual representation as progress bars) */}
              <h6 className="mt-4"><Translate textKey="salesDistribution" fallback="Sales Distribution" /></h6>
              {analytics.categoryData.map((category, index) => (
                <CategoryProgressBar 
                  key={index} 
                  category={category} 
                  index={index} 
                  totalSales={analytics.sales} 
                />
              ))}
            </Card.Body>
          </Card>
        )}
      </>
    );
  }, [analytics, profitMargin]);

  // Render detailed data based on view mode - memoized to prevent unnecessary recalculations
  const renderDetailedData = useMemo(() => {
    if (!analytics) return null;

    switch (viewMode) {
      case 'monthly':
        return (
          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th><Translate textKey="day" fallback="Day" /></th>
                <th><Translate textKey="sales" fallback="Sales" /></th>
                <th><Translate textKey="profit" fallback="Profit" /></th>
                <th><Translate textKey="profitMargin" fallback="Profit Margin" /> (%)</th>
              </tr>
            </thead>
            <tbody>
              {analytics.dailyData && analytics.dailyData.length > 0 ? (
                analytics.dailyData.map((day) => (
                  <DailyDataRow key={day.day} day={day} />
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    <Translate textKey="noDataAvailable" fallback="No data available for this period" />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        );
        
      case 'yearly':
        return (
          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th><Translate textKey="month" fallback="Month" /></th>
                <th><Translate textKey="sales" fallback="Sales" /></th>
                <th><Translate textKey="profit" fallback="Profit" /></th>
                <th><Translate textKey="profitMargin" fallback="Profit Margin" /> (%)</th>
              </tr>
            </thead>
            <tbody>
              {analytics.monthlyData && analytics.monthlyData.length > 0 ? (
                analytics.monthlyData.map((month) => (
                  <MonthlyDataRow key={month.month} month={month} />
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    <Translate textKey="noDataAvailable" fallback="No data available for this period" />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        );
        
      default: // daily
        return (
          <Alert variant="info">
            <Translate 
              textKey="dailyViewDescription" 
              fallback="Daily view displays summary data for the selected date. You can switch to monthly or yearly views for more detailed analysis."
            />
          </Alert>
        );
    }
  }, [analytics, viewMode]);

  // Memoized view mode button handlers
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="my-3"><Translate textKey="salesAndProfitAnalytics" fallback="Sales and Profit Analytics" /></h2>
        
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label><Translate textKey="viewMode" fallback="View Mode" /></Form.Label>
                  <div className="d-flex">
                    <Button
                      variant={viewMode === 'daily' ? 'primary' : 'outline-primary'}
                      className="me-2"
                      onClick={() => handleViewModeChange('daily')}
                    >
                      <Translate textKey="daily" fallback="Daily" />
                    </Button>
                    <Button
                      variant={viewMode === 'monthly' ? 'primary' : 'outline-primary'}
                      className="me-2"
                      onClick={() => handleViewModeChange('monthly')}
                    >
                      <Translate textKey="monthly" fallback="Monthly" />
                    </Button>
                    <Button
                      variant={viewMode === 'yearly' ? 'primary' : 'outline-primary'}
                      onClick={() => handleViewModeChange('yearly')}
                    >
                      <Translate textKey="yearly" fallback="Yearly" />
                    </Button>
                  </div>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    <Translate
                      textKey={`select${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`}
                      fallback={`Select ${viewMode}`}
                    />
                  </Form.Label>
                  {renderDateSelector}
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {isInitialLoad ? (
          <div className="text-center my-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : loading ? (
          <div className="position-relative">
            <div className="loading-overlay">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
            {analytics && (
              <>
                {renderSummary}
                
                <Card className="shadow-sm">
                  <Card.Body>
                    <h4 className="mb-3">
                      <Translate 
                        textKey={`${viewMode}Details`} 
                        fallback={`${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Details`} 
                      />
                    </h4>
                    {renderDetailedData}
                  </Card.Body>
                </Card>
              </>
            )}
          </div>
        ) : (
          <>
            {renderSummary}
            
            <Card className="shadow-sm">
              <Card.Body>
                <h4 className="mb-3">
                  <Translate 
                    textKey={`${viewMode}Details`} 
                    fallback={`${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Details`} 
                  />
                </h4>
                {renderDetailedData}
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </>
  );
};

export default SalesAnalytics;