import json,os,sys
D=os.path.dirname(os.path.abspath(__file__))
rd=lambda n:open(os.path.join(D,n),encoding='utf-8').read()
src=os.environ.get('POOLDIR','/tmp')
if os.path.exists(os.path.join(D,'pools.json')) and not os.environ.get('POOLDIR'):
    pl=json.load(open(os.path.join(D,'pools.json')))
else:
    pl={v:json.load(open(f'{src}/pool_{v}.json')) for v in ['k1','k3','s1','s2','f']}
    json.dump(pl,open(os.path.join(D,'pools.json'),'w'))
def pick(lst,n):  # 難しさ順に並べ、かんたん→むずかしいへ均等にn個
    L=sorted(lst,key=lambda x:x[1]); out=[]
    top=int(len(L)*0.8)
    for i in range(n):
        out.append(L[min(len(L)-1,round(i*(top-1)/(n-1)))][0] if top>1 else L[0][0])
    # 重複回避
    seen=set(); res=[]
    for s in out:
        k=s
        tries=0
        while k in seen and tries<len(L):
            tries+=1
            idx=[x[0] for x in L].index(k)+1
            k=L[idx%len(L)][0]
        seen.add(k); res.append(k)
    return res
STG={'k':[[1,s] for s in pick(pl['k1'],15)]+[[3,s] for s in pick(pl['k3'],15)],
     's':[[1,s] for s in pick(pl['s1'],15)]+[[2,s] for s in pick(pl['s2'],15)],
     'f':[[0,s] for s in pick(pl['f'],30)]}
POOL={v:[x[0] for x in pl[v]] for v in pl}
pools='const POOL='+json.dumps(POOL,separators=(',',':'))+';\nconst STG='+json.dumps(STG,separators=(',',':'))+';\n'
head=rd('head.html'); tail=rd('tail.html')
js=rd('engine.js')+'\n'+pools+rd('helpers.js')+'\n'+rd('app.js')+'\n'+rd('vt.js')
html=head.replace('</style>',rd('app.css')+'</style>',1) if False else head
# CSS: 最後の </style> の直前に追加
i=head.rindex('</style>'); html=head[:i]+rd('app.css')+head[i:]
html+=rd('body.html')+'<script>(()=>{\n'+js+'\n})();</script>'+tail
open(os.path.join(D,'..','index.html'),'w',encoding='utf-8').write(html)
print('built',len(html))
