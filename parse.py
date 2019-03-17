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
        labels = photo.find('l abels')
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
        'visual_arts': 3,
        'funny': 3,
        'no_persons': 4,
        'birthday':	3,
        'natural': 2,
        'plants': 2,
        'male': 10,
        'big_group': 10,
        'indoor': 6,
        'cute':	3,
        'architecture': 12,
        'church': 12,
        'flowers': 2,
        'adult': 10,
        'people': 10,
        'outdoor': 2,
        'clouds': 11,
        'bridge': 12,
        'travel':	3,
        'sky':11,
        'single_person':10,
        'aestethic_impression':	3,
        'animals':	0,
        'insect':	0,
        'scary':	8,
        'building_sights':12,
        'happy':	8,
        'summer':13,
        'landscape_nature':	2,
        'calm':	8,
        'water':	2,
        'artificial':	3,
        'citylife':12,
        'park_garden':	2,
        'sunny':11,
        'trees':	2,
        'fancy':	3,
        'partylife':	3,
        'musicalinstrument':	4,
        'work':10,
        'female':10,
        'portrait':	3,
        'winter':13,
        'still_life':	3,
        'mountains':	5,
        'small_group':10,
        'painting':	3,
        'euphoric':	8,
        'flowers':	2,
        'sunset_sunrise':11,
        'family_friends':10,
        'teenager':10,
        'autumn':13,
        'river':	2,
        'bird':	0,
        'melancholic':	8,
        'boring':	8,
        'street':12,
        'vehicle':	7,
        'ship':	7,
        'unpleasant':	8,
        'town':12,
        'buildings':12,
        'sea':	2,
        'car':	7,
        'grafitti':	3,
        'house':12,
        'grass':	2,
        'person':10,
        'child':10,
        'mountain':	5,
        'temple':12,
        'rocks':	2,
        'lake':	2,
        'sports':	1,
        'abstract':	3,
        'train':	7,
        'toy':	4,
        'cityscape':12,
        'snow':13,
        'spring':13,
        'bodypart':10,
        'horse':	0,
        'old_person':10,
        'bicycle':	4,
        'tree':	2,
        'ocean':	2,
        'valley':	2,
        'beach':	2,
        'rain':13,
        'dog':	0,
        'fish':	0,
        'coral':	2,
        'animal':	0,
        'window':	4,
        'road':	6,
        'sign':	4,
        'airport':	6,
        'airplane':	6,
        'skateboard':	4,
        'sun':13,
        'railroad':12,
        'tower':	6,
        'sand':	2,
        'police':10,
        'garden':	2,
        'desert':	2,
        'birds':	0,
        'running':	1,
        'computer':	4,
        'baby':10,
        'wedding':	3,
        'horses':	0,
        'bear':	0,
        'protest':	3,
        'plane':	7,
        'waterfall':	2,
        'fire':2,
        'statue':	6,
        'cow':	0,
        'flags':	4,
        'boats':	4,
        'rainbow':	2,
        'castle':	12
    }


    db, cursor = setup_connection(config)
    main(sys.argv[1], cursor, labeldict)
    cursor.close()
    db.close()
