# Use an official Node runtime as a base image
FROM node:18.15

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm uninstall bcrypt



# Copy the rest of your application files
COPY . .

RUN npm i bcrypt
RUN npm i bcrypt --unsafe-perm=true --allow-root --save


RUN cd src &&  npx prisma generate
# Build the Next.js app
RUN npm run build

# Expose the port that your app will run on
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]
