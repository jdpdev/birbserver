from flask import Flask, jsonify, send_from_directory, render_template
from os import scandir, path
from datetime import date, datetime, timedelta
from json import JSONEncoder

class ClassifyResult:
    def __init__(self, result):
        split = result.split("~")
        self.species = split[0]
        self.confidence = split[1]
        return

    def jsonify(self):
        return {
            "species": self.species,
            "confidence": self.confidence
        }

class LoggedPicture:
    def __init__(self, log_line):
        data = log_line.replace("\n", "").split("|")
        self.time = float(data[0])
        self.full = data[1]
        self.thumb = data[2]
        self.shutter = data[4] if len(data) > 4 else "n/a"
        self.iso = data[5] if len(data) > 5 else "n/a"
        self.classification = [ClassifyResult(c) for c in data[3].split("@")]

    def __extract_file_name(self, p):
        split = path.split(p)
        return split[1]

    def jsonify(self):
        return {
            "time": self.time,
            "full": self.__extract_file_name(self.full),
            "thumb": self.__extract_file_name(self.thumb),
            "shutter": self.shutter,
            "iso": self.iso,
            "classification": list(map(lambda c: c.jsonify(), self.classification))
        }

def read_file_pictures(log_file):
    return [LoggedPicture(l) for l in log_file]

def make_picture_jsonable(picture: LoggedPicture):
    return picture.jsonify()

def create_app(test_config=None):
    picture_folder = '/media/pi/birbstorage'

    app = Flask(__name__, 
                static_folder=picture_folder,
                template_folder="react-app/build")

    react_folder = path.join(app.root_path, '../react-app/build')
    print("root_path ", app.root_path)
    print("picture_folder ", picture_folder)
    print("react_folder ", react_folder)

    file_picture_log = open(f"{picture_folder}/pictures.txt", mode="r", encoding="utf-8")
    picture_log = read_file_pictures(file_picture_log)

    @app.route('/picture/<path:filename>')
    def get_picture(filename):
        return send_from_directory(picture_folder + "/full", filename)

    @app.route('/thumb/<path:filename>')
    def get_thumbnail(filename):
        return send_from_directory(picture_folder + "/thumb", filename)

    def sort_images_by_time(i):
        return i["time"]

    @app.route('/api/list')
    @app.route('/api/list/:days')
    def listImages(days=1):
        path = picture_folder + "/full/"
        images = []
        offset = timedelta(days=days)
        target = datetime.today() - offset

        picture_range = filter(
            lambda p: p.time >= target.timestamp(),
            picture_log
        )
        picture_range = list(picture_range)
        picture_range.sort(key=lambda p: p.time, reverse=True)

        picture_range = [make_picture_jsonable(p) for p in picture_range]
        
        return jsonify(picture_range)

    @app.route('/live<path:ignore>')
    def getLive(ignore):
        path = picture_folder + "/live.jpg"
        return app.send_static_file("live.jpg")

    @app.route('/<path:filename>')
    def static_file(filename):
        return send_from_directory(react_folder, filename)

    @app.route('/')
    def index():
        return send_from_directory(react_folder, 'index.html')

    return app