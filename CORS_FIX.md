# Fixing CORS "strict-origin-when-cross-origin" Error

## Quick Fix

If you're getting a CORS error when deployed on a server, follow these steps:

### Step 1: Identify Your Frontend URL

Check what URL your frontend is accessible at:
- Development: `http://localhost:5173`
- Production: `https://yourdomain.com` or `http://your-server-ip:5173`

### Step 2: Update Backend CORS Configuration

#### Option A: Using Docker Compose (Recommended)

Edit `docker-compose.yml` and update the `ALLOWED_ORIGINS` environment variable:

```yaml
backend:
  environment:
    - ALLOWED_ORIGINS=http://your-server-ip:5173,http://localhost:5173
    # Or for production with domain:
    # - ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Then restart:
```bash
docker-compose restart backend
```

#### Option B: Using Environment File

Create or edit `backend/.env`:

```bash
ALLOWED_ORIGINS=http://your-server-ip:5173,https://yourdomain.com
```

#### Option C: Quick Test (NOT for Production)

To quickly test, you can allow all origins temporarily:

```yaml
backend:
  environment:
    - ALLOW_ALL_ORIGINS=true
```

**Warning**: Never use this in production! It's a security risk.

### Step 3: Update Frontend API URL

Make sure your frontend knows where the backend is:

```yaml
frontend:
  environment:
    - VITE_API_URL=http://your-server-ip:8000
    # Or for production:
    # - VITE_API_URL=https://api.yourdomain.com
```

### Step 4: Verify

1. Check browser console - CORS errors should be gone
2. Check network tab - requests should have proper CORS headers
3. Look for `Access-Control-Allow-Origin` header in response

## Common Scenarios

### Scenario 1: Frontend and Backend on Same Server, Different Ports

```yaml
# docker-compose.yml
backend:
  environment:
    - ALLOWED_ORIGINS=http://your-server-ip:5173,http://localhost:5173

frontend:
  environment:
    - VITE_API_URL=http://your-server-ip:8000
```

### Scenario 2: Frontend and Backend on Different Servers

```yaml
# Backend server docker-compose.yml
backend:
  environment:
    - ALLOWED_ORIGINS=https://frontend.yourdomain.com

# Frontend server
frontend:
  environment:
    - VITE_API_URL=https://backend.yourdomain.com
```

### Scenario 3: Using Domain Names with HTTPS

```yaml
backend:
  environment:
    - ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

frontend:
  environment:
    - VITE_API_URL=https://api.yourdomain.com
```

## Debugging

### Check Current CORS Settings

1. Visit your backend health endpoint: `http://your-backend:8000/health`
2. Check response headers in browser DevTools → Network tab
3. Look for `Access-Control-Allow-Origin` header

### Test CORS with curl

```bash
curl -H "Origin: http://your-frontend-url" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://your-backend:8000/api/public/quizzes/some-id
```

You should see `Access-Control-Allow-Origin` in the response headers.

### Common Mistakes

1. **Missing protocol**: Use `http://` or `https://`, not just the domain
2. **Trailing slashes**: Don't include trailing slashes in origins
3. **Port mismatch**: Make sure the port in ALLOWED_ORIGINS matches your frontend port
4. **Not restarting**: Always restart backend after changing CORS settings

## Still Having Issues?

1. Check backend logs: `docker-compose logs backend`
2. Verify environment variables are set: `docker-compose exec backend env | grep ALLOWED`
3. Check if frontend URL matches exactly (including protocol, port, trailing slash)
4. Try the temporary `ALLOW_ALL_ORIGINS=true` to see if it's a CORS issue (then narrow down the origin)

