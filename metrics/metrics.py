import requests
import timeit
from multiprocessing.pool import ThreadPool as Pool
from multiprocessing import Manager
from requests_toolbelt.multipart.encoder import MultipartEncoder

# from multiprocessing import Pool
data = {"latlng1": [30.0428, -95.7711],
        "latlng2": [29.5754, -95.1267],
        "skip": 10,
        "pagelimit": 5}
headers = {'content-type': 'application/json'}
# url = 'http://18.221.164.117:1330/view'
url = 'http://18.221.164.117:1330/submit'

def worker(procnum, return_dict):
    try:
        img = open('f.jpg', 'rb')
        mp_encoder = MultipartEncoder(
            fields={
                # plain file object, no filename or mime type produces a
                # Content-Disposition header with just the part name
                'file': ('f.jpg', img, 'image/jpg'),
                'text': 'Behold the glory of Christopher Daniel Fregly',
                'timestamp': 'Wed, 16 Oct 2019 21:12:18 GMT',
                'lat': '29.8233',
                'lng': '-95.4142'
            }
        )
        start_time = timeit.default_timer()
        # r = requests.post(url = url, data = json.dumps(data), headers = headers)
        r = requests.post(url,
                          data=mp_encoder,  # The MultipartEncoder is posted as data, don't use files=...!
                          # The MultipartEncoder provides the content-type header with the boundary:
                          headers={'content-type': mp_encoder.content_type}, timeout=50)
        elapsed = timeit.default_timer() - start_time
        img.close()
        if (r.status_code != 200):
            print("BAD RESPONSE")
        return_dict.append(elapsed)
    except Exception as e:
        print(e)
        print('error with item')


def in_order(return_dict, iter_val):
    for i in range(iter_val):
        img = open('f.jpg', 'rb')
        mp_encoder = MultipartEncoder(
            fields={
                # plain file object, no filename or mime type produces a
                # Content-Disposition header with just the part name
                'file': ('f.jpg', img, 'image/jpg'),
                'text': 'Behold the glory of Christopher Daniel Fregly',
                'timestamp': 'Wed, 16 Oct 2019 21:12:18 GMT',
                'lat': '29.8233',
                'lng': '-95.4142'
            })
        start_time = timeit.default_timer()
        # r = requests.post(url = url, data = json.dumps(data), headers = headers)
        r = requests.post(url,
                          data=mp_encoder,  # The MultipartEncoder is posted as data, don't use files=...!
                          # The MultipartEncoder provides the content-type header with the boundary:
                          headers={'content-type': mp_encoder.content_type})
        elapsed = timeit.default_timer() - start_time
        img.close()
        return_dict.append(elapsed)


# print return_dict
def concurrent_vals(num_requests):
    out = []
    # for nr in num_requests:
    # times = []
    # for i in range(5):
    pool_size = num_requests
    pool = Pool(pool_size)
    for i in range(nr * 10):
        pool.apply_async(worker, args=(i, return_dict))
    pool.close()
    pool.join()

def test_max(response_dict):
    return (max(response_dict))


def test_avg(response_dict):
    return (sum(response_dict) / len(response_dict))


if __name__ == "__main__":
    test_1 = False
    test_2 = True
    if test_1:
        mean_vals = []
        for i in range(10):
            latency_dict = []
            iter_val = 100
            in_order(latency_dict, iter_val)
            mean_val = sum(latency_dict) / len(latency_dict)
            mean_vals.append(mean_val)
        out = sum(mean_vals) / len(mean_vals)
        print(mean_vals)
        print("MEAN ONE REQUEST", out)
    if test_2:
        manager = Manager()
        return_dict = manager.list()
        # pool_size = 100  # your "parallelness"
        # data to be sent to api
        num_requests = [1]
        for nr in num_requests:
            return_dict = manager.list()
            concurrent_vals(nr)
            max_val = test_max(return_dict)
            avg_val = test_avg(return_dict)
            # print(return_dict)
            print("NUM_REQUESTS", nr)
            print("MAX_VAL", max_val)
            print("AVG_VAL", avg_val)
