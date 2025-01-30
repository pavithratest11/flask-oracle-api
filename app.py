from flask import Flask, jsonify
import cx_Oracle

# Initialize Flask app
app = Flask(__name__)

# Database connection settings (Update with your own database details)
DB_HOST = "hq-svr-ora"
DB_PORT = 1521  # Default Oracle DB port
DB_SERVICE_NAME = "RaDB.world"
DB_USER = "qt"
DB_PASSWORD = "qt"

# Oracle connection string
dsn = cx_Oracle.makedsn(DB_HOST, DB_PORT, service_name=DB_SERVICE_NAME)

# Function to connect to the Oracle database and fetch data
def fetch_data_from_oracle():
    try:
        # Establish the database connection
        connection = cx_Oracle.connect(DB_USER, DB_PASSWORD, dsn)
        cursor = connection.cursor()

        # SQL query to fetch data (modify as per your need)
        query = "SELECT planid,ssnum FROM acctbal WHERE rownum <= 10"
        
        # Execute the query
        cursor.execute(query)
        
        # Fetch all rows from the query
        rows = cursor.fetchall()
        
        # Convert rows into a list of dictionaries (or any format you want to return)
        data = []
        for row in rows:
            data.append({
                'planid': row[0],
                'ssnum': row[1]
            })
        
        # Close the cursor and connection
        cursor.close()
        connection.close()
        
        return data
    
    except cx_Oracle.Error as e:
        print("Oracle Error:", e)
        return []

# Define a route to expose the data as a REST API
@app.route('/api/data', methods=['GET'])
def get_data():
    data = fetch_data_from_oracle()
    
    # Return the data as JSON
    if data:
        return jsonify(data)
    else:
        return jsonify({"error": "Failed to fetch data from Oracle DB"}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
