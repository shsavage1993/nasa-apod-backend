import winston from 'winston'

// Define severity levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}

// Set severity based on NODE_ENV:
// Show all the log levels in development mode
// Show only warn and error messages in production
const level = () => {
    const isProduction = process.env.NODE_ENV === 'production'
    return isProduction ? 'warn' : 'debug'
}

// Define different colors for each level.
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
}

// Link the colors defined above to severity levels.
winston.addColors(colors)

// Customise log format.
const format = winston.format.combine(
    // Add the message timestamp with preferred format
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    // Colorise logs
    winston.format.colorize({ all: true }),
    // Define the format of the message showing the timestamp, the level and the message
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
)

// Define which transports the logger must use to print out messages.
const transports = [
    // Allow the use the console to print the messages
    new winston.transports.Console(),
    // // Allow to print all the error level messages inside the error.log file
    // new winston.transports.File({
    //     filename: 'logs/error.log',
    //     level: 'error',
    // }),
    // // Allow to print all the error message inside the all.log file
    // // (also the error log that are also printed inside the error.log(
    // new winston.transports.File({ filename: 'logs/all.log' }),
]

// Create logger instance to be exported
// and used to log messages.
const Logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
})

export default Logger