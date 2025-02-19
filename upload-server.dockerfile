# Use the official Node.js image as the base image
FROM node

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install ffmpeg
RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install ffmpeg -y

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY ./upload-server.js .

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["node", "upload-server.js"]