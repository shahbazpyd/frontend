# ---- Stage 1: Build ----
# Use an official Node.js image to build our static assets.
FROM node:18-alpine as build

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application files.
COPY . .

# Build the React app for production.
# VITE_API_URL and VITE_WS_URL will be passed in as build arguments.
ARG VITE_API_URL
ARG VITE_WS_URL
RUN VITE_API_URL=${VITE_API_URL} VITE_WS_URL= npm run build


# ---- Stage 2: Serve ----
# Use a lightweight Nginx image to serve the static files.
FROM nginx:stable-alpine

# Copy the custom Nginx configuration.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the 'build' stage.
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to the outside world.
EXPOSE 80

# Nginx will start automatically when the container runs.
