# Stage 1: Build the application
FROM node

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json /app

# Install ffmpeg
RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install ffmpeg -y

# Install dependencies
RUN npm install

# Set upload server environment variable
# ENV VITE_UPLOAD_SERVER="http://localhost:3000/upload"

# Copy the rest of the application code
COPY . .

EXPOSE 5173
# EXPOSE 7070

CMD ["sh", "-c", "npm run docker -- --host"]

# # Build the application
# RUN npm run build
# 
# # Stage 2: Serve the application with nginx
# FROM nginx:alpine
# 
# # Copy the build output to nginx html directory
# COPY --from=build /app/dist /usr/share/nginx/html
# 
# # Expose port 80
# EXPOSE 80
# 
# # Start both nginx and a simple HTTP server on port 3000
# CMD ["sh", "-c", "nginx -g 'daemon off;'"]

