import mysql.connector
from mysql.connector import errorcode

config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'flickr'
}

try:
    db = mysql.connector.connect(**config)
except mysql.connector.Error as e:
    print(e)

cursor = db.cursor()

try:
    cursor.execute("SHOW DATABASES")
except mysql.connector.Error as e:
    print(e)

print(cursor.fetchall())

cursor.close()
db.close()
