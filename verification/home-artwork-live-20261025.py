"""Anonymous production checks. No cookies, login, or form submissions."""
import concurrent.futures
import datetime
import hashlib
import json
import pathlib
import urllib.error
import urllib.request

root = pathlib.Path(__file__).resolve().parent.parent
pages = {'/home/':'index.html','/apparel/':'apparel.html','/yoshis-book/':'yoshis-book.html','/training/':'training.html','/programs/':'programs.html','/media/':'media.html','/community/':'community.html','/contact/':'contact.html','/privacy/':'privacy.html','/terms/':'terms.html','/shipping-returns/':'shipping-returns.html','/fitness-disclaimer/':'fitness-disclaimer.html'}
assets = ['home-lakefront.css','assets/photos/smf-arm-detail-mask-20261025.svg'] + [f'assets/photos/smf-turquoise-waterfront-20261025-{w}.webp' for w in [800,1200,1672]] + ['site-design.css','site-appearance.css','site-menu.js','home-actions.css','home-trust.css','assets/brand/sport-my-fitness-header.svg']
def check(url, source):
    request = urllib.request.Request(url, headers={'User-Agent':'SMF-Approved-Artwork-Check','Cache-Control':'no-cache'})
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            body=response.read();status=response.status;headers={k.lower():v for k,v in response.headers.items()}
        expected=(root/source).read_bytes()
        result={'url':url,'status':status,'matchesApprovedSource':body==expected,'sha256':hashlib.sha256(body).hexdigest(),'noStore':'no-store' in headers.get('cache-control','')}
        assert status==200 and result['matchesApprovedSource'] and result['noStore'],result
        if source=='index.html':
            text=body.decode('utf8')
            assert 'Private preview · Admin' not in text
            assert all(marker not in text for marker in ['home-water-motion.js','site-motion.js','smf-water-canvas','smf-motion-boot'])
        return result
    except Exception as error:
        return {'url':url,'error':str(error)}

targets=[('https://sportmyfitness.com'+route,source) for route,source in pages.items()]
targets += [('https://sportmyfitness.com/'+asset,asset) for asset in assets]
targets += [('https://www.sportmyfitness.com/home/','index.html'),('https://sportmyfitness.com/','index.html')]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results=list(pool.map(lambda target:check(*target),targets))
report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceCommit':'03d0c96091c1ea04ea1e70bc9a7bc2b65e2d10e9','productionDeployment':'dpl_5nKR5EG5KYY1EmPJ8GMYxDggx6VS','gatewayDeployment':'dpl_HdQ6Nz7koQpwMwKGd4H9qEtTwV6H','anonymous':True,'cookiesUsed':False,'results':results,'passed':all('error' not in result for result in results)}
(root/'verification/home-artwork-live-20261025.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':report['passed'],'checks':len(results),'checkedAt':report['checkedAt'],'errors':[result for result in results if 'error' in result]},indent=2))
raise SystemExit(0 if report['passed'] else 1)
