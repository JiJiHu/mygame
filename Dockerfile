# Use nginx:alpine for lightweight static file serving
FROM nginx:alpine

# Remove default nginx config and any other configs
RUN rm -f /etc/nginx/conf.d/*.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy root static files to nginx html directory
COPY index.html onepage-home.css onepiece-theme.css /usr/share/nginx/html/
COPY manifest.json sw.js /usr/share/nginx/html/
COPY images/ /usr/share/nginx/html/images/

# Copy games directory (contains all game HTML/CSS/JS files)
COPY games/ /usr/share/nginx/html/games/


# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
