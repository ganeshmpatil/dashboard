FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir openpyxl
COPY generate_data.py .
CMD ["python", "generate_data.py"]
