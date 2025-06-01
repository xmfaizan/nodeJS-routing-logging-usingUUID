# Node.js Basic Server

A simple Node.js HTTP server with routing, file serving, logging, and 404 error handling. built without Express.js to understand core Node.js concepts.

The server will start at `http://localhost:3000`

## Available Routes

- `/` or `/home` → Home page
- `/about` → About page
- `/contact` → Contact page
- `/api/test` → API endpoint (returns JSON)
- Any other route → 404 error page

## Project Structure

```
├── server.js          # Main server file
├── package.json       # Project dependencies
├── .env              # Environment variables (not tracked)
├── .env.example      # Environment template
├── .gitignore        # Git ignore rules
├── public/           # Static files directory
│   ├── index.html    # Home page
│   ├── about.html    # About page
│   ├── contact.html  # Contact page
│   └── 404.html      # Custom 404 page
└── server.log        # Request logs (auto-generated)
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| HOST | localhost | Server host |
| LOG_FILE | server.log | Log file name |
| PUBLIC_DIR | public | Static files directory |

## Logging

All requests are logged to `server.log` with:
- Timestamp
- Unique request ID (UUID)
- HTTP method and path
- Response status code
