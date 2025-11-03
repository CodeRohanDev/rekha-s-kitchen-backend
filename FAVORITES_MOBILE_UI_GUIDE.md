# Favorites Feature - Mobile UI Implementation Guide

## Screen Designs & User Flows

### 1. Menu Item Card - Favorite Toggle

```
┌─────────────────────────────────────┐
│  ┌─────────┐                    ❤️  │  ← Heart icon (tap to toggle)
│  │         │  Paneer Butter Masala  │
│  │  Image  │  Rich and creamy...    │
│  │         │  ₹250                   │
│  └─────────┘  [Add to Cart]         │
└─────────────────────────────────────┘
```

**States:**
- ❤️ (filled red) = In favorites
- 🤍 (outline) = Not in favorites
- Loading spinner during API call

**Interaction:**
1. User taps heart icon
2. Icon changes immediately (optimistic update)
3. API call in background
4. If API fails, revert icon and show error toast

---

### 2. Favorites Screen Layout

```
┌─────────────────────────────────────┐
│  ← My Favorites        Clear All    │  ← Header
├─────────────────────────────────────┤
│  🔍 Search favorites...              │  ← Search bar (optional)
│  [All] [Outlet 1] [Outlet 2]        │  ← Filter chips
├─────────────────────────────────────┤
│  ┌─────────┐                    ❤️  │
│  │         │  Item 1                │
│  │  Image  │  ₹250  [Add to Cart]   │
│  └─────────┘                        │
│  ┌─────────┐                    ❤️  │
│  │         │  Item 2                │
│  │  Image  │  ₹300  [Add to Cart]   │
│  └─────────┘                        │
│  ┌─────────┐                    ❤️  │
│  │         │  Item 3                │
│  │  Image  │  ₹200  [Add to Cart]   │
│  └─────────┘                        │
└─────────────────────────────────────┘
```

---

### 3. Empty State

```
┌─────────────────────────────────────┐
│  ← My Favorites                     │
├─────────────────────────────────────┤
│                                     │
│           🤍                        │
│                                     │
│      No favorites yet               │
│                                     │
│   Start adding items you love       │
│   to see them here                  │
│                                     │
│      [Browse Menu]                  │
│                                     │
└─────────────────────────────────────┘
```

---

### 4. Bottom Navigation with Badge

```
┌─────────────────────────────────────┐
│  [🏠 Home] [🍽️ Menu] [❤️ Favorites] │
│                         (5)          │  ← Badge showing count
│  [🛒 Cart] [👤 Profile]             │
└─────────────────────────────────────┘
```

---

## User Flows

### Flow 1: Add Item to Favorites

```
Menu Screen
    │
    ├─ User taps empty heart icon
    │
    ├─ Icon fills with red (optimistic)
    │
    ├─ API: POST /api/v1/favorites
    │   └─ Body: { "item_id": "..." }
    │
    ├─ Success?
    │   ├─ Yes: Keep filled heart
    │   │       Show toast: "Added to favorites"
    │   │       Update badge count
    │   │
    │   └─ No:  Revert to empty heart
    │           Show toast: "Failed to add"
    │
    └─ Continue browsing
```

### Flow 2: View Favorites

```
Tap Favorites Tab
    │
    ├─ Show loading skeleton
    │
    ├─ API: GET /api/v1/favorites?page=1&limit=20
    │
    ├─ Success?
    │   ├─ Yes: Display items
    │   │       Show pagination if needed
    │   │
    │   └─ No:  Show error state
    │           [Retry] button
    │
    └─ User can:
        ├─ Tap item → Go to details
        ├─ Tap heart → Remove from favorites
        ├─ Tap "Add to Cart" → Add to cart
        ├─ Pull to refresh → Reload
        └─ Filter by outlet/category
```

### Flow 3: Remove from Favorites

```
Favorites Screen
    │
    ├─ User taps filled heart icon
    │
    ├─ Icon empties (optimistic)
    │   Item fades out
    │
    ├─ API: DELETE /api/v1/favorites/:item_id
    │
    ├─ Success?
    │   ├─ Yes: Remove item from list
    │   │       Show toast: "Removed from favorites"
    │   │       Update badge count
    │   │       If last item, show empty state
    │   │
    │   └─ No:  Revert icon to filled
    │           Item fades back in
    │           Show toast: "Failed to remove"
    │
    └─ Continue browsing
```

### Flow 4: Clear All Favorites

```
Favorites Screen
    │
    ├─ User taps "Clear All" button
    │
    ├─ Show confirmation dialog:
    │   "Clear All Favorites?"
    │   "Are you sure you want to remove
    │    all items from your favorites?"
    │   [Cancel] [Clear All]
    │
    ├─ User confirms?
    │   ├─ No:  Close dialog
    │   │
    │   └─ Yes: Show loading
    │           API: DELETE /api/v1/favorites
    │           
    │           Success?
    │           ├─ Yes: Show empty state
    │           │       Show toast: "X favorites cleared"
    │           │       Update badge to 0
    │           │
    │           └─ No:  Show error toast
    │                   Keep items displayed
    │
    └─ Done
```

---

## Component Specifications

### 1. FavoriteButton Component

**Props:**
- `itemId` (string, required)
- `initialState` (boolean, optional)
- `onToggle` (function, optional)
- `size` (small/medium/large, default: medium)

**State:**
- `isFavorite` (boolean)
- `isLoading` (boolean)

**Behavior:**
```javascript
const FavoriteButton = ({ itemId, initialState = false, onToggle, size = 'medium' }) => {
  const [isFavorite, setIsFavorite] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    // Optimistic update
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);
    setIsLoading(true);

    try {
      if (!isFavorite) {
        // Add to favorites
        await addToFavorites(itemId);
        showToast('Added to favorites');
      } else {
        // Remove from favorites
        await removeFromFavorites(itemId);
        showToast('Removed from favorites');
      }
      
      // Update badge count
      updateFavoritesCount();
      
      // Callback
      if (onToggle) onToggle(!isFavorite);
      
    } catch (error) {
      // Revert on error
      setIsFavorite(previousState);
      showToast('Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleToggle} disabled={isLoading}>
      {isLoading ? (
        <ActivityIndicator size={size} />
      ) : (
        <Icon 
          name={isFavorite ? 'heart' : 'heart-outline'} 
          color={isFavorite ? '#FF0000' : '#999999'}
          size={size === 'small' ? 20 : size === 'large' ? 32 : 24}
        />
      )}
    </TouchableOpacity>
  );
};
```

---

### 2. FavoritesScreen Component

**Features:**
- Pull-to-refresh
- Infinite scroll / pagination
- Filter chips
- Empty state
- Loading skeleton
- Error state with retry

**Layout Sections:**
1. Header (title + clear all button)
2. Search bar (optional)
3. Filter chips (outlets, categories)
4. Items list/grid
5. Loading indicator
6. Empty state

---

### 3. FavoriteItemCard Component

**Props:**
- `item` (object with all item details)
- `onRemove` (function)
- `onAddToCart` (function)

**Display:**
- Item image
- Item name
- Description (truncated)
- Price
- Outlet name
- Availability status
- Heart icon (remove button)
- Add to cart button

---

## Animations

### 1. Heart Icon Animation
```
Tap → Scale up (1.0 → 1.3) → Scale down (1.3 → 1.0)
Duration: 300ms
Easing: ease-out
```

### 2. Item Removal Animation
```
Tap heart → Fade out (opacity 1 → 0)
           → Slide left (translateX 0 → -100%)
           → Collapse height (height → 0)
Duration: 400ms
Easing: ease-in-out
```

### 3. Add to Favorites Animation
```
Success → Heart fills with red
        → Pulse effect (scale 1.0 → 1.2 → 1.0)
        → Confetti particles (optional)
Duration: 500ms
```

---

## Loading States

### 1. Skeleton Screen (Favorites List)
```
┌─────────────────────────────────────┐
│  ┌─────────┐  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  │░░░░░░░░░│  ▓▓▓▓▓▓▓▓▓▓▓▓        │
│  │░░░░░░░░░│  ▓▓▓▓▓▓                │
│  └─────────┘                        │
│  ┌─────────┐  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  │░░░░░░░░░│  ▓▓▓▓▓▓▓▓▓▓▓▓        │
│  │░░░░░░░░░│  ▓▓▓▓▓▓                │
│  └─────────┘                        │
└─────────────────────────────────────┘
```

### 2. Button Loading State
```
[Add to Cart] → [⟳ Adding...] → [✓ Added]
```

---

## Error States

### 1. Network Error
```
┌─────────────────────────────────────┐
│           ⚠️                        │
│                                     │
│    Couldn't load favorites          │
│                                     │
│    Check your internet connection   │
│                                     │
│         [Retry]                     │
└─────────────────────────────────────┘
```

### 2. Server Error
```
Toast message: "Something went wrong. Please try again."
Duration: 3 seconds
Position: Bottom
```

---

## Accessibility

### 1. Screen Reader Labels
- Heart icon: "Add to favorites" / "Remove from favorites"
- Clear all button: "Clear all favorites"
- Item card: "Item name, Price, Outlet name, Add to cart"

### 2. Touch Targets
- Minimum size: 44x44 points
- Heart icon: 48x48 points
- Buttons: 44+ points height

### 3. Color Contrast
- Ensure text has sufficient contrast
- Don't rely on color alone (use icons + text)

---

## Performance Optimization

### 1. Image Loading
- Use lazy loading for item images
- Show placeholder while loading
- Cache images locally

### 2. List Optimization
- Use FlatList with `windowSize` prop
- Implement `getItemLayout` for fixed heights
- Use `keyExtractor` properly

### 3. API Calls
- Debounce search input (300ms)
- Cache favorite status locally
- Batch API calls when possible
- Use pagination (20 items per page)

### 4. State Management
- Cache favorites list
- Sync on app launch
- Update cache on changes
- Clear cache on logout

---

## Testing Checklist

### Functional Testing
- [ ] Add item to favorites
- [ ] Remove item from favorites
- [ ] View all favorites
- [ ] Filter by outlet
- [ ] Filter by category
- [ ] Search favorites
- [ ] Clear all favorites
- [ ] Add to cart from favorites
- [ ] Navigate to item details
- [ ] Pull to refresh
- [ ] Pagination/infinite scroll

### UI Testing
- [ ] Heart icon toggles correctly
- [ ] Badge updates on changes
- [ ] Empty state displays
- [ ] Loading states show
- [ ] Error states display
- [ ] Animations work smoothly
- [ ] Responsive on all screen sizes

### Edge Cases
- [ ] No internet connection
- [ ] Server error
- [ ] Item deleted from menu
- [ ] Rapid tapping heart icon
- [ ] Large number of favorites (100+)
- [ ] Empty favorites list
- [ ] Single favorite item

### Performance
- [ ] Smooth scrolling
- [ ] Fast image loading
- [ ] No memory leaks
- [ ] Efficient re-renders

---

## Platform-Specific Considerations

### iOS
- Use SF Symbols for heart icon
- Follow iOS Human Interface Guidelines
- Use native haptic feedback on toggle
- Swipe to delete gesture (optional)

### Android
- Use Material Design icons
- Follow Material Design guidelines
- Use ripple effect on buttons
- Long press for options (optional)

---

## Analytics Events to Track

1. `favorite_added` - When user adds item
   - Properties: item_id, item_name, outlet_id
   
2. `favorite_removed` - When user removes item
   - Properties: item_id, item_name, source (favorites_screen/menu_screen)
   
3. `favorites_viewed` - When user opens favorites screen
   - Properties: favorites_count
   
4. `favorites_cleared` - When user clears all
   - Properties: items_cleared
   
5. `favorite_item_ordered` - When user orders from favorites
   - Properties: item_id, item_name

---

## Resources

- **API Documentation**: MOBILE_FAVORITES_API_DOCS.md
- **Quick Reference**: FAVORITES_QUICK_REFERENCE.md
- **Feature Summary**: FAVORITES_FEATURE_SUMMARY.md
- **Design Assets**: [Link to Figma/Design files]
- **Icons**: Use heart/heart-outline from icon library

---

**Ready to implement?** Start with the FavoriteButton component and test it on the menu screen first!
