<!DOCTYPE html>
<html>
<head>
    <title>Document API Test</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    <h1>Document Management API Test</h1>

    <div style="margin: 20px;">
        <h2>User Info</h2>
        <div id="user-info">Loading...</div>
    </div>

    <div style="margin: 20px;">
        <h2>Test 1: Get Folders</h2>
        <button onclick="testFolders()">Test Folders API</button>
        <pre id="folders-result"></pre>
    </div>

    <div style="margin: 20px;">
        <h2>Test 2: Get Files</h2>
        <button onclick="testFiles()">Test Files API</button>
        <pre id="files-result"></pre>
    </div>

    <div style="margin: 20px;">
        <h2>Test 3: Database Check</h2>
        <button onclick="testDB()">Check Database</button>
        <pre id="db-result"></pre>
    </div>

    <script>
        // Display user info
        document.getElementById('user-info').innerHTML = `
            <p>Authenticated: @auth('admin_users') <strong>YES</strong> @else <strong>NO</strong> @endauth</p>
            @auth('admin_users')
                <p>User ID: {{ auth('admin_users')->id() }}</p>
                <p>Username: {{ auth('admin_users')->user()->username ?? 'N/A' }}</p>
            @endauth
        `;

        async function testFolders() {
            const result = document.getElementById('folders-result');
            result.textContent = 'Loading...';

            try {
                const response = await fetch('/aio/api/documents/folders', {
                    credentials: 'include', // ← Important!
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });

                const contentType = response.headers.get('content-type');
                result.textContent = `Status: ${response.status}\n`;
                result.textContent += `Content-Type: ${contentType}\n\n`;

                if (contentType?.includes('application/json')) {
                    const data = await response.json();
                    result.textContent += `Response:\n${JSON.stringify(data, null, 2)}`;
                } else {
                    const text = await response.text();
                    result.textContent += `Response (HTML):\n${text.substring(0, 500)}...`;
                }
            } catch (error) {
                result.textContent = `Error: ${error.message}`;
            }
        }

        async function testFiles() {
            const result = document.getElementById('files-result');
            result.textContent = 'Loading...';

            try {
                const response = await fetch('/aio/api/documents/files', {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });

                const contentType = response.headers.get('content-type');
                result.textContent = `Status: ${response.status}\n`;
                result.textContent += `Content-Type: ${contentType}\n\n`;

                if (contentType?.includes('application/json')) {
                    const data = await response.json();
                    result.textContent += `Response:\n${JSON.stringify(data, null, 2)}`;
                } else {
                    const text = await response.text();
                    result.textContent += `Response (HTML):\n${text.substring(0, 500)}...`;
                }
            } catch (error) {
                result.textContent = `Error: ${error.message}`;
            }
        }

        async function testDB() {
            const result = document.getElementById('db-result');
            result.textContent = 'Loading...';

            try {
                const response = await fetch('/aio/api/test-db', {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });

                const data = await response.json();
                result.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                result.textContent = `Error: ${error.message}`;
            }
        }
    </script>
</body>
</html>
