// Novas texturas, no mesmo tamanho e proporção do personagem existente (32 × 40, desenho 3/4).
// Elas não criam outro mapa, câmera ou sistema de movimento.
export function registrarNpcsHospital(scene) {
    const perfis={
        rita:{blusa:'#e7f0f1',calca:'#355c76',cabelo:'#34303a',pele:'#e7b697',jaleco:true},
        helena:{blusa:'#d28682',calca:'#4c4963',cabelo:'#674735',pele:'#e7b697'},
        camila:{blusa:'#dfeaf0',calca:'#3a506b',cabelo:'#403330',pele:'#a46d4e',jaleco:true,oculos:true},
        andre:{blusa:'#69a7ab',calca:'#35566b',cabelo:'#34303a',pele:'#c7926b'},
        lucia:{blusa:'#bd985f',calca:'#51586c',cabelo:'#66433c',pele:'#d4a381'},
        lara:{blusa:'#739caf',calca:'#4e5666',cabelo:'#422d25',pele:'#a87552',oculos:true},
        caio:{blusa:'#9ca77b',calca:'#526178',cabelo:'#322f34',pele:'#d9ab86'},
        dora:{blusa:'#b381a3',calca:'#4c4963',cabelo:'#6a4e3c',pele:'#ddb08a',oculos:true},
        ines:{blusa:'#638fa4',calca:'#4b5866',cabelo:'#282c32',pele:'#956341'},
        bia:{blusa:'#e7f0f1',calca:'#3b5a4e',cabelo:'#2b2a30',pele:'#c58d66',jaleco:true,oculos:true},
        otto:{blusa:'#e7f0f1',calca:'#5a4a40',cabelo:'#4a3a2e',pele:'#e0b48e',jaleco:true},
        nina:{blusa:'#e7f0f1',calca:'#3a506b',cabelo:'#1f1d22',pele:'#8d5a3c',jaleco:true,oculos:true},
        davi:{blusa:'#e7f0f1',calca:'#4a4f5c',cabelo:'#3a3036',pele:'#d6a47c',jaleco:true},
        lea:{blusa:'#e7f0f1',calca:'#52466a',cabelo:'#6a3f2c',pele:'#e7b697',jaleco:true,oculos:true},
        teo:{blusa:'#e7f0f1',calca:'#2f4f5e',cabelo:'#262a30',pele:'#b37a54',jaleco:true},
        iris:{blusa:'#e7f0f1',calca:'#5c4a58',cabelo:'#3d2b24',pele:'#a56f4f',jaleco:true,oculos:true},
        nelson:{blusa:'#7c8f5b',calca:'#454b57',cabelo:'#a5a39c',pele:'#a9764f'},
        leo:{blusa:'#d98c50',calca:'#38486a',cabelo:'#2a2430',pele:'#c58d66'},
        vera:{blusa:'#c8826f',calca:'#463f58',cabelo:'#7a5a44',pele:'#e0b48e',oculos:true},
        paulo:{blusa:'#8fb0c8',calca:'#3a4a5a',cabelo:'#4a3a2e',pele:'#d6a47c',oculos:true},
        tania:{blusa:'#7d6396',calca:'#3a3a4c',cabelo:'#8c8a90',pele:'#b98563'},
    };
    for(const [papel,perfil] of Object.entries(perfis)){
        const chave='hospital_npc_'+papel;if(scene.textures.exists(chave))continue;
        const cv=document.createElement('canvas');cv.width=96;cv.height=120;const c=cv.getContext('2d');c.scale(3,3);
        const ret=(x,y,w,h,cor,r=1.8)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=cor;c.fill();c.strokeStyle='#16202e';c.lineWidth=.7;c.stroke();};
        const oval=(x,y,rx,ry,cor)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=cor;c.fill();c.strokeStyle='#16202e';c.lineWidth=.7;c.stroke();};
        const rita=perfil.jaleco,calca=perfil.calca,blusa=perfil.blusa;
        oval(16,36,10,2.2,'rgba(0,0,0,.25)');
        ret(10.5,26,4.7,9,calca);ret(17,26,4.7,9,calca);ret(10,33,5.7,3.5,'#253346');ret(16.5,33,5.7,3.5,'#253346');
        ret(6,15,4.3,10,blusa);ret(22,15,4.3,10,blusa);ret(6.2,24,3.8,3,perfil.pele);ret(22.2,24,3.8,3,perfil.pele);
        ret(9.5,14,13,14.5,blusa,2.5);
        if(rita){c.fillStyle='#438995';c.fillRect(14,14,4,11);c.fillStyle='#bccfd4';c.fillRect(12.5,15,1,12);c.fillRect(19,15,1,12);c.fillStyle='#e9c86e';c.fillRect(19.5,19,2,3);}
        else{c.fillStyle='#bd6d73';c.fillRect(10,24,12,3);}
        oval(16,9.8,6.9,7.4,perfil.pele);
        c.fillStyle=perfil.cabelo;c.beginPath();c.ellipse(16,5.8,7.1,4.4,0,Math.PI,Math.PI*2);c.fill();
        ret(9,5,3,6,perfil.cabelo,1);if(!rita)ret(21,5,3,8,perfil.cabelo,1);
        c.fillStyle='#293341';c.fillRect(12.5,9,1.5,1.7);c.fillRect(18.5,9,1.5,1.7);c.fillStyle='#a56660';c.fillRect(14.5,13,3,1);
        if(perfil.oculos){c.strokeStyle='#243847';c.lineWidth=.7;c.strokeRect(11,8,5,4);c.strokeRect(17,8,5,4);c.beginPath();c.moveTo(16,10);c.lineTo(17,10);c.stroke();}
        scene.textures.addCanvas(chave,cv);
    }
}
