# External API Integration for License Keys

## Overview
Your Valor store now supports fetching license keys from external APIs when customers make purchases. This is perfect for reselling products where you need to automatically purchase keys from your supplier's API.

## How It Works

1. **Customer purchases a product** → Stripe processes payment
2. **Order completion triggers** → System checks if product has external API configured
3. **If API configured** → Fetches key from your supplier's API
4. **If API fails or not configured** → Falls back to local key generation
5. **Key is saved** → Customer receives their key via email

## Configuration

### Step 1: Add API Credentials to .env

Add these variables to your `.env` file (not `.env.example`):

```env
# Temp Spoofer API
TEMP_SPOOFER_API_URL=https://your-supplier-api.com/get-key
TEMP_SPOOFER_API_KEY=your_api_key_here

# Perm Spoofer API
PERM_SPOOFER_API_URL=https://your-supplier-api.com/get-key
PERM_SPOOFER_API_KEY=your_api_key_here

# Fortnite Public API
FORTNITE_PUBLIC_API_URL=https://your-supplier-api.com/get-key
FORTNITE_PUBLIC_API_KEY=your_api_key_here

# Fortnite Private API
FORTNITE_PRIVATE_API_URL=https://your-supplier-api.com/get-key
FORTNITE_PRIVATE_API_KEY=your_api_key_here
```

### Step 2: Understand the API Request Format

The system sends a POST request to your configured API URL with this body:

```json
{
  "product": "temp-spoofer",
  "duration": "3 Day",
  "email": "customer@example.com",
  "orderId": "ORD-12345"
}
```

Headers included:
```
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

### Step 3: Expected API Response

Your supplier's API should return JSON with the license key. The system looks for the key in these fields (in order):
- `key`
- `license_key`
- `licenseKey`
- `code`
- `license`

Example response:
```json
{
  "success": true,
  "key": "ABCD-EFGH-IJKL-MNOP"
}
```

## Product Slug Mapping

The system uses product slugs to determine which API to call:
- `temp-spoofer` → Uses TEMP_SPOOFER_API_URL
- `perm-spoofer` → Uses PERM_SPOOFER_API_URL
- `fortnite-public` → Uses FORTNITE_PUBLIC_API_URL
- `fortnite-private` → Uses FORTNITE_PRIVATE_API_URL

## Customizing API Requests

If your supplier's API uses a different format, edit `lib/external-key-api.ts`:

1. Modify the `bodyTemplate` function for your product
2. Change the request method if needed (GET instead of POST)
3. Add custom headers if required

Example customization:
```typescript
'temp-spoofer': {
  url: process.env.TEMP_SPOOFER_API_URL || '',
  method: 'GET', // Changed from POST
  headers: {
    'X-API-Key': process.env.TEMP_SPOOFER_API_KEY || '', // Custom header
  },
  // For GET requests, you might append query params to the URL instead
}
```

## Testing

1. **Without API configured**: System will generate local keys (fallback)
2. **With API configured**: System will attempt to fetch from external API
3. **If API fails**: System falls back to local key generation

Check your server logs for these messages:
- `[Order] Fetching external key for {product}`
- `[Order] Successfully fetched external key`
- `[Order] Failed to fetch external key: {error}`
- `[Order] Falling back to local key generation`

## Troubleshooting

### Keys not being fetched from API
1. Check `.env` file has correct API URL and key
2. Verify product slug matches exactly (check database)
3. Check server logs for error messages
4. Test API endpoint manually with curl/Postman

### API returns error
1. Verify API credentials are correct
2. Check if API expects different request format
3. Review API documentation from your supplier
4. Check if API has rate limits or requires IP whitelisting

### Keys are generated locally instead of from API
- This is the fallback behavior - check logs to see why API call failed
- Ensure environment variables are set correctly
- Restart your Next.js server after changing .env

## Security Notes

- Never commit `.env` file to git
- Keep API keys secure
- Use HTTPS for all API endpoints
- Consider adding retry logic for failed API calls
- Monitor API usage to avoid rate limits

## Support

If you need help configuring your specific supplier's API, provide:
1. API documentation URL
2. Example request/response format
3. Authentication method used
