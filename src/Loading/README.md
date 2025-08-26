# Loading Components Usage Guide

This directory contains beautiful and responsive loading components for the HurryUp Express application.

## Components Overview

### 1. Loading.jsx - Main Loading Component

The primary loading component with multiple variants and full-screen support.

#### Basic Usage

```jsx
import Loading from './Loading/Loading';

// Default loading
<Loading />

// With custom message
<Loading message="Fetching your parcels..." />

// Different types
<Loading type="truck" message="Delivering your request..." />
<Loading type="package" message="Processing package..." />
<Loading type="spinner" message="Please wait..." />

// Different sizes
<Loading size="small" />
<Loading size="default" />
<Loading size="large" />

// Full screen loading
<Loading fullScreen={true} message="Loading HurryUp Express..." />
```

### 2. LoadingSpinner.jsx - Lightweight Spinner

A lightweight, reusable spinner component for inline loading states.

#### Basic Usage

```jsx
import LoadingSpinner from './Loading/LoadingSpinner';

// Default spinner
<LoadingSpinner />

// Different types
<LoadingSpinner type="truck" />
<LoadingSpinner type="package" />
<LoadingSpinner type="dots" />
<LoadingSpinner type="pulse" />

// Different sizes
<LoadingSpinner size="xs" />
<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />
<LoadingSpinner size="xl" />

// Different colors
<LoadingSpinner color="blue" />
<LoadingSpinner color="purple" />
<LoadingSpinner color="green" />
<LoadingSpinner color="gradient" />

// In buttons
<button className="btn">
  <LoadingSpinner size="sm" color="white" />
  Loading...
</button>
```

### 3. PageLoader.jsx - Full Page Loading

A comprehensive full-page loading experience with branding and animations.

#### Basic Usage

```jsx
import PageLoader from './Loading/PageLoader';

// Default page loader
<PageLoader />

// With custom message
<PageLoader message="Setting up your dashboard..." />

// Without progress bar
<PageLoader showProgress={false} />

// Dark theme
<PageLoader theme="dark" />

// Light theme
<PageLoader theme="light" />
```

## Usage Examples in Different Scenarios

### 1. Route Loading (in Router components)

```jsx
// In AgentRoute.jsx, CustomerRoute.jsx, etc.
import Loading from "../Loading/Loading";

if (loading || !userData)
  return <Loading fullScreen={true} message="Verifying access..." />;
```

### 2. Dashboard Loading

```jsx
// In Dashboard components
import PageLoader from "../Loading/PageLoader";

if (loading) {
  return <PageLoader message="Loading your dashboard..." />;
}
```

### 3. Button Loading States

```jsx
// In forms and buttons
import LoadingSpinner from "../Loading/LoadingSpinner";

<button disabled={isLoading} className="btn btn-primary">
  {isLoading ? (
    <>
      <LoadingSpinner size="sm" type="spinner" />
      Processing...
    </>
  ) : (
    "Submit"
  )}
</button>;
```

### 4. Data Fetching Loading

```jsx
// In data components
import Loading from "../Loading/Loading";

if (loading) {
  return <Loading type="package" message="Fetching your parcels..." />;
}
```

### 5. Image Loading

```jsx
// For image loading states
import LoadingSpinner from "../Loading/LoadingSpinner";

{
  imageLoading && (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <LoadingSpinner type="pulse" color="blue" />
    </div>
  );
}
```

## Component Props

### Loading Component Props

| Prop       | Type    | Default      | Description                                              |
| ---------- | ------- | ------------ | -------------------------------------------------------- |
| size       | string  | "default"    | Size variant: "small", "default", "large"                |
| message    | string  | "Loading..." | Loading message to display                               |
| type       | string  | "default"    | Animation type: "default", "truck", "package", "spinner" |
| fullScreen | boolean | false        | Whether to show as full-screen overlay                   |

### LoadingSpinner Component Props

| Prop      | Type   | Default   | Description                                                 |
| --------- | ------ | --------- | ----------------------------------------------------------- |
| size      | string | "md"      | Size: "xs", "sm", "md", "lg", "xl"                          |
| color     | string | "blue"    | Color: "blue", "purple", "green", "red", "gray", "gradient" |
| type      | string | "spinner" | Type: "spinner", "truck", "package", "dots", "pulse"        |
| className | string | ""        | Additional CSS classes                                      |

### PageLoader Component Props

| Prop         | Type    | Default                              | Description                  |
| ------------ | ------- | ------------------------------------ | ---------------------------- |
| message      | string  | "Loading your delivery dashboard..." | Loading message              |
| showProgress | boolean | true                                 | Whether to show progress bar |
| theme        | string  | "light"                              | Theme: "light" or "dark"     |

## Styling and Customization

All components use Tailwind CSS classes and support dark mode automatically. They follow the app's design system with:

- **Colors**: Blue to purple gradient theme
- **Animations**: Smooth Framer Motion animations
- **Responsive**: Mobile-first responsive design
- **Accessibility**: Proper ARIA labels and semantic HTML

## Best Practices

1. **Use appropriate loading types**:

   - `truck` for delivery-related actions
   - `package` for parcel operations
   - `spinner` for general loading
   - `default` for multi-step processes

2. **Choose the right component**:

   - `Loading` for main content areas
   - `LoadingSpinner` for buttons and inline elements
   - `PageLoader` for initial app loading or major transitions

3. **Provide meaningful messages**: Always include descriptive loading messages for better UX

4. **Consider performance**: Use lighter components (`LoadingSpinner`) for frequently rendered elements

5. **Maintain consistency**: Use the same loading patterns throughout the application
