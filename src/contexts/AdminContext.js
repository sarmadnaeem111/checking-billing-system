import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  updateDoc,
  orderBy
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Admin email from environment variables
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || "";

// In a production environment, admin users should be managed through Firebase Authentication
// with custom claims or a separate admin collection in Firestore

const AdminContext = createContext();

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin login with secure authentication
  function adminLogin(email, password) {
    // First authenticate with Firebase
    return signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        // Check if the user is in the admins collection
        return getDoc(doc(db, 'admins', userCredential.user.uid))
          .then(adminDoc => {
            if (!adminDoc.exists()) {
              // If the user is not in the admins collection, check if it's the designated admin email
              if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                // This is the designated admin email from environment variables
                const adminUser = {
                  ...userCredential.user,
                  isAdmin: true
                };
                setAdminUser(adminUser);
                return adminUser;
              } else {
                // Not an admin, log them out
                signOut(auth);
                throw new Error('Invalid admin credentials');
              }
            }
            
            // User exists in admin collection
            const adminUser = {
              ...userCredential.user,
              ...adminDoc.data(),
              isAdmin: true
            };
            
            // Set the admin user in state
            setAdminUser(adminUser);
            return adminUser;
          });
      });
  }

  // Admin logout
  function adminLogout() {
    // Clear the admin session from localStorage
    localStorage.removeItem('adminSession');
    // Clear the admin user from state
    setAdminUser(null);
    // Sign out from Firebase Auth
    return signOut(auth);
  }

  // Get pending user registrations
  async function getPendingUsers() {
    try {
      console.log("Starting getPendingUsers function");
      
      // Mock data for testing - useful when database is empty
      const useMockData = false; // Set to false to use real data from Firebase
      
      if (useMockData) {
        console.log("Using mock data for pending users");
        return [
          {
            id: 'mock-user-1',
            shopName: 'Test Shop 1',
            email: 'testshop1@example.com',
            address: '123 Test Street',
            phoneNumber: '123-456-7890',
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            id: 'mock-user-2',
            shopName: 'Test Shop 2',
            email: 'testshop2@example.com',
            address: '456 Test Avenue',
            phoneNumber: '098-765-4321',
            status: 'pending',
            createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          }
        ];
      }
      
      // Real data from Firestore
      const usersRef = collection(db, 'shops');
      console.log("Created collection reference to shops");
      
      const q = query(
        usersRef, 
        where('status', '==', 'pending')
      );
      console.log("Created query for pending status");
      
      const snapshot = await getDocs(q);
      console.log(`Query returned ${snapshot.docs.length} documents`);
      
      const users = snapshot.docs
        .map(doc => {
          const data = doc.data();
          console.log(`Processing document: ${doc.id}`, data);
          return {
            id: doc.id,
            email: data.userEmail || data.email || 'No email available',
            ...data
          };
        })
        .sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      
      console.log("Processed and sorted users:", users);
      return users;
    } catch (error) {
      console.error('Error fetching pending users:', error);
      console.error('Error details:', error.code, error.message);
      // Return empty array instead of throwing
      return [];
    }
  }

  // Get all users
  async function getAllUsers() {
    try {
      console.log("Starting getAllUsers function");
      
      // Mock data for testing - useful when database is empty
      const useMockData = false; // Set to false to use real data from Firebase
      
      if (useMockData) {
        console.log("Using mock data for all users");
        return [
          {
            id: 'mock-user-1',
            shopName: 'Active Shop',
            email: 'activeshop@example.com',
            address: '123 Active Street',
            phoneNumber: '123-456-7890',
            status: 'approved',
            createdAt: new Date().toISOString()
          },
          {
            id: 'mock-user-2',
            shopName: 'Pending Shop',
            email: 'pendingshop@example.com',
            address: '456 Pending Avenue',
            phoneNumber: '098-765-4321',
            status: 'pending',
            createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          },
          {
            id: 'mock-user-3',
            shopName: 'Frozen Shop',
            email: 'frozenshop@example.com',
            address: '789 Frozen Lane',
            phoneNumber: '555-123-4567',
            status: 'frozen',
            createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
          },
          {
            id: 'mock-user-4',
            shopName: 'Rejected Shop',
            email: 'rejectedshop@example.com',
            address: '321 Rejected Road',
            phoneNumber: '111-222-3333',
            status: 'rejected',
            createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
          }
        ];
      }
      
      // Real data from Firestore
      const usersRef = collection(db, 'shops');
      console.log("Created collection reference to shops");
      
      const snapshot = await getDocs(usersRef);
      console.log(`Query returned ${snapshot.docs.length} documents`);
      
      const users = snapshot.docs
        .map(doc => {
          const data = doc.data();
          console.log(`Processing document: ${doc.id}`, data);
          return {
            id: doc.id,
            email: data.userEmail || data.email || 'No email available',
            ...data
          };
        })
        .sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      
      console.log("Processed and sorted all users:", users);
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      console.error('Error details:', error.code, error.message);
      // Return empty array instead of throwing
      return [];
    }
  }

  // Approve user registration
  async function approveUser(userId) {
    try {
      await updateDoc(doc(db, 'shops', userId), {
        status: 'approved',
        approvedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  }

  // Reject user registration
  async function rejectUser(userId) {
    try {
      await updateDoc(doc(db, 'shops', userId), {
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
  }

  // Freeze/unfreeze user account
  async function toggleUserFreeze(userId, freeze) {
    try {
      await updateDoc(doc(db, 'shops', userId), {
        status: freeze ? 'frozen' : 'approved',
        lastStatusChange: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error(`Error ${freeze ? 'freezing' : 'unfreezing'} user:`, error);
      throw error;
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    // Check if we have a stored admin session in localStorage
    const storedAdmin = localStorage.getItem('adminSession');
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        // Verify if the stored admin is valid
        if (adminData && adminData.email === ADMIN_EMAIL) {
          setAdminUser(adminData);
          setLoading(false);
          return; // Skip Firebase auth check
        }
      } catch (e) {
        // Invalid stored data, clear it
        localStorage.removeItem('adminSession');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Special case for our admin account
        if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          const adminUser = {
            ...user,
            isAdmin: true
          };
          setAdminUser(adminUser);
          // Store admin session
          localStorage.setItem('adminSession', JSON.stringify(adminUser));
          setLoading(false);
          return;
        }
        
        // Otherwise check if the user is in the admins collection
        getDoc(doc(db, 'admins', user.uid))
          .then(adminDoc => {
            if (adminDoc.exists()) {
              const adminUser = {
                ...user,
                isAdmin: true,
                ...adminDoc.data()
              };
              setAdminUser(adminUser);
              // Store admin session
              localStorage.setItem('adminSession', JSON.stringify(adminUser));
            } else {
              setAdminUser(null);
              localStorage.removeItem('adminSession');
            }
          })
          .catch(error => {
            console.error('Error checking admin status:', error);
            setError('Failed to verify admin credentials');
            setAdminUser(null);
            localStorage.removeItem('adminSession');
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setAdminUser(null);
        localStorage.removeItem('adminSession');
        setLoading(false);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const value = {
    adminUser,
    adminLogin,
    adminLogout,
    getPendingUsers,
    getAllUsers,
    approveUser,
    rejectUser,
    toggleUserFreeze,
    error,
    setError,
    // Debug props
    isDebugMode: true
  };

  return (
    <AdminContext.Provider value={value}>
      {!loading && children}
    </AdminContext.Provider>
  );
}