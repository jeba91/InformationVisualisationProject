import mysql.connector
from mysql.connector import errorcode

config = {
    'host': 'rdbms.strato.de',
    'user': 'U3689026',
    'password': 'Fakepass',
    'database': 'DB3689026'
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

cursor.close()
db.close()
