# Dashboard Translation Guide

This guide focuses specifically on translating dashboard data in the Golden Oil Billing System.

## Overview

The dashboard displays various types of data:
1. Static UI text (headings, button labels)
2. Dynamic data (counts, statuses)
3. Table data (recent receipts)
4. Message templates with placeholders

All of these need to be properly translated when the user selects Urdu language.

## Implementing Dashboard Translation

### Static UI Elements

For static text elements like headings, labels, and buttons:

```jsx
<h2><Translate textKey="dashboard" /></h2>
<Button><Translate textKey="view" /></Button>
```

### Dynamic Data & Counts

For dynamic data like counts and statistics:

```jsx
// Using the hook approach
const translatedShopData = useTranslatedData(shopData);
<h3>{translatedShopData.shopName}</h3>

// Or using the component approach
<TranslateData data={todayAttendance.present} />
```

### Message Templates with Placeholders

For messages that include dynamic values:

```jsx
<TranslateData 
  data={{
    message: "You have generated {count} receipt(s) so far.",
    count: receiptCount
  }}
>
  {(data) => (
    <>{data.message.replace('{count}', data.count)}</>
  )}
</TranslateData>
```

### Table Data

For table data like the recent receipts table:

```jsx
// Translate the array of receipts
const translatedReceipts = useTranslatedData(recentReceipts);

// Use translated data in the table
{translatedReceipts.map(receipt => (
  <tr key={receipt.id}>
    <td>{new Date(receipt.timestamp).toLocaleDateString()}</td>
    <td>{receipt.id.substring(0, 8)}</td>
    <td>RS{receipt.totalAmount}</td>
    <td>
      <Button><Translate textKey="view" /></Button>
    </td>
  </tr>
))}
```