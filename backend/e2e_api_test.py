import urllib.request, urllib.parse, json, sys
BASE='http://localhost:8000'
try:
    data=urllib.parse.urlencode({'username':'admin-soft','password':'Courier@123'}).encode()
    req=urllib.request.Request(BASE+'/auth/login', data=data, headers={'Content-Type':'application/x-www-form-urlencoded'})
    r=urllib.request.urlopen(req, timeout=10)
    resp=json.loads(r.read().decode())
    token=resp.get('access_token')
    print('LOGIN', 'OK' if token else 'NO_TOKEN')
except Exception as e:
    print('LOGIN ERR', e)
    sys.exit(1)

hdr={'Authorization': f'Bearer {token}', 'Content-Type':'application/json'}
# list drivers
try:
    req=urllib.request.Request(BASE+'/drivers', headers=hdr)
    r=urllib.request.urlopen(req, timeout=10)
    print('LIST', r.status)
    drivers=json.loads(r.read().decode())
    print('DRIVERS_COUNT', len(drivers))
except Exception as e:
    print('LIST ERR', e)
    sys.exit(1)

# create driver
payload={
    'full_name':'API E2E Driver','phone':'01101234567','national_id':'12345678901234','email':'api-e2e@example.com',
    'vehicle_type':'Bike','vehicle_plate':'API-PLT','license_number':'API-LIC','license_expiry':'2030-01-01'
}
try:
    req=urllib.request.Request(BASE+'/drivers/', data=json.dumps(payload).encode(), headers=hdr, method='POST')
    r=urllib.request.urlopen(req, timeout=10)
    created=json.loads(r.read().decode())
    did=created.get('id')
    print('CREATE', r.status, 'id=', did)
except Exception as e:
    print('CREATE ERR', e)
    sys.exit(1)

# get by id
try:
    req=urllib.request.Request(f"{BASE}/drivers/{did}", headers=hdr)
    r=urllib.request.urlopen(req, timeout=10)
    print('GET', r.status, r.read().decode()[:200])
except Exception as e:
    print('GET ERR', e); sys.exit(1)

# update
payload['full_name']='API E2E Driver Updated'
try:
    req=urllib.request.Request(f"{BASE}/drivers/{did}", data=json.dumps(payload).encode(), headers=hdr, method='PUT')
    r=urllib.request.urlopen(req, timeout=10)
    print('UPDATE', r.status)
except Exception as e:
    print('UPDATE ERR', e); sys.exit(1)

# delete
try:
    req=urllib.request.Request(f"{BASE}/drivers/{did}", headers=hdr, method='DELETE')
    r=urllib.request.urlopen(req, timeout=10)
    print('DELETE', r.status)
except Exception as e:
    print('DELETE ERR', e); sys.exit(1)

# confirm deletion
try:
    req=urllib.request.Request(f"{BASE}/drivers/{did}", headers=hdr)
    r=urllib.request.urlopen(req, timeout=10)
    print('CONFIRM GET', r.status)
except urllib.error.HTTPError as e:
    print('CONFIRM GET', e.code)
    if e.code==404:
        print('DELETED_CONFIRMED')
    else:
        sys.exit(1)
except Exception as e:
    print('CONFIRM ERR', e); sys.exit(1)
