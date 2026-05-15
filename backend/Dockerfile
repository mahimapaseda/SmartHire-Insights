# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies for PyMuPDF and other libraries
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Download the spaCy model and NLTK corpora
RUN python -m spacy download en_core_web_sm
RUN python -c "import nltk; [nltk.download(p, quiet=True) for p in ('punkt','punkt_tab','stopwords','wordnet','averaged_perceptron_tagger','averaged_perceptron_tagger_eng')]"

# Copy the rest of the application code into the container
COPY . .

# Create uploads directory and set permissions
RUN mkdir -p uploads && chmod 777 uploads

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variables
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Run app.py when the container launches
CMD ["python", "app.py"]
