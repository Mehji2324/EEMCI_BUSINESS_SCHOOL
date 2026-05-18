FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy backend, frontend and test files
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY test-db.js ./

# Ensure uploads directory exists
RUN mkdir -p backend/uploads

# Expose the port the app runs on
EXPOSE 5001

# Command to run the application
CMD ["node", "backend/server.js"]
