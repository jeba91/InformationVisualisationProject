import xml.etree.ElementTree as ET
import sys

def parsePhotos(path):
    f = open(path, 'r')
    f.readline()
    content = ""
    for l in f:
        content += l
        if l.startswith(""):
            print(content)
            yield ET.fromstring(content)
            content = ""

for x in parsePhotos(sys.argv[1]):
    print(ET.tostring(x))
