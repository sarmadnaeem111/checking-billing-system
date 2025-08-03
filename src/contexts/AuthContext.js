import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { validatePassword } from '../utils/passwordPolicy';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register new shop with password validation
  function registerShop(email, password, shopDetails) {
    // Validate password against policy
    const passwordValidation = validatePassword(password);
    
    if (!passwordValidation.isValid) {
      return Promise.reject(new Error(passwordValidation.message));
    }
    
    return createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const user = userCredential.user;
        
        // Store shop details in Firestore
        return setDoc(doc(db, 'shops', user.uid), {
          ...shopDetails,
          userEmail: email,
          createdAt: new Date().toISOString(),
          lastPasswordChange: new Date().toISOString(),
          accountStatus: 'active'
        }).then(() => user);
      });
  }

  // Sign in existing user with failed attempt tracking
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        
        // Reset failed login attempts on successful login
        const userRef = doc(db, 'shops', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // If user has failed attempts, reset them
          if (userData.failedLoginAttempts) {
            await updateDoc(userRef, {
              failedLoginAttempts: 0,
              lastLoginAt: new Date().toISOString()
            });
          } else {
            await updateDoc(userRef, {
              lastLoginAt: new Date().toISOString()
            });
          }
        }
        
        return userCredential;
      })
      .catch(async (error) => {
        // If the error is due to invalid credentials and we have an email
        if (error.code === 'auth/wrong-password' && email) {
          try {
            // Try to find the user by email to update failed attempts
            const usersSnapshot = await getDocs(query(collection(db, 'shops'), where('userEmail', '==', email)));
            
            if (!usersSnapshot.empty) {
              const userDoc = usersSnapshot.docs[0];
              const userData = userDoc.data();
              const currentAttempts = userData.failedLoginAttempts || 0;
              
              // Update failed attempts count
              await updateDoc(doc(db, 'shops', userDoc.id), {
                failedLoginAttempts: currentAttempts + 1,
                lastFailedLoginAt: new Date().toISOString()
              });
              
              // If too many failed attempts, lock the account
              if (currentAttempts + 1 >= 5) {
                await updateDoc(doc(db, 'shops', userDoc.id), {
                  accountStatus: 'locked',
                  lockedAt: new Date().toISOString()
                });
                throw new Error('Account locked due to too many failed login attempts. Please contact an administrator.');
              }
            }
          } catch (innerError) {
            // If we have a custom error message, throw it
            if (innerError.message.includes('Account locked')) {
              throw innerError;
            }
            // Otherwise just throw the original error
          }
        }
        
        // Re-throw the original error
        throw error;
      });
  }

  // Sign out
  function logout() {
    return signOut(auth);
  }

  // Fetch shop data from Firestore
  function getShopData(userId) {
    return getDoc(doc(db, 'shops', userId))
      .then(shopDoc => {
        if (shopDoc.exists()) {
          const data = shopDoc.data();
          setShopData(data);
          return data;
        } else {
          return null;
        }
      });
  }
  
  // Update shop data
  function updateShopData(updatedData) {
    if (!currentUser) return Promise.reject(new Error('No user logged in'));
    
    return updateDoc(doc(db, 'shops', currentUser.uid), updatedData)
      .then(() => {
        // Update local state with new data
        setShopData(prevData => ({
          ...prevData,
          ...updatedData
        }));
        return true;
      });
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        getShopData(user.uid)
          .finally(() => {
            setLoading(false);
          });
      } else {
        setShopData(null);
        setLoading(false);
      }
    });
    
    return unsubscribe;
  }, []);

  // Change password with policy enforcement
  function changePassword(newPassword) {
    if (!currentUser) return Promise.reject(new Error('No user logged in'));
    
    // Validate password against policy
    const passwordValidation = validatePassword(newPassword);
    
    if (!passwordValidation.isValid) {
      return Promise.reject(new Error(passwordValidation.message));
    }
    
    return updatePassword(currentUser, newPassword)
      .then(() => {
        // Update password change timestamp in Firestore
        return updateDoc(doc(db, 'shops', currentUser.uid), {
          lastPasswordChange: new Date().toISOString()
        });
      });
  }

  // Sign in with Google
  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const userRef = doc(db, 'shops', user.uid);
        const userDoc = await getDoc(userRef);
        
        // If this is the first time signing in with Google
        if (!userDoc.exists()) {
          // Create a new shop document for this Google user
          await setDoc(userRef, {
            userEmail: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            accountStatus: 'active',
            authProvider: 'google'
          });
        } else {
          // Update last login time
          await updateDoc(userRef, {
            lastLoginAt: new Date().toISOString()
          });
        }
        
        return result;
      });
  }

  const value = {
    currentUser,
    shopData,
    registerShop,
    login,
    logout,
    getShopData,
    changePassword,
    updateShopData,
    loginWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
