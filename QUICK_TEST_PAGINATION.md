# 🧪 Quick Test Guide - Pagination & Search

## ⚡ 5-Minute Test

### Test 1: Basic Pagination (1 min)

1. Go to **Releasing → Orders**
2. Check bottom of table shows: "Showing 1 – 15 of X orders"
3. Click page **2**
4. Verify URL changes to include `?for_release_page=2`
5. Check now shows: "Showing 16 – 30 of X orders"

✅ **Expected:** Only 15 orders per page, fast load

---

### Test 2: Search (1 min)

1. Type in search box: Order number (e.g., "ORD-001")
2. Wait 300ms
3. Verify results filter to matching orders only
4. Clear search
5. Verify all orders return

✅ **Expected:** Search filters instantly, all fields searchable

---

### Test 3: Sorting (1 min)

1. Click **"Order #"** column header
2. Verify orders sort alphabetically (ascending)
3. Click again
4. Verify sorts reverse (descending)
5. Try **"Total"** column
6. Verify sorts by amount

✅ **Expected:** Sorting works, visual indicator shows

---

### Test 4: Tabs (1 min)

1. Switch to **"Completed"** tab
2. Verify separate pagination
3. Search for something
4. Switch back to **"For Release"** tab
5. Verify independent state

✅ **Expected:** Each tab maintains separate state

---

### Test 5: Real-Time (1 min)

1. Open **two browser windows**
    - Window 1: Releasing Orders (releasing role)
    - Window 2: Cashier POS (cashier role)
2. In Window 2: Move order to "For Release"
3. In Window 1: Check order appears automatically

✅ **Expected:** Real-time updates work with pagination

---

## 🚀 Quick Functional Test

### Search Test Cases

```
Test 1: Order Number
Search: "ORD-001"
Expected: Shows only that order

Test 2: Member Name
Search: "John"
Expected: Shows all orders for members named John

Test 3: Product Name
Search: "Product A"
Expected: Shows orders containing Product A

Test 4: Empty Search
Search: ""
Expected: Shows all orders
```

### Sort Test Cases

```
Column: Order #
Click 1: Ascending (A → Z)
Click 2: Descending (Z → A)

Column: Total
Click 1: Ascending (Low → High)
Click 2: Descending (High → Low)

Column: Member
Click 1: Ascending (A → Z by first name)
Click 2: Descending (Z → A by first name)
```

### Pagination Test Cases

```
Initial Load:
- Page 1 active
- Shows "Showing 1 – 15 of X"
- Previous button disabled

Click Page 2:
- Page 2 active
- Shows "Showing 16 – 30 of X"
- Previous button enabled
- URL: ?for_release_page=2

Click "Next":
- Goes to next page
- Updates count
- URL updates
```

---

## 🎯 Performance Check

### With 1000+ Orders

1. Navigate to Releasing Orders page
2. Check Chrome DevTools → Network
3. Verify:
    - ✅ Load time: < 2 seconds
    - ✅ Network transfer: ~50 KB
    - ✅ Only 15 orders in response

### Memory Usage

1. Open Chrome DevTools → Memory
2. Take snapshot
3. Navigate Releasing Orders
4. Take another snapshot
5. Verify:
    - ✅ Memory increase: < 5 MB
    - ✅ No memory leaks

---

## ❌ Common Issues & Fixes

### Issue 1: Pagination Not Working

**Symptom:** All orders load at once
**Check:**

- Backend returning `Paginated<Order>` not `Order[]`?
- Frontend reading `paginatedOrders.data`?

### Issue 2: Search Not Working

**Symptom:** Search doesn't filter
**Check:**

- Network tab shows search parameter?
- Backend applying search to query?
- Debounce working (300ms delay)?

### Issue 3: Real-Time Breaks

**Symptom:** Orders don't update automatically
**Check:**

- `useRealtimeOrders` hook still active?
- Props names match: `for_release_orders`, `completed_orders`?
- Reverb server running?

### Issue 4: Sort Indicator Wrong

**Symptom:** Arrow shows on wrong column
**Check:**

- `filters.sort` matches column field name?
- URL parameter `sort` correct?

---

## 📊 Quick Metrics

If everything works:

- ⚡ Page load: **< 1 second** (with 5000+ orders)
- 🔍 Search response: **< 300ms**
- 🔄 Sort action: **< 200ms**
- 📄 Pagination: **< 200ms**
- 📡 Real-time update: **< 1 second**

---

## ✅ Ready Checklist

Before marking as complete, verify:

- [ ] Pagination shows 15 orders per page
- [ ] Search box filters all fields
- [ ] Column sorting works (all columns)
- [ ] Tabs maintain separate state
- [ ] Real-time updates still work
- [ ] URL updates with filters
- [ ] Back/Forward buttons work
- [ ] No console errors
- [ ] Mobile responsive

---

## 🎉 Success Criteria

**All Tests Pass?** ✅ READY FOR PRODUCTION!

**Any Issues?** Check `RELEASING_PAGINATION_IMPLEMENTATION.md` for detailed troubleshooting.
