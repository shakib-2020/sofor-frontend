// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function _log(message: any, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    if (data) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log(message, data);
    } else {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log(message);
    }
  }
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function _error(message: any, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    if (data) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error(message, data);
    } else {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error(message);
    }
  }
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function _warn(message: any): void {
  if (process.env.NODE_ENV === 'development') {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.warn(`${message}`);
  }
}

export { _log, _error, _warn };
