import math, json
E=[0.1,0.2,0.3,0.5,0.6,0.8,1.0,1.25,1.5]
mu={ # NIST XCOM mu/rho cm2/g (fetched 13/10/2026)
 'Pb':[5.549,0.9985,0.4031,0.1614,0.1248,0.08870,0.07102,0.05876,0.05222],
 'Al':[0.1704,0.1223,0.1042,0.08445,0.07802,0.06841,0.06146,0.05496,0.05006],
 'concreto':[0.1738,0.1282,0.1097,0.08915,0.08236,0.07227,0.06495,0.05807,0.05288],
 'PMMA':[0.1641,0.1328,0.1152,0.0941,0.08701,0.07641,0.0687,0.06143,0.05591],
 'ar':[0.1541,0.1233,0.1067,0.08712,0.08055,0.07074,0.06358,0.05687,0.05175]}
rho={'Pb':11.35,'Al':2.699,'concreto':2.30,'PMMA':1.19,'ar':1.205e-3}
def interp(m,e):
    for i in range(len(E)-1):
        if E[i]<=e<=E[i+1]:
            a=(math.log(e)-math.log(E[i]))/(math.log(E[i+1])-math.log(E[i]))
            return math.exp(math.log(m[i])+a*(math.log(m[i+1])-math.log(m[i])))
# Ir-192 effective energy (intensity-weighted, lines from DDEP table)
ir=[(316.51,82.75),(468.07,47.81),(308.46,29.68),(295.96,28.72),(604.41,8.20),(612.46,5.34),(588.58,4.52),(205.79,3.34),(484.58,3.19)]
eir=sum(e*i for e,i in ir)/sum(i for e,i in ir)/1000
print('Ir-192 E medio ponderado (MeV): %.3f'%eir)
en={'Tc-99m (0,1405 MeV)':None}
for nome,e in [('Co-60 (1,25 MeV, media 1173/1333)',1.25),('Cs-137 (0,662)',0.662),('Ir-192 (~%.2f)'%eir,eir),('Tc-99m (0,1405) [interp. 0,1-0,2]',0.1405)]:
    print(nome)
    for m in ['Pb','Al','concreto','PMMA']:
        mm=interp(mu[m],e); lin=mm*rho[m]
        print('   %-9s mu/rho=%.4g cm2/g  mu=%.4g /cm  HVL=%.3g cm  TVL=%.3g cm'%(m,mm,lin,math.log(2)/lin,math.log(10)/lin))
    # ar
    lin=interp(mu['ar'],e)*rho['ar']; print('   ar mu=%.3g /cm  -> 1/e em %.0f m'%(lin,1/lin/100))
# Katz-Penfold
def kp(Em): return 0.412*Em**(1.265-0.0954*math.log(Em))  # g/cm2
print('Katz-Penfold (g/cm2) e alcance (usar Emax):')
for nome,Em in [('P-32',1.710661),('Sr-90',0.5459),('Y-90 (filha)',2.28),('I-131 606',0.6063),('Cs-137 514',0.51397),('Ir-192 675',0.6751)]:
    if Em>2.5: print(nome,'fora da faixa 0,01-2,5 MeV'); continue
    R=kp(Em)
    print('  %-14s Emax=%.3f R=%.0f mg/cm2 | ar %.2f m | acrilico %.2f mm | Al %.2f mm | Pb %.2f mm'%(nome,Em,R*1000,R/rho['ar']/100,R/rho['PMMA']*10,R/rho['Al']*10,R/rho['Pb']*10))
# alfa no ar
def ra(E): return 0.56*E if E<4 else 1.24*E-2.62
for n,e in [('Am-241',5.48556),('Po-210',5.30433),('Ra-226',4.78434),('U-238',4.198)]:
    print('alfa %s %.3f MeV: %.2f cm no ar'%(n,e,ra(e)))
# decaimento
T={'Tc-99m':6.0067/24,'I-131':8.0233,'Ir-192':73.827,'P-32':14.273,'Po-210':138.3763,'Co-60':5.2711*365.2422,'Sr-90':28.80*365.2422,'Cs-137':30.018*365.2422}
for k,t in T.items():
    print('%-7s T1/2=%.4g d  perda em 6 min=%.4f%%  em 1h=%.4f%%'%(k,t,100*(1-2**(-(6/1440)/t)),100*(1-2**(-(1/24)/t))))
# Alcance de detecção por 1/d2
bg=5
print('Distancia de deteccao gama (sinal=3*sqrt(bg)=6.7 cps) para base em cps a d0:')
for d0 in (0.5,1.0):
    for b in (300,360,500,720,950):
        print('  d0=%.1f m base=%d -> %.1f m'%(d0,b,d0*math.sqrt(b/(3*math.sqrt(bg)))))
