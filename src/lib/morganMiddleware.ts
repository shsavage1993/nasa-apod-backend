import morgan, { StreamOptions } from "morgan";

import Logger from "./logger";

// Override the stream method by telling Morgan to
// use our custom logger instead of the console.log.
const stream: StreamOptions = {
  // Use the http severity
  write: (message) => Logger.http(message),
};

// Skip all the Morgan http log if the application
// is not running in development mode.
// This method is not really needed as logger
// is already configured to only print warning
// and error messages in production.
const skip = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  return isProduction;
};

// Build the morgan middleware
const morganMiddleware = morgan('dev',
  // dev format => ':method :url :status :response-time ms - :res[content-length]'
  // Options: overwrite stream and the skip logic.
  { stream, skip }
);

export default morganMiddleware;