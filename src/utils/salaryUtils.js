import { collection, addDoc, getDocs, getDoc, updateDoc, doc, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Get all salary records for a shop
export const getShopSalaryRecords = async (shopId, employeeId = null) => {
  try {
    const salaryRef = collection(db, 'salaries');
    let q;
    
    try {
      // First attempt with orderBy
      if (employeeId) {
        // Get salary records for a specific employee
        q = query(
          salaryRef, 
          where('shopId', '==', shopId),
          where('employeeId', '==', employeeId),
          orderBy('paymentDate', 'desc')
        );
      } else {
        // Get all salary records for the shop
        q = query(
          salaryRef, 
          where('shopId', '==', shopId),
          orderBy('paymentDate', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const salaryRecords = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return salaryRecords;
    } catch (indexError) {
      // If index error occurs, fallback to simpler query without orderBy
      console.log('Index not created yet, falling back to basic query');
      
      if (employeeId) {
        q = query(
          salaryRef, 
          where('shopId', '==', shopId),
          where('employeeId', '==', employeeId)
        );
      } else {
        q = query(
          salaryRef, 
          where('shopId', '==', shopId)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const salaryRecords = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort records client-side instead
      salaryRecords.sort((a, b) => {
        return new Date(b.paymentDate) - new Date(a.paymentDate);
      });
      
      return salaryRecords;
    }
  } catch (error) {
    console.error('Error fetching salary records:', error);
    throw error;
  }
};

// Add a new salary payment record
export const addSalaryPayment = async (paymentData) => {
  try {
    const salaryRef = collection(db, 'salaries');
    const docRef = await addDoc(salaryRef, {
      ...paymentData,
      createdAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding salary payment:', error);
    throw error;
  }
};

// Get a single salary record by ID
export const getSalaryRecordById = async (salaryId) => {
  try {
    const salaryRef = doc(db, 'salaries', salaryId);
    const salarySnap = await getDoc(salaryRef);
    
    if (salarySnap.exists()) {
      return {
        id: salarySnap.id,
        ...salarySnap.data()
      };
    } else {
      throw new Error('Salary record not found');
    }
  } catch (error) {
    console.error('Error fetching salary record:', error);
    throw error;
  }
};

// Update a salary record
export const updateSalaryRecord = async (salaryId, updateData) => {
  try {
    const salaryRef = doc(db, 'salaries', salaryId);
    await updateDoc(salaryRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return salaryId;
  } catch (error) {
    console.error('Error updating salary record:', error);
    throw error;
  }
};

// Delete a salary record
export const deleteSalaryRecord = async (salaryId) => {
  try {
    const salaryRef = doc(db, 'salaries', salaryId);
    await deleteDoc(salaryRef);
    return true;
  } catch (error) {
    console.error('Error deleting salary record:', error);
    throw error;
  }
};

// Calculate total salary paid to an employee within a date range
export const calculateTotalSalaryPaid = async (shopId, employeeId, startDate, endDate) => {
  try {
    const salaryRef = collection(db, 'salaries');
    
    // Use a simpler query and filter client-side to avoid index requirements
    const q = query(
      salaryRef,
      where('shopId', '==', shopId),
      where('employeeId', '==', employeeId)
    );
    
    const querySnapshot = await getDocs(q);
    const allRecords = querySnapshot.docs.map(doc => doc.data());
    
    // Filter by date range on the client side
    const salaryRecords = allRecords.filter(record => 
      record.paymentDate >= startDate && record.paymentDate <= endDate
    );
    
    const totalPaid = salaryRecords.reduce(
      (total, record) => total + (parseFloat(record.amount) || 0), 
      0
    );
    
    return totalPaid;
  } catch (error) {
    console.error('Error calculating total salary:', error);
    return 0; // Return 0 in case of error
  }
};

// Get total salary statistics for the shop
export const getSalaryStatistics = async (shopId) => {
  try {
    const salaryRef = collection(db, 'salaries');
    const q = query(salaryRef, where('shopId', '==', shopId));
    
    const querySnapshot = await getDocs(q);
    const salaryRecords = querySnapshot.docs.map(doc => doc.data());
    
    // Get current month records
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthRecords = salaryRecords.filter(record => {
      const paymentDate = new Date(record.paymentDate);
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear;
    });
    
    // Calculate totals
    const totalAllTime = salaryRecords.reduce(
      (total, record) => total + (parseFloat(record.amount) || 0), 
      0
    );
    
    const totalCurrentMonth = currentMonthRecords.reduce(
      (total, record) => total + (parseFloat(record.amount) || 0), 
      0
    );
    
    return {
      totalAllTime,
      totalCurrentMonth,
      recordCount: salaryRecords.length,
      currentMonthCount: currentMonthRecords.length
    };
  } catch (error) {
    console.error('Error getting salary statistics:', error);
    // Return default statistics in case of error
    return {
      totalAllTime: 0,
      totalCurrentMonth: 0,
      recordCount: 0,
      currentMonthCount: 0
    };
  }
}; 