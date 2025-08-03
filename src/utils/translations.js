const translations = {
  en: {
    // Navbar
    dashboard: "Dashboard",
    newReceipt: "New Receipt",
    receipts: "Receipts",
    inventory: "Inventory",
    employees: "Employees",
    viewEmployees: "View Employees",
    addEmployee: "Add Employee",
    attendance: "Attendance",
    viewAttendance: "View Attendance",
    markAttendance: "Mark Attendance",
    attendanceReport: "Attendance Report",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    register: "Register",
    
    // Common buttons
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    view: "View",
    back: "Back",
    submit: "Submit",
    returnProducts: "Return Products",
    
    // Additional menu items
    stockInventory: "Stock Inventory",
    addNewEmployee: "Add New Employee",
    attendanceRecordsMenu: "Attendance Records",
    shopSettings: "Shop Settings",
    
    // Language toggle
    switchToUrdu: "اردو",
    switchToEnglish: "English",
    
    // Admin Panel
    adminPanel: "Admin Panel",
    pendingApprovals: "Pending Approvals",
    manageUsers: "Manage Users",
    menu: "Menu",
    
    // Data related translations
    productName: "Product Name",
    quantity: "Quantity",
    price: "Price",
    total: "Total",
    date: "Date",
    status: "Status",
    paid: "Paid",
    unpaid: "Unpaid",
    customer: "Customer",
    phone: "Phone",
    address: "Address",
    email: "Email",
    description: "Description",
    action: "Action",
    invoiceNo: "Invoice No.",
    subtotal: "Subtotal",
    discount: "Discount",
    tax: "Tax",
    grandTotal: "Grand Total",
    
    // Common statuses and messages
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    completed: "Completed",
    processing: "Processing",
    cancelled: "Cancelled",
    approved: "Approved",
    rejected: "Rejected",
    noDataFound: "No data found",
    confirmDelete: "Are you sure you want to delete?",
    dataUpdated: "Data updated successfully",
    dataSaved: "Data saved successfully",
    dataDeleted: "Data deleted successfully",
    error: "An error occurred",
    selectOption: "Select an option",

    // Dashboard specific translations
    todaysAttendance: "Today's Attendance:",
    present: "Present",
    absent: "Absent",
    recentReceipts: "Recent Receipts",
    receiptId: "Receipt ID",
    noReceiptsYet: "No receipts yet. Start creating receipts!",
    loading: "Loading...",
    
    // Dynamic message templates
    "You have generated {count} receipt(s) so far.": "You have generated {count} receipt(s) so far.",
    "You have {count} employee(s) registered.": "You have {count} employee(s) registered.",

    // New Receipt page translations
    createNewReceipt: "Create New Receipt",
    cashierName: "Cashier Name",
    selectCashier: "Select Cashier",
    enterManually: "Other (Enter Manually)",
    enterCashierName: "Enter cashier name",
    managerName: "Manager Name (Optional)",
    selectManager: "Select Manager",
    selectItem: "Select Item",
    enterManagerName: "Enter manager name",
    paymentMethod: "Payment Method",
    cash: "Cash",
    creditCard: "Credit Card",
    debitCard: "Debit Card",
    bankTransfer: "Bank Transfer",
    mobilePayment: "Mobile Payment",
    transactionId: "Transaction ID",
    barcodeScanner: "Barcode Scanner",
    barcodeScannerHelp: "Scan product barcodes to automatically add items to the receipt. Items with registered barcodes will be added automatically.",
    items: "Items",
    itemName: "Item Name",
    qty: "Qty",
    remove: "Remove",
    addItem: "+ Add Item",
    generateReceipt: "Generate Receipt",
    downloadPDF: "Download PDF",
    viewReceipt: "View Receipt",
    receiptNumber: "Receipt #:",
    time: "Time:",
    cashier: "Cashier:",
    manager: "Manager:",
    payment: "Payment:",
    thankYou: "Thank you for your business!",
    
    // Error and success messages
    receiptCreated: "Receipt created successfully and inventory updated!",
    failedToCreateReceipt: "Failed to create receipt: ",
    scanned: "Scanned: ",
    itemNotFound: "Item with barcode {barcode} not found in inventory",
    scanningError: "Error scanning barcode. Please try again.",
    cashierRequired: "Cashier name is required",
    itemDetailsRequired: "All item details are required",
    invalidPrices: "Item prices must be valid numbers greater than 0",
    invalidQuantities: "Item quantities must be valid numbers greater than 0",
    inventoryError: "Inventory error: ",
    itemNotInInventory: "Item not found in inventory",
    insufficientQuantity: "Insufficient quantity (Available: {available})",
    receiptSaved: "Receipt saved successfully!",
    errorSavingReceipt: "Error saving receipt:",

    // View Receipts (All Receipts) page translations
    allReceipts: "All Receipts",
    searchReceipts: "Search Receipts",
    searchPlaceholder: "Search by ID, cashier, or items...",
    filterByDate: "Filter by Date",
    clear: "Clear",
    loadingReceipts: "Loading receipts...",
    noReceiptsMatch: "No receipts match your search criteria.",
    noReceiptsFound: "No receipts found. Start by creating a new receipt.",
    receiptDate: "Date",
    receiptTransactionId: "Transaction ID",
    receiptCashier: "Cashier",
    receiptItems: "Items",
    totalAmount: "Total Amount",
    receiptPayment: "Payment",
    receiptAction: "Action",
    receiptCreateNew: "Create New Receipt",
    receiptView: "View",

    // Stock inventory page
    addNewItem: "Add New Item",
    searchItems: "Search Items",
    searchItemsPlaceholder: "Search by name, description...",
    filterByCategory: "Filter by Category",
    allCategories: "All Categories",
    loadingStockItems: "Loading stock items...",
    category: "Category",
    lastUpdated: "Last Updated",
    actions: "Actions",
    noItemsMatch: "No items match your search criteria. Try adjusting your filters.",
    noItemsFound: "You haven't added any stock items yet. Click 'Add New Item' to get started.",
    deleteItemConfirmation: "Are you sure you want to delete this item? This action cannot be undone.",

    // Employees page
    name: "Name",
    position: "Position",
    contact: "Contact",
    joiningDate: "Joining Date",
    loadingEmployees: "Loading employees...",
    noEmployeesFound: "No employees found. Add some employees to get started!",
    confirmDeleteEmployee: "Are you sure you want to delete this employee?",
    failedToDeleteEmployee: "Failed to delete employee. Please try again.",

    // Add Employee page
    nameRequired: "Name*",
    positionRequired: "Position*",
    contactRequired: "Contact Number*",
    monthlySalary: "Monthly Salary",
    adding: "Adding...",
    requiredFieldsError: "Name, position, and contact number are required",
    failedToAddEmployee: "Failed to add employee. Please try again.",

    // Settings page
    basicInformation: "Basic Information",
    shopName: "Shop Name",
    enterShopName: "Enter shop name",
    enterShopAddress: "Enter shop address",
    shopLogo: "Shop Logo",
    uploadLogo: "Upload Logo",
    logoUploadHelp: "Upload a logo to display on receipts. Maximum size: 5MB.",
    noLogoUploaded: "No logo uploaded",
    uploading: "Uploading...",
    removeLogo: "Remove Logo",
    logoUploadSuccess: "Logo uploaded successfully",
    logoUploadError: "Failed to upload logo",
    phoneNumbers: "Phone Numbers",
    addNewPhoneNumber: "Add New Phone Number",
    enterPhoneNumber: "Enter phone number",
    staffInformation: "Staff Information",
    cashierNames: "Cashier Names",
    managerNames: "Manager Names",
    phoneNumberExists: "This phone number already exists.",
    cashierNameExists: "This cashier name already exists.",
    managerNameExists: "This manager name already exists.",
    shopNameRequired: "Shop name is required.",
    settingsUpdated: "Settings updated successfully.",
    failedToUpdateSettings: "Failed to update settings: ",
    saving: "Saving...",

    // Attendance page
    attendanceRecordsTitle: "Attendance Records",
    employee: "Employee",
    checkIn: "Check In",
    checkOut: "Check Out",
    notes: "Notes",
    halfDay: "Half Day",
    onLeave: "On Leave",
    allEmployees: "All Employees",
    loadingAttendance: "Loading attendance records...",
    noAttendanceRecords: "No attendance records found for the selected criteria.",
    failedToLoadEmployees: "Failed to load employees. Please try again.",
    failedToLoadAttendance: "Failed to load attendance records. Please try again.",
    unknownEmployee: "Unknown Employee",

    // Mark Attendance page
    selectDate: "Select Date",
    loadingEmployeesData: "Loading employees...",
    submitting: "Submitting...",
    submitAttendance: "Save Attendance",
    optionalNotes: "Add notes",
    attendanceMarkedSuccess: "Attendance marked successfully!",
    failedToSubmitAttendance: "Failed to submit attendance. Please try again.",

    // Sales and Profit Analytics
    salesAnalytics: "Sales Analytics",
    salesAndProfit: "Sales & Profit",
    salesAnalyticsDescription: "View detailed sales and profit analytics on daily, monthly and yearly basis.",
    viewAnalytics: "View Analytics",
    salesAndProfitAnalytics: "Sales and Profit Analytics",
    todaysSummary: "Today's Summary",
    sales: "Sales",
    profit: "Profit",
    transactions: "Transactions",
    profitMargin: "Profit Margin",
    profitBreakdown: "Profit Breakdown",
    costPrice: "Cost Price",
    sellingPrice: "Selling Price",
    loadingSalesData: "Loading sales data...",
    noSalesDataToday: "No sales data available for today.",
    viewDetailedAnalytics: "View Detailed Analytics",
    totalSales: "Total Sales",
    totalProfit: "Total Profit",
    itemsSold: "Items Sold",
    viewMode: "View Mode",
    daily: "Daily",
    monthly: "Monthly",
    yearly: "Yearly",
    selectDaily: "Select Day",
    selectMonthly: "Select Month",
    selectYearly: "Select Year",
    dailyDetails: "Daily Details",
    monthlyDetails: "Monthly Details",
    yearlyDetails: "Yearly Details",
    day: "Day",
    month: "Month",
    dailyViewDescription: "Daily view displays summary data for the selected date. You can switch to monthly or yearly views for more detailed analysis.",
    noDataAvailable: "No data available for this period",
    categoryBreakdown: "Category Breakdown",
    salesDistribution: "Sales Distribution",
    
    // Expense Management
    expenses: "Expenses",
    expenseManagement: "Expense Management",
    expenseManagementDescription: "Track and manage business expenses, categorize spending, and monitor expense trends.",
    viewExpenses: "View Expenses",
    addExpense: "Add Expense",
    editExpense: "Edit Expense",
    expenseCategories: "Expense Categories",
    expenseAmount: "Amount",
    expenseDate: "Date",
    expenseCategory: "Category",
    expenseDescription: "Description",
    paymentMethod: "Payment Method",
    notes: "Notes",
    expenseStatistics: "Expense Statistics",
    totalExpenses: "Total Expenses",
    currentMonthExpenses: "Current Month",
    allTimeExpenses: "All Time",
    averageMonthlyExpenses: "Average Monthly",
    filteredTotalExpenses: "Filtered Total",
    searchExpenses: "Search Expenses",
    searchExpensesPlaceholder: "Search by description, category...",
    filterByCategory: "Filter by Category",
    allCategories: "All Categories",
    filterByDateRange: "Filter by Date Range",
    startDate: "Start Date",
    endDate: "End Date",
    applyFilter: "Apply Filter",
    resetFilter: "Reset Filter",
    loadingExpenses: "Loading expenses...",
    noExpensesMatch: "No expenses match your search criteria.",
    noExpensesFound: "No expenses found. Add your first expense to get started.",
    confirmDeleteExpense: "Are you sure you want to delete this expense? This action cannot be undone.",
    expenseDeleted: "Expense deleted successfully.",
    failedToDeleteExpense: "Failed to delete expense. Please try again.",
    addNewExpense: "Add New Expense",
    updateExpense: "Update Expense",
    expenseAdded: "Expense added successfully.",
    expenseUpdated: "Expense updated successfully.",
    failedToAddExpense: "Failed to add expense. Please try again.",
    failedToUpdateExpense: "Failed to update expense. Please try again.",
    backToExpenses: "Back to Expenses",
    
    // Expense Categories
    addCategory: "Add Category",
    addNewCategory: "Add New Category",
    categoryName: "Category Name",
    editCategory: "Edit Category",
    updateCategory: "Update Category",
    saveCategory: "Save Category",
    categoriesList: "Categories List",
    noCategoriesYet: "No categories yet. Add your first category!",
    confirmDeleteCategoryMessage: "Are you sure you want to delete this category? This action cannot be undone.",
  },
  ur: {
    // Navbar
    dashboard: "ڈیش بورڈ",
    newReceipt: "نئی رسید",
    receipts: "رسیدیں",
    inventory: "انوینٹری",
    employees: "ملازمین",
    viewEmployees: "ملازمین دیکھیں",
    addEmployee: "ملازم شامل کریں",
    attendance: "حاضری",
    viewAttendance: "حاضری دیکھیں",
    markAttendance: "حاضری لگائیں",
    attendanceReport: "حاضری رپورٹ",
    expenses: "اخراجات",
    viewExpenses: "اخراجات دیکھیں",
    addExpense: "اخراجات شامل کریں",
    expenseCategories: "اخراجات کی اقسام",
    settings: "ترتیبات",
    logout: "لاگ آؤٹ",
    login: "لاگ ان",
    register: "رجسٹر",
    
    // Common buttons
    save: "محفوظ کریں",
    cancel: "منسوخ کریں",
    edit: "ترمیم کریں",
    delete: "حذف کریں",
    add: "شامل کریں",
    view: "دیکھیں",
    back: "واپس",
    submit: "جمع کرائیں",
    returnProducts: "پروڈکٹس واپس کریں",
    
    // Additional menu items
    stockInventory: "اسٹاک انوینٹری",
    addNewEmployee: "نیا ملازم شامل کریں",
    attendanceRecordsMenu: "حاضری ریکارڈز",
    shopSettings: "دکان کی ترتیبات",
    expenseManagement: "اخراجات کا انتظام",
    expenseManagementDescription: "کاروباری اخراجات کو ٹریک کریں اور ان کا انتظام کریں، اخراجات کی درجہ بندی کریں، اور اخراجات کے رجحانات کی نگرانی کریں۔",
    
    // Expense Management
    editExpense: "اخراجات میں ترمیم کریں",
    expenseAmount: "رقم",
    expenseDate: "تاریخ",
    expenseCategory: "قسم",
    expenseDescription: "تفصیل",
    paymentMethod: "ادائیگی کا طریقہ",
    notes: "نوٹس",
    expenseStatistics: "اخراجات کے اعداد و شمار",
    totalExpenses: "کل اخراجات",
    currentMonthExpenses: "موجودہ مہینہ",
    allTimeExpenses: "تمام وقت",
    averageMonthlyExpenses: "اوسط ماہانہ",
    filteredTotalExpenses: "فلٹر شدہ کل",
    searchExpenses: "اخراجات تلاش کریں",
    searchExpensesPlaceholder: "تفصیل، قسم سے تلاش کریں...",
    filterByCategory: "قسم سے فلٹر کریں",
    allCategories: "تمام اقسام",
    filterByDateRange: "تاریخ کی حد سے فلٹر کریں",
    startDate: "شروع کی تاریخ",
    endDate: "آخری تاریخ",
    applyFilter: "فلٹر لاگو کریں",
    resetFilter: "فلٹر ری سیٹ کریں",
    loadingExpenses: "اخراجات لوڈ ہو رہے ہیں...",
    noExpensesMatch: "آپ کے تلاش کے معیار سے کوئی اخراجات مطابقت نہیں رکھتے۔",
    noExpensesFound: "کوئی اخراجات نہیں ملے۔ شروع کرنے کے لیے اپنا پہلا خرچہ شامل کریں۔",
    confirmDeleteExpense: "کیا آپ واقعی اس خرچے کو حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں کیا جا سکتا۔",
    expenseDeleted: "خرچہ کامیابی سے حذف کر دیا گیا۔",
    failedToDeleteExpense: "خرچہ حذف کرنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں۔",
    addNewExpense: "نیا خرچہ شامل کریں",
    updateExpense: "خرچہ اپ ڈیٹ کریں",
    expenseAdded: "خرچہ کامیابی سے شامل کر دیا گیا۔",
    expenseUpdated: "خرچہ کامیابی سے اپ ڈیٹ کر دیا گیا۔",
    failedToAddExpense: "خرچہ شامل کرنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں۔",
    failedToUpdateExpense: "خرچہ اپ ڈیٹ کرنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں۔",
    backToExpenses: "اخراجات پر واپس جائیں",
    
    // Expense Categories
    addCategory: "قسم شامل کریں",
    addNewCategory: "نئی قسم شامل کریں",
    categoryName: "قسم کا نام",
    editCategory: "قسم میں ترمیم کریں",
    updateCategory: "قسم اپ ڈیٹ کریں",
    saveCategory: "قسم محفوظ کریں",
    categoriesList: "اقسام کی فہرست",
    noCategoriesYet: "ابھی تک کوئی اقسام نہیں۔ اپنی پہلی قسم شامل کریں!",
    confirmDeleteCategoryMessage: "کیا آپ واقعی اس قسم کو حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں کیا جا سکتا۔",
    
    // Language toggle
    switchToUrdu: "اردو",
    switchToEnglish: "English",
    
    // Admin Panel
    adminPanel: "ایڈمن پینل",
    pendingApprovals: "زیر التواء منظوریاں",
    manageUsers: "صارفین کا انتظام کریں",
    menu: "مینو"
  }
};

// Helper function to translate data fields
export const translateData = (data, language) => {
  if (!data) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => translateData(item, language));
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const translatedData = {};
    for (const key in data) {
      if (key === 'status' && translations[language][data[key]]) {
        // Translate status values directly
        translatedData[key] = translations[language][data[key]];
      } else if (key === 'message' && translations[language][data[key]]) {
        // Handle message templates
        translatedData[key] = translations[language][data[key]];
      } else {
        // Recursively translate nested objects
        translatedData[key] = translateData(data[key], language);
      }
    }
    return translatedData;
  }
  
  // Handle strings that might need translation
  if (typeof data === 'string') {
    // Try to translate common terms
    return translations[language][data] || data;
  }
  
  // Return as is for numbers, booleans, etc.
  return data;
};

// Helper function to get translated text for a given key
export const getTranslatedText = (key, language) => {
  return translations[language]?.[key] || key;
};

export default translations;