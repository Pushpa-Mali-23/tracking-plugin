Include the plugin in your frontend application as below
```html
<script src="https://pushpa-mali-23.github.io/tracking-plugin/tracking-plugin.min.js"></script>
```
## Exposed Functions

The plugin exposes a global object called `TrackingPlugin` with the following methods:

### 1. `setWidgetId(widgetId)`
***Immediately set the widgetId after the plugin loads***

**Sets the widget ID.**

**Parameters**:
- `widgetId` (string).

**Usage**:

```javascript
window.TrackingPlugin.setWidgetId('your-widget-id');
```

### 2. `setUserId(userId)`

**Description**: to set the user ID after user logs in

**Parameters**:
- `userId` (string | number): The ID of the user to be associated with the session.

**Usage**:

```javascript
window.TrackingPlugin.setUserId('12345');
```


### 3. `trackCustomActivity(activityType, typeId, additionalData)`

**Description**: Tracks a custom activity performed by the user. Activities are sent via WebSocket to the server.

**Parameters**:
- `activityType` (string): The type of id whose activity is being tracked (e.g., 'product_id').
- `typeId` (string | number): An ID related to the activity type.
- `additionalData` (object): An object containing additional data related to the activity.

**Usage**:

```javascript
window.TrackingPlugin.trackCustomActivity('product_id', '10',  {
        product_name: 'Diamond Ring',
        price: 299.99
      });
```
