# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port (default for Stremio add-ons is 7000, change if needed)
EXPOSE 7000

# Start the add-on
CMD ["npm", "start"]
