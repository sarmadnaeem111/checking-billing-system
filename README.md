# Shop Billing System

A web application for managing shop receipts and billing, built with React.js and Firebase.

## Features

- **User Authentication**
  - Shop registration with details (name, address, contact)
  - Secure login system using Firebase Authentication
  - Personalized dashboard for each shop

- **Receipt Management**
  - Create and generate professional receipts
  - Real-time preview with print/download options
  - Store and retrieve receipts from Firebase Firestore
  - Search and filter capabilities

- **Receipt Features**
  - Shop details automatically included
  - Date and time auto-generation
  - Manager and cashier fields
  - Line items with quantity, price, and total
  - Automatic calculations
  - Multiple payment methods
  - Unique transaction IDs

## Technology Stack

- **Frontend**: React.js with React Bootstrap
- **State Management**: React Hooks and Context API
- **Backend Services**: Firebase (Authentication, Firestore, Storage)
- **Styling**: Bootstrap 5 with custom CSS
- **PDF Generation**: React-to-PDF

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Firebase account
- Git (optional)

### Installation

1. Clone or download this repository
```
git clone <repository-url>
```

2. Navigate to the project directory
```
cd myapp
```

3. Install dependencies
```
npm install
```

4. Set up Firebase:
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase configuration from Project Settings
   - Replace the placeholder configuration in `src/firebase/config.js` with your actual configuration

5. Start the development server
```
npm start
```

6. Open your browser and navigate to `http://localhost:3000`

## Firebase Setup Details

1. Authentication:
   - Enable Email/Password authentication in Firebase console

2. Firestore Database:
   - Create the following collections:
     - `shops`: Store shop information
     - `receipts`: Store receipt data

3. Storage:
   - Set up appropriate security rules for storing shop logos (optional feature)

## Usage Guide

1. **Registration**: Register your shop with required details
2. **Login**: Access your shop dashboard
3. **Create Receipt**: Fill out receipt details, add items, and generate receipt
4. **View Receipts**: Access all past receipts with search and filter options
5. **Download/Print**: Export receipts as PDF for sharing or printing

## License

This project is licensed under the MIT License

## Acknowledgements

- React Bootstrap for UI components
- Firebase for backend services
- React Router for navigation
- UUID for unique ID generation
- React-to-PDF for PDF export functionality

## Support

For questions or issues, please open a GitHub issue or contact the project maintainer.
