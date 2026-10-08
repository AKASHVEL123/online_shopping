# Use official lightweight Python image
FROM python:3.10-slim

# Set working directory inside the container
WORKDIR /app

# Copy requirements file first for layer caching
COPY requirements.txt .

# Install Flask without caching to keep the image small
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files into the container
COPY . .

# Expose port 5000 where Flask is running
EXPOSE 5000

# Run the Flask application
CMD ["python", "app.py"]
