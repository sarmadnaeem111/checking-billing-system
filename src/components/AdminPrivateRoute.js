import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AdminPrivateRoute = ({ children }) => {
  const { adminUser } = useAdmin();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (!adminUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Check if user exists in admins collection
        const adminDoc = await getDoc(doc(db, 'admins', adminUser.uid));
        
        // Check if user email matches the designated admin email
        const isDesignatedAdmin = adminUser.email && 
          adminUser.email.toLowerCase() === (process.env.REACT_APP_ADMIN_EMAIL || '').toLowerCase();
        
        // Verify admin status
        if (adminDoc.exists() || isDesignatedAdmin) {
          setIsVerified(true);
        }
      } catch (error) {
        console.error('Error verifying admin status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAdminStatus();
  }, [adminUser]);
  
  if (isLoading) {
    // Show loading state while verifying
    return <div className="d-flex justify-content-center p-5">Verifying admin privileges...</div>;
  }
  
  if (!adminUser || !isVerified) {
    // If no admin user or not verified, redirect to admin login
    return <Navigate to="/admin/login" />;
  }
  
  return children;
};

export default AdminPrivateRoute;