import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { restoreStockQuantity } from './stockUtils';

// Generate a unique transaction ID
export const generateTransactionId = () => {
  return uuidv4().substring(0, 8).toUpperCase();
};

// Calculate the total amount of all items with optional discount
export const calculateTotal = (items, discount = 0) => {
  if (!items || items.length === 0) return 0;
  const subtotal = items.reduce((total, item) => total + (parseFloat(item.price) * parseFloat(item.quantity)), 0);
  const discountAmount = parseFloat(discount) || 0;
  return (subtotal - discountAmount).toFixed(2);
};

// Save a receipt to Firestore
export const saveReceipt = async (receiptData) => {
  try {
    const receiptRef = collection(db, 'receipts');
    const docRef = await addDoc(receiptRef, {
      ...receiptData,
      timestamp: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving receipt:', error);
    throw error;
  }
};

// Fetch a single receipt by ID
export const getReceiptById = async (receiptId) => {
  try {
    const receiptRef = doc(db, 'receipts', receiptId);
    const receiptSnap = await getDoc(receiptRef);
    
    if (receiptSnap.exists()) {
      return {
        id: receiptSnap.id,
        ...receiptSnap.data()
      };
    } else {
      throw new Error('Receipt not found');
    }
  } catch (error) {
    console.error('Error fetching receipt:', error);
    throw error;
  }
};

// Delete a receipt by ID
export const deleteReceipt = async (receiptId) => {
  try {
    // First get the receipt to access its items
    const receipt = await getReceiptById(receiptId);
    
    // Delete the receipt from Firestore
    const receiptRef = doc(db, 'receipts', receiptId);
    await deleteDoc(receiptRef);
    
    // Restore items back to inventory
    if (receipt && receipt.items && receipt.items.length > 0) {
      await restoreStockQuantity(receipt.shopId, receipt.items);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting receipt:', error);
    throw error;
  }
};

// Update a receipt by ID
export const updateReceipt = async (receiptId, updatedData) => {
  try {
    const receiptRef = doc(db, 'receipts', receiptId);
    await updateDoc(receiptRef, updatedData);
    return true;
  } catch (error) {
    console.error('Error updating receipt:', error);
    throw error;
  }
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR'
  }).format(amount);
};

// Format date to local date string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Format time to local time string
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
};