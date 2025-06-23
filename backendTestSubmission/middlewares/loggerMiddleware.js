function loggerMiddleware(req, res, next) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        body: req.body,
        headers: req.headers
    };

    process.stdout.write(`[LOG] ${JSON.stringify(logEntry)}\n`);
    next();
}

module.exports = loggerMiddleware;
