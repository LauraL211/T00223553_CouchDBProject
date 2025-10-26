import pycouchdb
import redis 

COUCHDB_URL = "http://Admin:mtu12345@localhost:5984/"
r = redis.Redis(host='localhost',port=6379, db=0)

server = pycouchdb.Server(COUCHDB_URL)
db = server.database("movies")
doc_id = "01c0413853b52aee903dd748fc0007c0"

cached_movie = r.get(doc_id)
if cached_movie:
    print("From cache:", cached_movie)

else:
    
    movie = db.get(doc_id)
    print("Movie document: ", movie)
    r.setex(doc_id, 300, str(movie))

