<?php
session_start();

if (!isset($_SESSION["username"])) {
    header("Location: ../data/php/schools.php");
    exit;
}

$username = $_SESSION["username"];
?>

<!DOCTYPE html>
<html lang="fr">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Logiciels - Polycademia</title>

<link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">

<style>

@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:"Poppins",sans-serif;
}

body{
    min-height:100vh;
    background:linear-gradient(135deg,#f4a47b 0%,#f67c1e 100%);
    color:white;
    padding:30px;
}

/* TITRE */

.page-title{
    text-align:center;
    margin-bottom:40px;
}

.page-title h1{
    font-size:2.8rem;
    margin-bottom:10px;
}

.page-title p{
    opacity:0.9;
}

/* GRID */

.apps-grid{
    max-width:1200px;
    margin:auto;

    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:25px;
}

/* CARTES */

.app-card{

    background:rgba(255,255,255,0.12);

    border:1px solid rgba(255,255,255,0.2);

    border-radius:25px;

    padding:30px;

    text-align:center;

    cursor:pointer;

    transition:0.3s ease;

    backdrop-filter:blur(12px);

    box-shadow:0 8px 30px rgba(0,0,0,0.15);
}

.app-card:hover{

    transform:translateY(-10px) scale(1.03);

    background:rgba(255,255,255,0.2);
}

.app-card img{

    width:140px;
    height:140px;

    object-fit:contain;

    margin-bottom:18px;

    transition:transform 0.3s ease;
}

.app-card:hover img{

    transform:scale(1.08);
}

.app-card h2{

    font-size:1.4rem;
    margin-bottom:10px;
}

.app-card p{

    font-size:0.95rem;
    opacity:0.9;
}

/* ZONE DYNAMIQUE */

#app-container{

    max-width:1200px;

    margin:40px auto 0;

    animation:fadeIn .4s ease;
}

@keyframes fadeIn{

    from{
        opacity:0;
        transform:translateY(10px);
    }

    to{
        opacity:1;
        transform:translateY(0);
    }
}

/* BOUTON */

.back-btn{

    position:fixed;

    top:20px;
    left:20px;

    background:white;

    color:#f67c1e;

    border:none;

    padding:12px 20px;

    border-radius:50px;

    font-weight:700;

    cursor:pointer;
}

.card{
    background:rgba(255,255,255,0.12);
    padding:25px;
    border-radius:20px;
    border:1px solid rgba(255,255,255,0.2);
}

.btn{
    padding:12px 18px;
    border:none;
    border-radius:12px;
    background:white;
    color:#f67c1e;
    font-weight:700;
    cursor:pointer;
}

</style>

</head>

<body>

<button class="back-btn"
onclick="window.location.href='student.php'">

← Retour

</button>

<div class="page-title">

    <h1>Logiciels Polycademia</h1>

    <p>
        Toutes les applications intelligentes réunies au même endroit.
    </p>

</div>

<!-- APPLICATIONS -->

<div class="apps-grid">

    <!-- POLYXAMS -->

    <div class="app-card"
    onclick="loadApp('polyxams')">

        <img src="https://i.ibb.co/Z1W0NxTx/Polymail-LOGO.png">
      
      <h2>Polymail</h2>

        <p>
            Messagerie chifrée de bout en bout.
        </p>

    </div>

    <!-- POLYSLIDES -->

    <div class="app-card">

        <img src="https://i.ibb.co/3yk5tptp/Polydrive-LOGO.png">
      
      <h2>Polydrive</h2>

        <p>
            Stockage cloud sécurisé 100%.
        </p>

    </div>

    <!-- POLYDRIVE -->

    <div class="app-card">

        <img src="https://i.ibb.co/Jjy6nkdx/Polycanva-LOGO.png">

      <h2>Polycanva</h2>
   
        <p>
            Création diaporama, note & docuemnt collaboratifs.
        </p>

    </div>

    <!-- POLYCALC -->

    <div class="app-card">

        <img src="https://i.ibb.co/NgtsdRY6/polyxams-logo.png">

        <h2>Polyxams</h2>

        <p>
            Exercices, astuces & leçons automatisée pour les révisions.
        </p>

    </div>
  
    <div class="app-card">

        <img src="https://i.ibb.co/Y4983WZ3/Num-Works-LOGO.png">

        <h2>NumWorks</h2>

        <p>
            Calculatrice intelligente.
        </p>

    </div>
  
    <div class="app-card">

        <img src="https://i.ibb.co/XfRH6kj8/Geogebra-LOGO.png">

        <h2>Geogebra</h2>

        <p>
            Geométrie au complet.
        </p>

    </div>
  
    <div class="app-card">

        <img src="https://i.ibb.co/v6bKFHWg/Polygames-LOGO.png">

        <h2>Polygame</h2>

        <p>
            Jeux éducatifs et amusantes.
        </p>

    </div>

    <div class="app-card">

        <img src="https://i.ibb.co/hF2fcjJc/Polycodes-LOGO.png">
      
      <h2>Polycodes</h2>

        <p>
            
        </p>

    </div>
  
</div>

<!-- CONTENU DYNAMIQUE -->

<div id="app-container"></div>

<script>

/* =========================
   CHARGEMENT D'APPLICATIONS
========================= */

async function loadApp(appName){

    const container =
    document.getElementById("app-container");

    container.innerHTML = `
        <div class="card">
            Chargement...
        </div>
    `;

    try{

        const response =
        await fetch(`apps/${appName}/index.php`);

        const html =
        await response.text();

        container.innerHTML = html;

        container.scrollIntoView({
            behavior:"smooth"
        });

    }catch(error){

        container.innerHTML = `
            <div class="card">
                ❌ Impossible de charger l'application.
            </div>
        `;
    }
}

</script>

</body>
</html>
