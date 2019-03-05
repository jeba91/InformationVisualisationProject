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

def db_entry(cursor, *args):
    try:
        cursor.execute("INSERT INTO photos (photo_id, title, description, poster, latitude, longitude, taken, posted, url, groups, tags, labels, server, farm , secret) \
        VALUES (%s,'%s','%s', '%s', %s, %s,'%s','%s' ,'%s', '%s', '%s', '%s', '%s', '%s', '%s')" % args)
    except mysql.connector.Error as e:
        print(e)

def main(file_path, cursor):
    print('Parsing Tree')
    tree = ET.parse(file_path)
    print('done')
    photos = tree.getroot()

    for photo in photos:
        photo_id = photo.get('id')

        date_posted = photo.find('dates').get('posted')
        date_taken = photo.find('dates').get('taken')

        title = photo.find('title').text
        if title is not None:
            title = title.replace("'", "''")

        description = photo.find('description').text
        if description is not None:
            description = description.replace("'", "''")

        poster = photo.find('owner').get('nsid')

        location = photo.find('location')

        if location is None:
            continue
        latitude = location.get('latitude')
        longitude = location.get('longitude')

        tag_list = []
        tags = photo.find('tags')
        for tag in tags:
            tag = tag.get('raw')
            tag.replace("'", r"\'")
            tag_list.append(tag.replace("'", "''"))
        tag_list = json.dumps(tag_list)

        url = ''
        urls = photo.find('urls')
        for u in urls:
            url = u.text
            break

        group_list = []
        groups = photo.find('groups')
        for group in groups:
            group = group.get('id')
            group = group.replace("'", "''")
            group_list.append(group)
        group_list = json.dumps(group_list)

        label_list = []
        labels = photo.find('labels')
        if labels is not None:
            for label in labels:
                label = label.text.replace("'", "''")
                label_list.append(label)
        label_list = json.dumps(label_list)

        server = photo.get('server')
        farm = photo.get('farm')
        secret = photo.get('secret')

        db_entry(cursor, photo_id, title, description, poster, latitude, longitude, date_taken, date_posted, url, group_list, tag_list, label_list, server, farm, secret)

if __name__ == "__main__":
    config = {
        'host': 'localhost',
        'user': 'root',
        'password': '',
        'database': 'flickr'
    }

    db, cursor = setup_connection(config)
    main(sys.argv[1], cursor)
    cursor.close()
    db.close()
