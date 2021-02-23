from flask import Flask, jsonify, send_from_directory, render_template
from os import scandir, path
from datetime import date, timedelta

def create_app(test_config=None):
    picture_folder = '/media/pi/birbstorage'

    app = Flask(__name__, 
                static_folder=picture_folder,
                template_folder="react-app/build")

    react_folder = path.join(app.root_path, '../react-app/build')
    print("root_path ", app.root_path)
    print("picture_folder ", picture_folder)
    print("react_folder ", react_folder)

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
    def listImages(days=0):
        path = picture_folder + "/full/"
        images = []
        offset = timedelta(days=days)
        target = date.today() - offset

        with scandir(path) as pictures:
            for p in pictures:
                if p.is_file() and p.name != 'live.jpg':
                    fileTime = p.stat().st_ctime
                    fileDate = date.fromtimestamp(fileTime)

                    if target != fileDate:
                        continue

                    images.append({
                        "name": p.name,
                        "thumb": p.name,
                        "time": fileTime
                    })

        images.sort(key=sort_images_by_time, reverse=True)
        return jsonify(images)

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

    if __name__ == '__main__':
        app.run(debug=True, host='0.0.0.0')

    return app