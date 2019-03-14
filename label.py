import xml.etree.ElementTree as ET
import sys
import mysql.connector
from mysql.connector import errorcode
import json

def setup_connection(config):
    try:
        db = mysql.connector.connect(**config)
    except mysql.connector.Error as e:
        print(e)

    return db, db.cursor()

def main(cursor):
    try:
        cursor.execute("SELECT labels FROM photos")
        result = cursor.fetchall()

        label_list = {}
        for x in result:
            #print(x[0])
            labels = json.loads(x[0])
            for label in labels:
                label_list[label.lower()] = 1

        print(label_list.keys())

    except mysql.connector.Error as e:
        print(e)

if __name__ == "__main__":
    config = {
        'host': 'localhost',
        'user': 'root',
        'password': '',
        'database': 'flickr'
    }

    db, cursor = setup_connection(config)
    main(cursor)
    cursor.close()
    db.close()
