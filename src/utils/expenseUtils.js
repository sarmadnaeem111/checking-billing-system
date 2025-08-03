import { collection, addDoc, getDocs, getDoc, updateDoc, doc, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Get all expense records for a shop
export const getShopExpenseRecords = async (shopId, categoryId = null) => {
  try {
    const expenseRef = collection(db, 'expenses');
    let q;
    
    try {
      // First attempt with orderBy
      if (categoryId) {
        // Get expense records for a specific category
        q = query(
          expenseRef, 
          where('shopId', '==', shopId),
          where('categoryId', '==', categoryId),
          orderBy('expenseDate', 'desc')
        );
      } else {
        // Get all expense records for the shop
        q = query(
          expenseRef, 
          where('shopId', '==', shopId),
          orderBy('expenseDate', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const expenseRecords = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return expenseRecords;
    } catch (indexError) {
      // If index error occurs, fallback to simpler query without orderBy
      console.log('Index not created yet, falling back to basic query');
      
      if (categoryId) {
        q = query(
          expenseRef, 
          where('shopId', '==', shopId),
          where('categoryId', '==', categoryId)
        );
      } else {
        q = query(
          expenseRef, 
          where('shopId', '==', shopId)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const expenseRecords = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort records client-side instead
      expenseRecords.sort((a, b) => {
        return new Date(b.expenseDate) - new Date(a.expenseDate);
      });
      
      return expenseRecords;
    }
  } catch (error) {
    console.error('Error fetching expense records:', error);
    throw error;
  }
};

// Add a new expense record
export const addExpense = async (expenseData) => {
  try {
    const expenseRef = collection(db, 'expenses');
    const docRef = await addDoc(expenseRef, {
      ...expenseData,
      createdAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

// Get a single expense record by ID
export const getExpenseById = async (expenseId) => {
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    const expenseSnap = await getDoc(expenseRef);
    
    if (expenseSnap.exists()) {
      return {
        id: expenseSnap.id,
        ...expenseSnap.data()
      };
    } else {
      throw new Error('Expense record not found');
    }
  } catch (error) {
    console.error('Error fetching expense record:', error);
    throw error;
  }
};

// Update an expense record
export const updateExpense = async (expenseId, updateData) => {
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    await updateDoc(expenseRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return expenseId;
  } catch (error) {
    console.error('Error updating expense record:', error);
    throw error;
  }
};

// Delete an expense record
export const deleteExpense = async (expenseId) => {
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    await deleteDoc(expenseRef);
    return true;
  } catch (error) {
    console.error('Error deleting expense record:', error);
    throw error;
  }
};

// Get expense categories for a shop
export const getExpenseCategories = async (shopId) => {
  try {
    const categoryRef = collection(db, 'expenseCategories');
    const q = query(categoryRef, where('shopId', '==', shopId));
    
    const querySnapshot = await getDocs(q);
    const categories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return categories;
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    throw error;
  }
};

// Add a new expense category
export const addExpenseCategory = async (categoryData) => {
  try {
    const categoryRef = collection(db, 'expenseCategories');
    const docRef = await addDoc(categoryRef, {
      ...categoryData,
      createdAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding expense category:', error);
    throw error;
  }
};

// Update an expense category
export const updateExpenseCategory = async (categoryId, updateData) => {
  try {
    const categoryRef = doc(db, 'expenseCategories', categoryId);
    await updateDoc(categoryRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return categoryId;
  } catch (error) {
    console.error('Error updating expense category:', error);
    throw error;
  }
};

// Delete an expense category
export const deleteExpenseCategory = async (categoryId) => {
  try {
    const categoryRef = doc(db, 'expenseCategories', categoryId);
    await deleteDoc(categoryRef);
    return true;
  } catch (error) {
    console.error('Error deleting expense category:', error);
    throw error;
  }
};

// Get expense statistics for the shop
export const getExpenseStatistics = async (shopId) => {
  try {
    const expenseRef = collection(db, 'expenses');
    const q = query(expenseRef, where('shopId', '==', shopId));
    
    const querySnapshot = await getDocs(q);
    const expenseRecords = querySnapshot.docs.map(doc => doc.data());
    
    // Get current month records
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthRecords = expenseRecords.filter(record => {
      const expenseDate = new Date(record.expenseDate);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
    
    // Calculate totals
    const totalAllTime = expenseRecords.reduce(
      (total, record) => total + (parseFloat(record.amount) || 0), 
      0
    );
    
    const totalCurrentMonth = currentMonthRecords.reduce(
      (total, record) => total + (parseFloat(record.amount) || 0), 
      0
    );
    
    // Group by category for current month
    const categoryTotals = {};
    currentMonthRecords.forEach(record => {
      const categoryId = record.categoryId || 'uncategorized';
      const amount = parseFloat(record.amount) || 0;
      
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = 0;
      }
      
      categoryTotals[categoryId] += amount;
    });
    
    return {
      totalAllTime,
      totalCurrentMonth,
      recordCount: expenseRecords.length,
      currentMonthCount: currentMonthRecords.length,
      categoryTotals
    };
  } catch (error) {
    console.error('Error getting expense statistics:', error);
    // Return default statistics in case of error
    return {
      totalAllTime: 0,
      totalCurrentMonth: 0,
      recordCount: 0,
      currentMonthCount: 0,
      categoryTotals: {}
    };
  }
};

// Get expenses for a specific date range
export const getExpensesByDateRange = async (shopId, startDate, endDate) => {
  try {
    const expenseRef = collection(db, 'expenses');
    const q = query(expenseRef, where('shopId', '==', shopId));
    
    const querySnapshot = await getDocs(q);
    const allRecords = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter by date range on the client side
    const filteredRecords = allRecords.filter(record => 
      record.expenseDate >= startDate && record.expenseDate <= endDate
    );
    
    // Sort by date
    filteredRecords.sort((a, b) => {
      return new Date(b.expenseDate) - new Date(a.expenseDate);
    });
    
    return filteredRecords;
  } catch (error) {
    console.error('Error fetching expenses by date range:', error);
    throw error;
  }
};