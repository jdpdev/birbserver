# birbserver

A handy web app for keeping track of your [Birbcam](https://github.com/jdpdev/birbcam)

Birbserver is a Flask backend serving a React frontend.

### Installation
> **!! Birbserver was developed and tested with Rasbpian Buster on a Raspberry Pi 4, running Python 3.7**

Use pip to install dependencies

```
pip install -r requirements.txt
```

The React app has to be built manually, and requires the [Yarn](https://yarnpkg.com/) package manager

```
cd react-app
yarn install
yarn build
```

### Config
Edit the included `config.ini` file to point to the location your Birbcam is saving images

### Run 
The server can be started as you wish, but the included `birbserver.sh` shell script uses Waitress.

Once started, the application will be available on `localhost:8080`
