# Vercel-like Application for Deploying Vite React Projects

This application mimics the functionality of Vercel, focusing on deploying Vite React projects using a microservices architecture. It consists of the following components:

1. **Upload Service**: Handles repository cloning and uploads content to S3.
2. **Deploy Service**: Builds the project and uploads the built project to S3.
3. **Request Handler Service**: Serves the deployed files to users upon request.
4. **Next.js Frontend**: Provides a user interface for managing deployments.

---

## Features

- **GitHub OAuth Integration**: Authenticate users using their GitHub accounts.
- **GitHub Integration**: Clone repositories directly from GitHub.
- **Continuous Deployment (CD)**: Automatically redeploys the project when a new commit is pushed to the repository.
- **Scalable Architecture**: Uses Redis for inter-service communication and S3 for file storage.
- **Pub/Sub Mechanism**: Efficient processing of deployment tasks.
- **Static File Hosting**: Serves built projects to users on demand.

---

## Architecture Overview

### 1. **Upload Service**
- **Purpose**: Clone GitHub repositories and upload their contents to S3.
- **Key Steps**:
  1. Accepts the (vite+react) GitHub repository URL as input.
  2. Clones the repository using `git`.
  3. Uploads repository contents to an R2 object store.
  4. Pushes the repository ID to a Redis queue for processing by the Deploy Service.
  5. Triggers a redeployment if new commits are pushed to the GitHub repository.
- **Tech Stack**: Node.js, Express, AWS SDK, Redis

### 2. **Deploy Service**
- **Purpose**: Builds the project and uploads the built files to R2.
- **Key Steps**:
  1. Listens to the Redis queue for repository IDs.
  2. Fetches repository contents from R2 object store.
  3. Builds the project using Vite.
  4. Uploads the built files to a R2 object store.
- **Tech Stack**: Node.js, Redis, AWS SDK

### 3. **Request Handler Service**
- **Purpose**: Serves deployed projects to users.
- **Key Steps**:
  1. Accepts requests with the project ID.
  2. Fetches the corresponding built files from S3.
  3. Serves the files to the user.
- **Tech Stack**: Node.js, Express, AWS SDK

### 4. **Next.js Frontend**
- **Purpose**: User interface for managing deployments.
- **Key Features**:
  1. Login using GitHub OAuth.
  2. Dashboard to view and manage deployments.
- **Tech Stack**: Next.js, React, TypeScript



## Contributors

- **Bhavesh Aswani**
- **Vinay Kumar**

Feel free to raise issues or contribute to this project through pull requests!

