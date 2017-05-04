from flask import Flask, render_template, send_from_directory
app = Flask(__name__)




@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/views/<path:path>')
def views(path):
    return send_from_directory('static', 'views/'+path)

@app.route('/data/<path:path>')
def data(path):
    return send_from_directory('static', 'data/'+path)

@app.route('/images/<path:path>')
def images(path):
    return send_from_directory('static', 'images/'+path)
@app.route('/favicon.ico')
def favicon():
    return send_from_directory('static', 'favicon.ico')

if __name__ == '__main__':
    app.run()