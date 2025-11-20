# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Runtime Configuration and Env Vars

The frontend reads the following environment variables (Create React App requires the `REACT_APP_` prefix):

- REACT_APP_API_BASE (optional)
- REACT_APP_BACKEND_URL (optional)
  - The Backend API base URL. The app picks the first non-empty of `REACT_APP_API_BASE`, `REACT_APP_BACKEND_URL`, otherwise defaults to `window.location.origin`.
- REACT_APP_RECOMMENDER_URL (optional)
  - LLM Recommendation service base URL (defaults to `http://localhost:8081`).
- REACT_APP_WS_URL (optional)
  - WebSocket base URL if used.

At startup, the app logs the resolved endpoints to the browser console:
- resolvedApiBase
- resolvedRecommenderBase
- resolvedWsBase
- plus the raw env values for quick diagnostics.

### Mock Mode

Mock mode is disabled by default. To enable mock data explicitly for local UI work, set:
- `REACT_APP_MOCK_MODE=true`

When enabled, certain endpoints return deterministic mock payloads. When disabled, the app always calls the backend and surfaces errors in the UI.

At startup, the console logs the active base URLs:
- `[API] Active base URLs { backend, recommender, mockMode }`
- `[RuntimeConfig] Resolved API endpoints: { ... }`

To enable live data, set:
- `REACT_APP_BACKEND_URL=http://localhost:8000` (or your URL)
- (Optional) `REACT_APP_API_BASE=...` to override

If you hit CORS errors, ensure the backend allows `http://localhost:3000` in its allowed origins.

## Customization

### Colors

The main brand colors are defined as CSS variables in `src/App.css`:

```css
:root {
  --kavia-orange: #E87A41;
  --kavia-dark: #1A1A1A;
  --text-color: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
}
```

### Components

This template uses pure HTML/CSS components instead of a UI framework. You can find component styles in `src/App.css`. 

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Milestone 2 Additions

- New route: `/gap-analysis` — Combined page to select roles and view strengths/gaps with inline expandable recommendation placeholders. This uses the existing API client (api.js) which gracefully falls back to mock data when the backend is unreachable.
- New components:
  - `src/components/GapAnalysisView.js` — renders strengths and gaps in two columns and expandable per-gap recommendation placeholders.
  - `src/pages/GapAnalysisPage.js` — composes `RoleSelector` with `GapAnalysisView` and integrates the `postGapAnalysis` API call.
