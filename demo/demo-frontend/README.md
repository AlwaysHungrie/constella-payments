# AlwaysHungrie - Artist Website

A clean, elegant website for contemporary artist AlwaysHungrie featuring a single painting for sale.

## Features

- Clean, minimal design with artistic aesthetic
- Google OAuth authentication
- Single painting showcase with purchase functionality
- Responsive design
- Artist statement and professional presentation

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Add your painting image:
   - Place your painting image in the `public/` folder
   - Name it `painting.jpg` or `painting.png`
   - Recommended size: 800x600px or larger
   - The image will automatically display in the painting showcase area

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Make sure the backend server is running on `http://localhost:3001`

## Design

- **Typography**: Playfair Display for headings, Inter for body text
- **Color Palette**: Warm amber accents with neutral grays
- **Layout**: Clean, spacious design with focus on the artwork
- **Authentication**: Google OAuth integration for secure purchases

## Customization

- Update the artist name and details in `app/page.tsx`
- Modify the painting title, description, and price
- Adjust the artist statement
- Change colors in `tailwind.config.js` and `globals.css`

## Project Structure

```
demo-frontend/
├── app/                    # Next.js App Router
│   ├── auth-callback/     # OAuth callback handler
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility functions
│   └── auth.ts           # Authentication utilities
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## Authentication Flow

1. User clicks "Sign in with Google" button
2. User is redirected to backend OAuth endpoint
3. Google OAuth flow completes
4. Backend redirects to frontend with JWT token
5. Frontend stores token and fetches user data
6. User is authenticated and can access protected features

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Styling

The application uses Tailwind CSS for styling with a custom color scheme:
- Primary colors: Blue variants
- Background: Gray-50
- Text: Gray-900 for headings, Gray-600 for body text

## API Integration

The frontend communicates with the backend API at `http://localhost:3001`:
- `/auth/google` - Initiate Google OAuth
- `/api/user` - Get current user data
- `/api/logout` - Logout user

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile responsive design 