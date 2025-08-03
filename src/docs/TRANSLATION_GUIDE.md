# Translation Guide for Golden Oil Billing System

This guide explains how to use the translation system to support both English and Urdu languages for UI elements and dynamic data.

## Basic UI Translation

For static UI elements like buttons, labels, and headers:

```jsx
import { Translate } from '../utils';

// Example usage
<button><Translate textKey="save" /></button>
<h1><Translate textKey="dashboard" /></h1>
```

## Dynamic Data Translation

For dynamic data coming from APIs, databases, or user input:

```jsx
import { TranslateData, useTranslatedData } from '../utils';

// Option 1: Component-based approach
<TranslateData data={product.status} />

// Option 2: Render prop pattern
<TranslateData data={product}>
  {(translatedProduct) => (
    <div>
      <h3>{translatedProduct.name}</h3>
      <p>{translatedProduct.description}</p>
    </div>
  )}
</TranslateData>

// Option 3: Hook-based approach for complete objects
function ProductDetails({ product }) {
  const translatedProduct = useTranslatedData(product);
  
  return (
    <div>
      <h3>{translatedProduct.name}</h3>
      <p>{translatedProduct.description}</p>
    </div>
  );
}
```

## Adding New Translations

To add new translations:

1. Open `src/utils/translations.js`
2. Add your new key-value pairs in both the `en` and `ur` objects:

```js
const translations = {
  en: {
    // Add your English translations here
    myNewKey: "My new text in English"
  },
  ur: {
    // Add your Urdu translations here
    myNewKey: "میرا نیا متن اردو میں"
  }
};
```

## Translating Large Data Sets

For large data sets like tables:

```jsx
import { DataTable } from '../components';

// Define columns with translatable keys
const columns = [
  { key: 'productName', label: 'Product Name' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'price', label: 'Price' }
];

// Your data
const products = [
  { id: 1, productName: 'Oil', quantity: 5, price: 100 }
];

// The component handles translation
<DataTable columns={columns} data={products} />
```

## RTL Support for Urdu

The app automatically applies RTL (right-to-left) styling when Urdu is selected. Custom RTL styles can be added in `src/App.css` under the `.rtl` class.

## Best Practices

1. **Never hardcode text strings** - Always use the translation system
2. **Keep translations organized** - Group related translations together 
3. **Use fallbacks** - Provide fallback text when a translation key might not exist
4. **Test both languages** - Always test your UI in both English and Urdu

## System Architecture

- `LanguageContext.js` - Manages the current language state
- `translations.js` - Contains all translation strings and helper functions
- `Translate.js` - Component for UI element translation
- `TranslateData.js` - Component for dynamic data translation
- `useTranslatedData.js` - Hook for translating data in functional components 