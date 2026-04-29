# eduos/edge-server/Dockerfile
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# The volume for caching is handled in docker-compose.yml
CMD ["nginx", "-g", "daemon off;"]
