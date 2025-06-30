# Use official Python image
FROM python:3.11-slim

# Install poppler and tesseract
# RUN apt-get update && \
#     apt-get install -y poppler-utils tesseract-ocr && \
#     apt-get clean
RUN apt-get update && apt-get install -y poppler-utils tesseract-ocr && apt-get clean

# Set working dir
WORKDIR /app

# Copy your Python code into the container
COPY . /app

# Install Python packages
RUN pip install -r requirements.txt

# Run main.py when container starts
CMD ["python", "cloudrun_main.py"]

