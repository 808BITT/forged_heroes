module.exports = {
    launch: {
        dumpio: true,
        headless: process.env.HEADLESS !== 'false',
        args: ['--disable-infobars', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        // Set to true for more stability
        handleSIGINT: true,
        // Provide a path for executable in case the default path is causing issues
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    },
    browserContext: 'default',
    // Add additional config to help with debugging
    server: {
        command: 'npm run dev',
        port: 5173,
        launchTimeout: 20000,
        debug: true,
    },
}
