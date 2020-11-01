setgame("800x600");

//file gambar yang dipakai dalam game
var gambar = {
	deck:"card-deck.png",
	cards:"cards.png",
	judul:"judul-cocokan-gambar.png",
	menang:"menang.png"
}
//file suara yang dipakai dalam game
var suara = {	
}

//load gambar dan suara lalu jalankan aturGame
loading(gambar, suara, aturGame);

function aturGame(){		
	//atur jumlah gambar maksimal yang bisa muncul
	game.kartuMax = 10;
	//atur jumlah kartu di layar (misal 20 kartu)
	game.kartuX = 5;
	game.kartuY = 4;
	//seting kartu
	game.kartuBenar = 0;
	game.jumlahKartu = game.kartuX*game.kartuY;
	game.kartuDB = [];
	var jenisKartu = 0;
	for (var i = 1; i<=game.jumlahKartu/2; i++){
		jenisKartu++;
		if (jenisKartu>game.kartuMax) jenisKartu = 1;
		//buat objek baru untuk menyimpan data kartu
		var card = {};
		//pengaturan ukuran gambar kartu
		card.lebar = 128;
		card.tinggi = 128;
		card.jenisKartu = jenisKartu;
		//status kartu 0 = tertutup 1=terbuka 2=flip buka 3=flip tutup
		card.stat = 0;
		game.kartuDB.push(card);
		//buat kartu kedua dengan data yang sama, karena pasti ada 2 kartu yang sama
		var card2 = {};
		card2.lebar = 128;
		card2.tinggi = 128;
		card2.jenisKartu = jenisKartu;
		card2.stat = 0;
		game.kartuDB.push(card2);
	}

	//acak kartu
	game.kartuDB = acakArray(game.kartuDB);

	//tambahkan data gambar kartu tertutup
	dek = {img:dataGambar.deck, lebar:128, tinggi:128}
	game.kartuTerbuka = 0;
	//setelah kartu diacak, ditampilkan tampilkan judul game
	game.mulai = false;
	game.menang = false;
	jalankan(judul);
}

function judul(){	
	//menampilkan judul game
	hapusLayar("#0784a9");
	latar(dataGambar.cards, 1,1);
	efekMasuk("judul", dataGambar.judul, game.lebar/2, game.tinggi/2-50, "kiri");
	teks("Klik untuk memulai permainan", game.lebar/2, game.tinggi/2, "15-tengah-putih|biru-kedip");
	if (game.mouseDitekan && !game.mulai){
		game.mulai = true;
		game.mouseDitekan = false;
		jalankan(gameLoop);
	}
}

function menang(){	
	efekMasuk("judul2", dataGambar.judul, game.lebar/2, game.tinggi/2-50, "kanan");
	efekMasuk("menang", dataGambar.menang, game.lebar/2, game.tinggi/2+50, "kiri");
	teks("Klik untuk mengulang", game.lebar/2, game.tinggi/2+100, "15-tengah-putih|biru-kedip");
	if (game.mouseDitekan && game.mulai){
		game.mulai = false;
		game.mouseDitekan = false;
		aturGame();
	}
}

function gameLoop(){
	hapusLayar();
	//tampilkan kartu via for 2 tingkat
	for (var i=0;i<game.kartuX;i++){
		for (var j=0;j<game.kartuY;j++){
			//pengaturan gambar kartu
			var id = i*game.kartuY+j;
			var card = game.kartuDB[id];
			if (card.stat == 0) {
				card.img = dataGambar.deck;
				card.frame = 1;
			}else if (card.stat == 1){
				card.img = dataGambar.cards;
				card.frame = card.jenisKartu;
			}		
			card.id = id;
			//berikan jarak  pixel antar kartu
			card.x = 140+i*(card.lebar+5);
			card.y = 100+j*(card.tinggi+5);					
			if (card.stat<2) sprite(card);	
			if (card.stat == 2) flip(card);
			if (card.stat == 3) flipBalik(card);
			//deteksi jika di klik
			if (game.mouseDitekan && game.kartuTerbuka<2){
				if (cekHit(game.mouse, card) && card.stat == 0 ){
					card.stat = 2;
					game.kartuTerbuka++;
					if (game.kartuTerbuka == 1) game.kartu1 = card;
					if (game.kartuTerbuka == 2) game.kartu2 = card;
					card.buka = 1;
					card.skalaX = 1;
					//waktu untuk menunggu jika kartu tidak cocok
					game.timer = 200;
				}
			}
			cekKartu();			
		}
	}	
	if (game.menang) menang();
}

function flip(card){
	card.buka++;
	//efek balik kartu
	if (card.buka<10){
		card.img = dataGambar.deck;	
		card.skalaX-=0.1;
		if (card.skalaX <=0) card.buka = 10;
	}else if (card.buka>=10 && card.buka < 20){
		card.img = dataGambar.cards;
		card.frame = card.jenisKartu;
		card.skalaX+=0.1;
		if (card.skalaX > 1) card.buka = 20;
	}else if (card.buka >= 20){
		card.skalaX = 1;
		card.img = dataGambar.cards;
		card.frame = card.jenisKartu;
		//kartu terbuka 		
		card.stat = -1;					
	}
	sprite(card);
}

function flipBalik(card){
	card.buka++;
	//efek balik kartu
	if (card.buka<10){
		card.img = dataGambar.cards;
		card.frame = card.jenisKartu;		
		card.skalaX-=0.1;
		if (card.skalaX <=0) card.buka = 10;
	}else if (card.buka>=10 && card.buka < 20){
		card.img = dataGambar.deck;
		card.frame = 1;
		card.skalaX+=0.1;
		if (card.skalaX > 1) card.buka = 20;
	}else if (card.buka >= 20){
		card.skalaX = 1;
		card.img = dataGambar.deck;
		card.frame = card.jenisKartu;
		//kartu tertutup
		card.stat = 0;
		game.kartuTerbuka=0;
	}
	sprite(card);
}

function cekKartu(){
	//pastikan semua kartu sudah terbuka sempurna
	if (game.kartuTerbuka == 2 && game.kartu1.stat == -1 && game.kartu2.stat == -1){		
		if (game.kartu1.jenisKartu == game.kartu2.jenisKartu){
			//pilihan kartu benar
			game.kartuBenar+=2;
			game.kartuTerbuka = 0;
			//menang
			if (game.kartuBenar>=game.jumlahKartu){
				//permainan selesai dan menang
				game.menang = true;
			}				
		}else{
			//tunggu sesaat untuk menutup kembali
			game.timer--;			
			if (game.timer == 0){
				game.kartu1.stat = 3;
				game.kartu2.stat = 3;
				game.kartu1.buka = 1;
				game.kartu2.buka = 1;					
			}
		}
	}
}
