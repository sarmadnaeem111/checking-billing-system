import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

// Cache for stock items to avoid repeated queries
const stockItemsCache = new Map();

// Helper function to query receipts for a specific date range
export const getReceiptsForDateRange = async (shopId, startDate, endDate) => {
  try {
    const receiptRef = collection(db, 'receipts');
    
    // First, query only by shopId which doesn't require a composite index
    const shopQuery = query(
      receiptRef,
      where('shopId', '==', shopId)
    );
    
    // Get all receipts for this shop
    const receiptsSnapshot = await getDocs(shopQuery);
    
    // Then filter by date range in memory
    const startTimestamp = startDate.toISOString();
    const endTimestamp = endDate.toISOString();
    
    // Filter receipts by timestamp
    return receiptsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(receipt => 
        receipt.timestamp >= startTimestamp && 
        receipt.timestamp <= endTimestamp
      );
  } catch (error) {
    console.error('Error fetching receipts:', error);
    throw error;
  }
};

// Helper function to get all stock items for a shop (with caching)
const getShopStockItems = async (shopId) => {
  // Check if we already have the stock items in cache
  if (stockItemsCache.has(shopId)) {
    return stockItemsCache.get(shopId);
  }
  
  try {
    const stockRef = collection(db, 'stock');
    const stockQuery = query(
      stockRef,
      where('shopId', '==', shopId)
    );
    
    const stockSnapshot = await getDocs(stockQuery);
    
    // Create a map of item name to stock details for quick lookup
    const stockItems = {};
    stockSnapshot.docs.forEach(doc => {
      const item = doc.data();
      stockItems[item.name.toLowerCase()] = {
        costPrice: item.costPrice || 0,
        category: item.category || 'Uncategorized'
      };
    });
    
    // Store in cache
    stockItemsCache.set(shopId, stockItems);
    
    return stockItems;
  } catch (error) {
    console.log('Error fetching stock items:', error.message);
    return {};
  }
};

// Function to calculate daily sales and profit
export const getDailySalesAndProfit = async (shopId, date = new Date()) => {
  const start = startOfDay(date);
  const end = endOfDay(date);
  
  const receipts = await getReceiptsForDateRange(shopId, start, end);
  
  return calculateSalesAndProfit(receipts, shopId);
};

// Function to calculate monthly sales and profit
export const getMonthlySalesAndProfit = async (shopId, date = new Date()) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  
  const receipts = await getReceiptsForDateRange(shopId, start, end);
  
  // Group by day for the chart data
  const dailyData = [];
  const daysInMonth = {};
  
  receipts.forEach(receipt => {
    const day = format(new Date(receipt.timestamp), 'yyyy-MM-dd');
    
    if (!daysInMonth[day]) {
      daysInMonth[day] = {
        day: format(new Date(receipt.timestamp), 'dd'),
        sales: 0,
        profit: 0,
        receipts: []
      };
    }
    
    daysInMonth[day].receipts.push(receipt);
  });
  
  // Get all stock items once for the entire calculation
  const stockItems = await getShopStockItems(shopId);
  
  // Calculate sales and profit for each day
  const dailyCalcPromises = Object.keys(daysInMonth).sort().map(async (day) => {
    const { sales, profit } = await calculateSalesAndProfit(daysInMonth[day].receipts, shopId, stockItems);
    return {
      day: daysInMonth[day].day,
      sales,
      profit
    };
  });
  
  // Wait for all profit calculations to complete
  dailyData.push(...await Promise.all(dailyCalcPromises));
  
  const totals = await calculateSalesAndProfit(receipts, shopId, stockItems);
  
  return {
    ...totals,
    dailyData
  };
};

// Function to calculate yearly sales and profit
export const getYearlySalesAndProfit = async (shopId, date = new Date()) => {
  const start = startOfYear(date);
  const end = endOfYear(date);
  
  const receipts = await getReceiptsForDateRange(shopId, start, end);
  
  // Group by month for the chart data
  const monthlyData = [];
  const monthsInYear = {};
  
  receipts.forEach(receipt => {
    const month = format(new Date(receipt.timestamp), 'yyyy-MM');
    
    if (!monthsInYear[month]) {
      monthsInYear[month] = {
        month: format(new Date(receipt.timestamp), 'MMM'),
        sales: 0,
        profit: 0,
        receipts: []
      };
    }
    
    monthsInYear[month].receipts.push(receipt);
  });
  
  // Get all stock items once for the entire calculation
  const stockItems = await getShopStockItems(shopId);
  
  // Calculate sales and profit for each month
  const monthlyCalcPromises = Object.keys(monthsInYear).sort().map(async (month) => {
    const { sales, profit } = await calculateSalesAndProfit(monthsInYear[month].receipts, shopId, stockItems);
    return {
      month: monthsInYear[month].month,
      sales,
      profit
    };
  });
  
  // Wait for all profit calculations to complete
  monthlyData.push(...await Promise.all(monthlyCalcPromises));
  
  const totals = await calculateSalesAndProfit(receipts, shopId, stockItems);
  
  return {
    ...totals,
    monthlyData
  };
};

// Helper function to calculate sales and profit from receipt items
export const calculateSalesAndProfit = async (receipts, shopId = null, stockItemsData = null) => {
  let sales = 0;
  let profit = 0;
  let totalItems = 0;
  
  // Track sales and profit by category
  const categorySales = {};
  
  // Get stock items if not provided
  const stockItems = stockItemsData || (shopId ? await getShopStockItems(shopId) : {});
  
  // Process all receipts
  for (const receipt of receipts) {
    // Add the total amount to sales (we'll subtract returns later if any)
    sales += parseFloat(receipt.totalAmount || 0);
    
    // Process all items in this receipt
    for (const item of receipt.items) {
      const quantity = parseFloat(item.quantity || 1);
      const price = parseFloat(item.price || 0);
      let costPrice = parseFloat(item.costPrice || 0);
      let category = 'Uncategorized';
      
      // If cost price is not available in the receipt, try to get it from cached stock items
      if ((costPrice <= 0 || isNaN(costPrice)) && item.name) {
        const stockItem = stockItems[item.name.toLowerCase()];
        if (stockItem) {
          costPrice = stockItem.costPrice || 0;
          category = stockItem.category || 'Uncategorized';
        }
      }
      
      // Calculate item profit
      let itemProfit = 0;
      if (costPrice > 0) {
        itemProfit = (price - costPrice) * quantity;
      } else {
        // Fallback: Use an estimated profit margin of 30% when no cost price is available
        itemProfit = (price * 0.3) * quantity;
      }
      
      // Update total profit
      profit += itemProfit;
      
      // Track sales and profit by category
      if (!categorySales[category]) {
        categorySales[category] = {
          sales: 0,
          profit: 0,
          items: 0
        };
      }
      
      // Update category data
      categorySales[category].sales += price * quantity;
      categorySales[category].profit += itemProfit;
      categorySales[category].items += quantity;
      
      totalItems += quantity;
    }
    
    // Handle returned products - subtract them from sales and profit analytics
    if (receipt.returnInfo && receipt.returnInfo.affectsSalesAnalytics && receipt.returnInfo.returnedItems) {
      // Subtract the return total from sales
      const returnTotal = parseFloat(receipt.returnInfo.returnTotal || 0);
      sales -= returnTotal;
      
      // Process each returned item to adjust profit and category data
      for (const returnedItem of receipt.returnInfo.returnedItems) {
        const returnQuantity = parseFloat(returnedItem.quantity || 0);
        const returnPrice = parseFloat(returnedItem.price || 0);
        let returnCostPrice = parseFloat(returnedItem.costPrice || 0);
        let returnCategory = returnedItem.category || 'Uncategorized';
        
        // If cost price is not available in the returned item, try to get it from cached stock items
        if ((returnCostPrice <= 0 || isNaN(returnCostPrice)) && returnedItem.name) {
          const stockItem = stockItems[returnedItem.name.toLowerCase()];
          if (stockItem) {
            returnCostPrice = stockItem.costPrice || 0;
            returnCategory = stockItem.category || 'Uncategorized';
          }
        }
        
        // Calculate returned item profit
        let returnItemProfit = 0;
        if (returnCostPrice > 0) {
          returnItemProfit = (returnPrice - returnCostPrice) * returnQuantity;
        } else {
          // Fallback: Use an estimated profit margin of 30% when no cost price is available
          returnItemProfit = (returnPrice * 0.3) * returnQuantity;
        }
        
        // Subtract from total profit
        profit -= returnItemProfit;
        
        // Ensure category exists in tracking
        if (!categorySales[returnCategory]) {
          categorySales[returnCategory] = {
            sales: 0,
            profit: 0,
            items: 0
          };
        }
        
        // Update category data by subtracting returned items
        categorySales[returnCategory].sales -= returnPrice * returnQuantity;
        categorySales[returnCategory].profit -= returnItemProfit;
        categorySales[returnCategory].items -= returnQuantity;
        
        // Subtract from total items
        totalItems -= returnQuantity;
      }
    }
  }
  
  // Convert category data to array for easier processing
  const categoryData = Object.keys(categorySales).map(category => ({
    category,
    sales: categorySales[category].sales,
    profit: categorySales[category].profit,
    items: categorySales[category].items,
    profitMargin: categorySales[category].sales > 0 
      ? (categorySales[category].profit / categorySales[category].sales * 100).toFixed(2) 
      : 0
  }));
  
  // Sort categories by sales (highest first)
  categoryData.sort((a, b) => b.sales - a.sales);
  
  return {
    sales,
    profit,
    totalItems,
    transactionCount: receipts.length,
    categoryData
  };
};