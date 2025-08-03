import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

// Mock data for testing/fallback
const MOCK_STOCK = [
  {
    id: 'mock-item-1',
    name: 'Sample Product 1',
    description: 'This is a sample product',
    category: 'General',
    price: 19.99,
    quantity: 25,
    costPrice: 15.00,
    shopId: 'test-shop-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-item-2',
    name: 'Sample Product 2',
    description: 'Another sample product',
    category: 'Electronics',
    price: 29.99,
    quantity: 10,
    costPrice: 25.00,
    shopId: 'test-shop-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Add a new stock item
export const addStockItem = async (shopId, itemData) => {
  try {
    console.log('Adding stock item for shop ID:', shopId);
    
    if (!shopId) {
      console.error('No shop ID provided for addStockItem');
      throw new Error('Shop ID is required to add stock item');
    }
    
    const stockRef = collection(db, 'stock');
    const docRef = await addDoc(stockRef, {
      shopId,
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('Stock item added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding stock item:', error);
    console.error('Error details:', error.code, error.message);
    throw error;
  }
};

// Get all stock items for a shop
export const getShopStock = async (shopId) => {
  try {
    console.log(`Fetching stock items for shop ID: ${shopId}`);
    
    if (!shopId) {
      console.error('No shop ID provided for getShopStock');
      return [];
    }
    
    const stockRef = collection(db, 'stock');
    const q = query(stockRef, where('shopId', '==', shopId));
    
    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log(`Query returned ${querySnapshot.docs.length} results`);
    
    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return items;
  } catch (error) {
    console.error('Error fetching stock items:', error);
    console.error('Error details:', error.code, error.message);
    // Return empty array instead of throwing to avoid loading state getting stuck
    return [];
  }
};

// Get a single stock item by ID
export const getStockItemById = async (itemId) => {
  try {
    const stockRef = doc(db, 'stock', itemId);
    const stockSnap = await getDoc(stockRef);
    
    if (stockSnap.exists()) {
      return {
        id: stockSnap.id,
        ...stockSnap.data()
      };
    } else {
      throw new Error('Stock item not found');
    }
  } catch (error) {
    console.error('Error fetching stock item:', error);
    throw error;
  }
};

// Update a stock item
export const updateStockItem = async (itemId, updateData) => {
  try {
    const stockRef = doc(db, 'stock', itemId);
    await updateDoc(stockRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return itemId;
  } catch (error) {
    console.error('Error updating stock item:', error);
    throw error;
  }
};

// Delete a stock item
export const deleteStockItem = async (itemId) => {
  try {
    const stockRef = doc(db, 'stock', itemId);
    await deleteDoc(stockRef);
    return true;
  } catch (error) {
    console.error('Error deleting stock item:', error);
    throw error;
  }
};

// Update stock quantity when a sale is made
export const updateStockQuantity = async (shopId, items) => {
  try {
    const stockRef = collection(db, 'stock');
    const q = query(stockRef, where('shopId', '==', shopId));
    const querySnapshot = await getDocs(q);
    
    const stockItems = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Process each sold item
    const updates = items.map(soldItem => {
      const stockItem = stockItems.find(item => item.name === soldItem.name);
      
      if (stockItem) {
        // Make sure units match before deducting (both should be in the same unit)
        // If units don't match, we can't properly deduct
        if (!soldItem.quantityUnit || soldItem.quantityUnit === stockItem.quantityUnit) {
          const newQuantity = Math.max(0, stockItem.quantity - soldItem.quantity);
          return updateStockItem(stockItem.id, { quantity: newQuantity });
        }
      }
      
      return Promise.resolve();
    });
    
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error('Error updating stock quantities:', error);
    throw error;
  }
};

// Restore stock quantity when a receipt is deleted
export const restoreStockQuantity = async (shopId, items) => {
  try {
    const stockRef = collection(db, 'stock');
    const q = query(stockRef, where('shopId', '==', shopId));
    const querySnapshot = await getDocs(q);
    
    const stockItems = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Process each item to restore
    const updates = items.map(receiptItem => {
      const stockItem = stockItems.find(item => item.name === receiptItem.name);
      
      if (stockItem) {
        // Make sure units match before adding (both should be in the same unit)
        if (!receiptItem.quantityUnit || receiptItem.quantityUnit === stockItem.quantityUnit) {
          const newQuantity = stockItem.quantity + parseFloat(receiptItem.quantity);
          return updateStockItem(stockItem.id, { quantity: newQuantity });
        }
      }
      
      return Promise.resolve();
    });
    
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error('Error restoring stock quantities:', error);
    throw error;
  }
};