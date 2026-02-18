const LIST_PASARAN = [
    "HOKIDRAW", "TOTOMACAU PAGI", "HUAHIN 0100", "KENTUCKYMID", "FLORIDAMID", "BANGKOK 0130", 
    "NEWYORKMID", "BRUNEI 02", "CAROLINADAY", "OREGON03", "OREGON06", "CALIFORNIA", 
    "BANGKOK 0930", "FLORIDAEVE", "OREGON09", "NEWYORKEVE", "KENTUCKYEVE", "TOTOCAMBODIA", 
    "CHELSEA 11", "CAROLINAEVE", "POIPET12", "BULLSEYE", "OREGON12", "TOTOMACAU SIANG", 
    "SYDNEY", "JAKARTA 1400", "BRUNEI 14", "CHELSEA 15", "TOTOMALI 1530", "TOTOMACAU 5D SORE", 
    "POIPET15", "TOTOMACAU SORE", "HUAHIN 1630", "SINGAPORE", "MAGNUM4D", "TOTOMACAU MALAM I", 
    "CHELSEA 19", "POIPET19", "PCSO", "TOTOMALI 2030", "HUAHIN 2100", "CHELSEA 21", 
    "TOTOMACAU 5D MALAM", "NEVADA", "BRUNEI 21", "TOTOMACAU MALAM II", "POIPET22", 
    "HONGKONG", "TOTOMACAU MALAM III", "TOTOMALI 2330", "JAKARTA 2330", "KING KONG4D"
].sort();

function generateData(nama, offset) {
    const d = new Date(); d.setDate(d.getDate() + offset);
    const tgl = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    let seed = 0;
    for(let i=0; i<nama.length; i++) {
        seed = ((seed << 5) - seed) + nama.charCodeAt(i);
        seed |= 0;
    }
    seed += d.getDate() + (d.getMonth() * 100) + (d.getFullYear() * 10000);

    const rng = () => {
        seed = (1664525 * seed + 1013904223) % 4294967296;
        return Math.abs(seed / 4294967296);
    };

    const getUnikDigit = (jml) => {
        let pools = [0,1,2,3,4,5,6,7,8,9];
        let hasil = [];
        for(let i=0; i<jml; i++) {
            let idx = Math.floor(rng() * pools.length);
            hasil.push(pools.splice(idx, 1)[0]);
        }
        return hasil;
    };

    const getKombinasi = (jml, digit, separator = " ") => {
        let resArr = [];
        while(resArr.length < jml) {
            let num = Array.from({length: digit}, () => Math.floor(rng()*10)).join('');
            if(!resArr.includes(num)) resArr.push(num);
        }
        return resArr.join(separator);
    };

    const bbfsArr = getUnikDigit(7);
    const bbfs = bbfsArr.join('');
    const amArr = getUnikDigit(5);
    const am = amArr.join('');
    const shios = ["KERBAU", "NAGA", "AYAM", "HARIMAU", "KUDA", "ULAR", "TIKUS", "BABI", "KAMBING", "MONYET", "ANJING", "KELINCI"];
    
    let res = `${nama}\n${tgl}\n`;
    res += `BBFS ${bbfs}\n`;
    res += `ANGKA MAIN ${am}\n`;
    res += `4D ${getKombinasi(4, 4)}\n`;
    res += `3D ${getKombinasi(4, 3)}\n`;
    res += `2D (BB) ${getKombinasi(8, 2)}\n`;
    res += `Colok Bebas ${amArr[0]} / ${amArr[1]}\n`;
    
    let colok2D = [
        `${amArr[0]}${amArr[2]}`,
        `${amArr[1]}${amArr[3]}`,
        `${amArr[4]}${amArr[0]}`,
        `${amArr[2]}${amArr[4]}`
    ];
    res += `COLOK BEBAS 2D ${colok2D.join(" / ")}\n`;
    let shioPick = []; 
    while(shioPick.length < 3) { 
        let s = shios[Math.floor(rng() * shios.length)]; 
        if(!shioPick.includes(s)) shioPick.push(s); 
    }
    res += `COLOK SHIO ${shioPick.join(' / ')}\n`;
    
    const tw1 = bbfsArr[0], tw2 = bbfsArr[1], tw3 = bbfsArr[2];
    res += `TWIN ${tw1}${tw1} ${tw2}${tw2} ${tw3}${tw3}\n`;
    res += `Selalu Utamakan Prediksi Sendiri\n\n`;
    return res;
}

function updateTampilan(tipe) {
    const val = document.getElementById('sel' + tipe).value;
    const box = document.getElementById('box' + tipe);
    const offset = (tipe === 'HariIni') ? 0 : 1;
    box.innerText = (val === "SEMUA") ? LIST_PASARAN.map(p => generateData(p, offset)).join('') : generateData(val, offset);
}

function salin(boxId, btnId) {
    const teks = document.getElementById(boxId).innerText;
    navigator.clipboard.writeText(teks).then(() => {
      const btn = document.getElementById(btnId);
      btn.innerText = "BERHASIL DISALIN";
      btn.style.backgroundColor = "#28a745"; 
      setTimeout(() => { 
        btn.innerText = "SALIN PREDIKSI"; 
        btn.style.backgroundColor = ""; 
      }, 1500);
    });
}

window.onload = () => {
    const s1 = document.getElementById('selHariIni');
    const s2 = document.getElementById('selBesok');
    LIST_PASARAN.forEach(p => { 
        s1.add(new Option(p, p)); 
        s2.add(new Option(p, p)); 
    });
    updateTampilan('HariIni'); 
    updateTampilan('Besok');
};
