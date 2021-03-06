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
        cursor.execute("INSERT INTO photos (photo_id, title, description, poster, latitude, longitude, taken, posted, url, groups, tags, labels, categories, server, farm , secret, views) \
        VALUES (%s,'%s','%s', '%s', %s, %s,'%s','%s' ,'%s', '%s', '%s', '%s', '%s', '%s', '%s','%s', '%s')" % args)
    except mysql.connector.Error as e:
        print(e)

def main(file_path, cursor, labeldict):
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

        category_list = []
        label_list = []
        labels = photo.find('labels')
        if labels is not None:
            for label in labels:
                label = label.text.replace("'", "''").lower()
                try:
                    category_list.append(labeldict[label])
                    label_list.append(label)
                except:
                    pass
        category_list = json.dumps(list(set(category_list)))
        label_list = json.dumps(list(set(label_list)))

        server = photo.get('server')
        farm = photo.get('farm')
        secret = photo.get('secret')
        views = photo.get('views')

        db_entry(cursor, photo_id, title, description, poster, latitude, longitude, date_taken, date_posted, url, group_list, tag_list, label_list, category_list, server, farm, secret, views)

if __name__ == "__main__":
    config = {
        'host': 'localhost',
        'user': 'root',
        'password': '',
        'database': 'flickr'
    }

    labeldict = {
        'animals': 0,
        'insect': 0,
        'bird': 0,
        'horse': 0,
        'dog': 0,
        'fish': 0,
        'animal': 0,
        'birds': 0,
        'horses': 0,
        'bear': 0,
        'cow': 0,
        'sports': 1,
        'running': 1,
        'natural': 2,
        'plants': 2,
        'flowers': 2,
        'outdoor': 2,
        'landscape_nature': 2,
        'water': 2,
        'park_garden': 2,
        'trees': 2,
        'flowers': 2,
        'river': 2,
        'sea': 2,
        'grass': 2,
        'rocks': 2,
        'lake': 2,
        'tree': 2,
        'ocean': 2,
        'valley': 2,
        'beach': 2,
        'coral': 2,
        'sand': 2,
        'garden': 2,
        'desert': 2,
        'waterfall': 2,
        'rainbow': 2,
        'visual_arts': 3,
        'funny': 3,
        'birthday': 3,
        'cute': 3,
        'travel': 3,
        'aestethic_impression': 3,
        'artificial': 3,
        'fancy': 3,
        'partylife': 3,
        'portrait': 3,
        'still_life': 3,
        'painting': 3,
        'grafitti': 3,
        'abstract': 3,
        'wedding': 3,
        'protest': 3,
        'no_persons': 4,
        'musicalinstrument': 4,
        'toy': 4,
        'bicycle': 4,
        'window': 4,
        'sign': 4,
        'skateboard': 4,
        'computer': 4,
        'flags': 4,
        'boats': 4,
        'mountain': 5,
        'mountains': 5,
        'indoor': 6,
        'road': 6,
        'airport': 6,
        'airplane': 6,
        'tower': 6,
        'statue': 6,
        'vehicle': 7,
        'ship': 7,
        'car': 7,
        'train': 7,
        'plane': 7,
        'scary': 8,
        'happy': 8,
        'calm': 8,
        'euphoric': 8,
        'melancholic': 8,
        'boring': 8,
        'unpleasant': 8,
        'male': 9,
        'big_group': 9,
        'adult': 9,
        'people': 9,
        'single_person': 9,
        'work': 9,
        'female': 9,
        'small_group': 9,
        'family_friends': 9,
        'teenager': 9,
        'person': 9,
        'child': 9,
        'bodypart': 9,
        'old_person': 9,
        'police': 9,
        'baby': 9,
        'clouds': 10,
        'sky': 10,
        'sunny': 10,
        'sunset_sunrise': 10,
        'architecture': 11,
        'church': 11,
        'bridge': 11,
        'building_sights': 11,
        'citylife': 11,
        'street': 11,
        'town': 11,
        'buildings': 11,
        'house': 11,
        'temple': 11,
        'cityscape': 11,
        'railroad': 11,
        'castle': 11,
        'summer': 12,
        'winter': 12,
        'autumn': 12,
        'snow': 12,
        'spring': 12,
        'rain': 12,
        'sun': 12
    }



    db, cursor = setup_connection(config)
    main(sys.argv[1], cursor, labeldict)
    cursor.close()
    db.close()
