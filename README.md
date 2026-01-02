# DefiLlama Protocol URL Monitor

This is a small Next.js/React application that uses the DefiLlama API to monitor the health of protocol-related URLs.

The app:

- Fetches all protocols from the DefiLlama API
- Checks protocol URLs (website, audits, GitHub, etc.) for HTTP status, redirects, and errors (4xx/5xx)
- Displays the results in a sortable and filterable table
- Refreshes the data daily via a scheduled job

The table is sorted by protocol TVL by default, making it easy to spot issues affecting higher-impact protocols first.

## Live demo

The application is deployed here:  
https://dl.movage.nl/
