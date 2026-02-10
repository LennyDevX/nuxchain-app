#!/usr/bin/env node

/**
 * 🚀 UNIFIED API TESTER
 * 
 * Combines health checks, endpoint discovery, and airdrop validation testing.
 */

const http = require('http');
require('dotenv').config();

const API_URL = process.env.VITE_API_URL || 'http://localhost:3002';
const DEFAULT_WALLET = 'HHraRp46hRQzYiBuAq2Xkjm4DFLDNWyWdHUkjJrgEP7X';

async function callAPI(path, method = 'GET', payload = null) {
    return new Promise((resolve, reject) => {
        let url;
        try {
            url = new URL(path.startsWith('http') ? path : API_URL + path);
        } catch (e) {
            return reject(new Error(`Invalid URL: ${API_URL}${path}`));
        }

        const payloadStr = payload ? JSON.stringify(payload) : '';

        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (method === 'POST' || method === 'PUT') {
            options.headers['Content-Length'] = Buffer.byteLength(payloadStr);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data,
                    contentType: res.headers['content-type'],
                });
            });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (payloadStr) {
            req.write(payloadStr);
        }
        req.end();
    });
}

function printDivider() {
    console.log('═'.repeat(80));
}

function printSection(title) {
    console.log(`\n📡 ${title}`);
    console.log('─'.repeat(80));
}

async function main() {
    const targetWallet = process.argv[2] || DEFAULT_WALLET;

    printDivider();
    console.log('🚀 UNIFIED API TESTER');
    printDivider();
    console.log(`\nAPI Base: ${API_URL}`);
    console.log(`Target Wallet: ${targetWallet}\n`);

    try {
        // 1. Health Checks
        printSection('TEST 1: Health Checks');
        const healthEndpoints = [
            '/api/health/status',
            '/api/health',
            '/health'
        ];

        for (const path of healthEndpoints) {
            try {
                const res = await callAPI(path, 'GET');
                console.log(`${res.statusCode === 200 ? '✅' : '❌'} ${path.padEnd(25)} → ${res.statusCode} (${res.contentType || 'no-type'})`);
                if (res.statusCode === 200 && res.body.length < 500) {
                    console.log(`   Response: ${res.body}`);
                }
            } catch (err) {
                console.log(`✗ ${path.padEnd(25)} → Error: ${err.message}`);
            }
        }

        // 2. Airdrop Validation Test
        printSection('TEST 2: Airdrop Validation');
        const validatePayload = {
            wallet: targetWallet,
            email: 'debug@nuxchain.app',
            name: 'Debug User',
            fingerprint: 'unified-debug-test',
            browserName: 'Console',
            osName: 'System',
            deviceType: 'script',
            ipAddress: '127.0.0.1'
        };

        console.log('Sending validation request...');
        const validateEndpoints = [
            '/api/airdrop/validate',
            '/airdrop/validate',
            '/api/airdrop/validate-and-register'
        ];

        for (const path of validateEndpoints) {
            try {
                const res = await callAPI(path, 'POST', validatePayload);
                console.log(`${res.statusCode === 200 ? '✅' : '❌'} ${path.padEnd(25)} → ${res.statusCode}`);

                if (res.statusCode === 200 || res.statusCode === 400 || res.statusCode === 409) {
                    try {
                        const parsed = JSON.parse(res.body);
                        console.log(`   Response: ${JSON.stringify(parsed, null, 2)}`);
                    } catch (e) {
                        console.log(`   Raw Body: ${res.body.substring(0, 200)}...`);
                    }
                    if (res.statusCode === 200) break; // If we found the right one, stop discovery
                }
            } catch (err) {
                console.log(`✗ ${path.padEnd(25)} → Error: ${err.message}`);
            }
        }

        // 3. Environment Summary
        printSection('ENVIRONMENT SUMMARY');
        console.log(`VITE_API_URL:    ${process.env.VITE_API_URL || 'Not set (using default port 3002)'}`);
        console.log(`Node Version:    ${process.version}`);

        console.log('\n💡 Tip: If you get 404s, check if the backend is running and matches the path structure.');
        console.log('💡 Tip: npm run dev:full usually starts the backend on port 3002.');

    } catch (err) {
        console.error('\n❌ Fatal Error:', err.message);
    }

    console.log('\n');
    printDivider();
}

main();
