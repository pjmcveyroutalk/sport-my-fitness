import urllib.request, urllib.error, concurrent.futures, json, re, pathlib, hashlib, datetime
routes=['/','/home/','/apparel/','/yoshis-book/','/training/','/programs/','/media/','/community/','/contact/','/admin','/privacy/','/terms/','/shipping-returns/','/fitness-disclaimer/']
def check(route):
    req=urllib.request.Request('https://sportmyfitness.com'+route,headers={'User-Agent':'SMF-Public-Availability-Check','Cache-Control':'no-cache'})
    # No authentication header, password or cookie jar is used.
    try:
        with urllib.request.urlopen(req,timeout=20) as r:
            body=r.read();text=body.decode('utf8');status=r.status;url=r.geturl();headers={k.lower():v for k,v in r.headers.items()}
        title=re.search(r'<title>(.*?)</title>',text,re.S|re.I)
        result={'route':route,'status':status,'url':url,'title':title.group(1) if title else None,'adminBadge':'Private preview · Admin' in text,'passwordPrompt':bool(re.search(r'<input[^>]+type=[\"\']password',text,re.I)),'noStore':'no-store' in headers.get('cache-control',''),'bodySha256':hashlib.sha256(body).hexdigest()}
        assert status==200,result
        assert not result['adminBadge'] and not result['passwordPrompt'],result
        assert result['title'] and 'Coming Soon' not in result['title'],result
        assert result['noStore'],result
        return result
    except Exception as e:return {'route':route,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(check,routes))
def check_asset(path):
    try:
        with urllib.request.urlopen('https://sportmyfitness.com/'+path,timeout=20) as r:
            body=r.read();status=r.status
        result={'path':path,'status':status,'matchesApprovedSource':body==pathlib.Path(path).read_bytes(),'sha256':hashlib.sha256(body).hexdigest()}
        assert status==200 and result['matchesApprovedSource'],result
        return result
    except Exception as e:return {'path':path,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    assets=list(pool.map(check_asset,['site-design.css','home-water-motion.js','assets/photos/smf-lakefront-bench-20261022-800.webp','assets/brand/sport-my-fitness-header.svg']))
with urllib.request.urlopen('https://www.sportmyfitness.com/home/',timeout=20) as r:
    www={'status':r.status,'url':r.geturl(),'passwordPrompt':bool(re.search(r'<input[^>]+type=[\"\']password',r.read().decode('utf8'),re.I))}
try:
    with urllib.request.urlopen('https://sportmyfitness.com/api/pilot-verify-production',timeout=20) as r:api_status=r.status
except urllib.error.HTTPError as e:api_status=e.code
report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'anonymous':True,'cookiesUsed':False,'productionDeployment':'dpl_HdQ6Nz7koQpwMwKGd4H9qEtTwV6H','publicUntil':'2026-10-26T05:00:00Z','pages':results,'assets':assets,'www':www,'excludedInternalApiStatus':api_status,'passed':all('error' not in x for x in results+assets) and www['status']==200 and not www['passwordPrompt'] and api_status==404}
pathlib.Path('verification/fair-public-live-20261025.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
raise SystemExit(0 if report['passed'] else 1)
