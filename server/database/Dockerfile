# Use the official Node.js image version 18.12.1
FROM node:18.12.1-bullseye-slim

# Update global npm version if needed
RUN npm install -g npm@9.1.3

# Set the working directory inside the container to /app (Crucial step)
WORKDIR /app

# Copy package.json first to install dependencies properly
COPY package.json ./

# Install project dependencies inside /app/node_modules
RUN npm install

# Copy all other project files and folders into /app
COPY . .

# Expose the application port
EXPOSE 3030

# Command to start the application
CMD [ "node", "app.js" ]