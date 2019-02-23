import mysql.connector

config = {
    'host': '',
    'user': '',
    'password': '',
    'database': ''
}

try:
    db = mysql.connector.connect(**config)
except mysql.connector.Error as e:
    print(e)

cursor = db.cursor()

try:
    cursor.execute("")
except mysql.connector.Error as e:
    print(e)

cursor.close()
db.close()
