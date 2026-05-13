<?php
session_start();

// --- Contrôle d'accès : seulement les étudiants ---
if (!isset($_SESSION["username"]) || $_SESSION["role"] !== "student") {
    header("Location: ../data/php/schools.php");
    exit;
}

$username = $_SESSION["username"];
$prenom = "";
$nom = "";

// --- Lecture du fichier users.txt pour récupérer prénom et nom ---
$usersFile = __DIR__ . "/../data/user.txt";
if (file_exists($usersFile)) {
    $lines = file($usersFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (preg_match('/-\s*([^:]+):[^:]+:(.+)$/', $line, $m)) {
            $u = trim($m[1]);
            if ($u === $username) {
                $parts = explode(" - ", $line, 2);
                if (count($parts) >= 1) {
                    $namePart = trim($parts[0]);
                    $nameParts = preg_split('/\s+/', $namePart, 2);
                    $prenom = $nameParts[0] ?? "";
                    $nom = $nameParts[1] ?? "";
                }
                break;
            }
        }
    }
}

// --- Permissions ---
$permissionsFile = __DIR__ . "/../data/json/authorizations.json";
$permissions = file_exists($permissionsFile)
    ? json_decode(file_get_contents($permissionsFile), true)
    : [];

$canChangeNotes = $permissions[$username]['changer_notes'] ?? false;
$canUseTools    = $permissions[$username]['utiliser_outils'] ?? true;

// --- Chargement des données ---
function load_json_or_default($path, $default) {
    if (file_exists($path)) {
        $data = json_decode(file_get_contents($path), true);
        if (is_array($data)) return $data;
    }
    return $default;
}

$notes = load_json_or_default(__DIR__ . "/../data/json/notes.json", [
    ["course"=>"Mathématiques Avancées", "grade"=>"14/20", "coef"=>4],
    ["course"=>"Français", "grade"=>"16/20", "coef"=>3],
    ["course"=>"Physique", "grade"=>"12/20", "coef"=>3]
]);

$assignments = load_json_or_default(__DIR__ . "/../data/json/assignments.json", [
    ["title"=>"Dissertation Français", "due"=>"Demain"],
    ["title"=>"Exercices Maths", "due"=>"Vendredi"],
    ["title"=>"Exposé Histoire", "due"=>"Lundi"]
]);

$messages = load_json_or_default(__DIR__ . "/../data/json/messages.json", [
    ["from"=>"Prof. Martin", "text"=>"Cours annulé demain", "time"=>"Il y a 2h"],
    ["from"=>"Administration", "text"=>"Nouveau planning disponible", "time"=>"Hier"]
]);

$courses = load_json_or_default(__DIR__ . "/../data/json/courses.json", [
    ["name"=>"Mathématiques Avancées", "progress"=>65],
    ["name"=>"Physique", "progress"=>40],
    ["name"=>"Anglais", "progress"=>92]
]);

function e($s) { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Espace Étudiant - Polycademia</title>
<link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");
*{
    box-sizing:border-box;
    margin:0;
    padding:0;
    font-family:"Poppins",sans-serif
}

body{
    min-height:100vh;
    background:linear-gradient(135deg,#f4a47b 0%,#f67c1e 100%);
    color:#fff;
    overflow-x:hidden;
}

.dashboard{
    min-height:100vh;
    padding:28px 20px 140px
}

.header{
    text-align:center;
    margin-bottom:22px
}

.welcome-title{
    font-size:2.4rem;
    font-weight:700;
    color:#fff;
    margin:0;
    text-shadow:0 2px 4px rgba(0,0,0,0.12)
}
.student-name{
    font-size:1.1rem;
    color:#fff;
    margin:10px 0 0;
    opacity:0.95
}

/* Main grid */
.main-content{
    max-width:1200px;
    margin:18px auto;
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
    gap:18px;
    padding:0 12px
}

/* Effet glass */
.liquidGlass-wrapper{
    position:relative;
    overflow:hidden;
    border-radius:18px;
    transition:transform .3s ease,box-shadow .3s ease
}

.liquidGlass-wrapper:hover{
    transform:translateY(-5px);
    box-shadow:0 10px 30px rgba(0,0,0,0.2)
}

.liquidGlass-effect{
    position:absolute;
    inset:0;
    backdrop-filter:blur(3px);
    z-index:0
}

.liquidGlass-tint{
    position:absolute;
    inset:0;
    background:rgba(255,255,255,0.15);
    z-index:1
}

.liquidGlass-shine{
    position:absolute;
    inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,0.4)0%,rgba(255,255,255,0.1)50%,transparent 100%);
    z-index:2
}

.card{
    position:relative;
    z-index:3;
    background:rgba(255,255,255,0.1);
    border:1px solid rgba(255,255,255,0.2);
    border-radius:14px;
    padding:18px;
    box-shadow:0 8px 32px rgba(0,0,0,0.12);
    color:#fff
}
.card-title{
    font-size:1.2rem;
    font-weight:600;
    display:flex;
    align-items:center;
    gap:10px;
    margin-bottom:10px
}
.card-icon{
    width:20px;
    height:20px;
    fill:white
}

/* Progress */
.progress-bar{
    width:100%;
    height:8px;
    background:rgba(255,255,255,0.12);
    border-radius:6px;
    overflow:hidden
}

.progress-fill{
    height:100%;
    background:linear-gradient(90deg,#fff,rgba(255,255,255,0.7));
    transition:width .3s ease
}

/* Bottom bar fixed */
.bottom-bar{
  position:fixed;
  bottom:20px;
  left:30px;
  display:flex;
  align-items:center;
  gap:14px;
  z-index:3000;
}
.logo{
  width:70px;height:70px;border-radius:50%;
  background:rgba(246,124,30,0.95);
  border:1px solid rgba(255,255,255,0.2);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 14px rgba(0,0,0,0.25);
  cursor:pointer;
  transition:transform .3s;
  z-index:3100;
}

.logo:hover{
    transform:scale(1.08);
}

.logo img{
    width:60%;
    height:60%;
    object-fit:contain;
}

.nav-btn{
  background:rgba(246,124,30,0.9);
  border:1px solid rgba(255,255,255,0.3);
  border-radius:50px;
  color:white;padding:12px 26px;font-weight:600;
  opacity:0;transform:translateY(40px) scale(0.8);
  transition:all .4s ease;
  pointer-events:none;
  z-index:3200;
}
.nav-btn.show{
    opacity:1;
    transform:translateY(0) scale(1);
    pointer-events:auto;
}

.nav-btn:nth-child(2){transition-delay:.05s;}
.nav-btn:nth-child(3){transition-delay:.1s;}
.nav-btn:nth-child(4){transition-delay:.15s;}
.nav-btn:nth-child(5){transition-delay:.2s;}

.btn{
    display:inline-block;
    padding:10px 14px;
    border-radius:20px;
    background:#fff;
    color:#333;
    font-weight:700;
    border:none;
    cursor:pointer
}

.btn:disabled{
    background:#ddd;
    color:#888;
    cursor:not-allowed
}
/* =========================
   APPLICATIONS POLYCADEMIA
========================= */

.apps-grid{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
    gap:18px;
    margin-top:20px;
}

.app-box{
    background:rgba(255,255,255,0.1);
    border:1px solid rgba(255,255,255,0.15);
    border-radius:18px;
    padding:20px;
    text-align:center;
    cursor:pointer;
    transition:0.3s ease;
    backdrop-filter:blur(10px);
}

.app-box:hover{
    transform:translateY(-6px) scale(1.03);
    background:rgba(255,255,255,0.2);
}

.app-box img{
    width:70px;
    height:70px;
    object-fit:contain;
    margin-bottom:12px;
}

.app-box span{
    color:white;
    font-size:1rem;
    font-weight:600;
}

/* Zone dynamique */

#dynamic-app{
    max-width:1200px;
    margin:30px auto;
    padding:0 12px;
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
</style>
</head>
<body>
<div class="dashboard">
  <div class="header">
    <h1 class="welcome-title">Bienvenue sur Polycademia 👨‍🎓</h1>
    <p class="student-name"><?= e("$prenom $nom") ?></p>
  </div>

  <div class="main-content">
    <!-- Cours -->
    <div class="liquidGlass-wrapper"><div class="liquidGlass-effect"></div><div class="liquidGlass-tint"></div><div class="liquidGlass-shine"></div>
      <div class="card">
        <h2 class="card-title"><img src="https://i.ibb.co/NdNYpkF4/cours-dashboard.png" alt="cours-dashboard" width="30"> Cours actuel</h2>
        <p><?= e($courses[0]['name'] ?? 'Aucun cours') ?></p>
        <div class="progress-bar"><div class="progress-fill" style="width:<?= (int)($courses[0]['progress'] ?? 0) ?>%"></div></div>
        <p>Progression : <?= e($courses[0]['progress'] ?? 0) ?>%</p>
      </div>
    </div>

    <!-- Notes -->
    <div class="liquidGlass-wrapper"><div class="liquidGlass-effect"></div><div class="liquidGlass-tint"></div><div class="liquidGlass-shine"></div>
      <div class="card">
        <h2 class="card-title"><img src="https://i.ibb.co/gM99T1MH/notes-dashboard-removebg-preview.png" alt="notes-dashboard-removebg-preview" width="30"> Mes notes</h2>
        <?php foreach($notes as $n): ?>
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding:6px 0;">
            <span><?= e($n['course']) ?></span><strong><?= e($n['grade']) ?></strong>
          </div>
        <?php endforeach; ?>
        <button class="btn" onclick="showMessage('Modifier les notes')" <?= $canChangeNotes ? '' : 'disabled' ?>>Modifier mes notes</button>
      </div>
    </div>

    <!-- Devoirs -->
    <div class="liquidGlass-wrapper"><div class="liquidGlass-effect"></div><div class="liquidGlass-tint"></div><div class="liquidGlass-shine"></div>
      <div class="card">
        <h2 class="card-title" ><img src="https://i.ibb.co/B5qCd8tb/homework-dashboard.png" alt="homework-dashboard" width="30"> Devoirs à rendre</h2>
        <?php foreach($assignments as $a): ?>
          <div style="display:flex;justify-content:space-between;padding:6px 0;">
            <span><?= e($a['title']) ?></span><span><?= e($a['due']) ?></span>
          </div>
        <?php endforeach; ?>
      </div>
    </div>

    <!-- Messages -->
    <div class="liquidGlass-wrapper"><div class="liquidGlass-effect"></div><div class="liquidGlass-tint"></div><div class="liquidGlass-shine"></div>
      <div class="card">
        <h2 class="card-title"><img src="https://i.ibb.co/W4vnRFG5/message-dashboard-removebg-preview.png" alt="message-dashboard-removebg-preview" width="30"> Messages récents</h2>
        <?php foreach($messages as $m): ?>
          <div style="margin-bottom:6px;"><strong><?= e($m['from']) ?> :</strong> <?= e($m['text']) ?> <em>(<?= e($m['time']) ?>)</em></div>
        <?php endforeach; ?>
      </div>
    </div>

    <!-- Outils spéciaux -->
    <div class="liquidGlass-wrapper"><div class="liquidGlass-effect"></div><div class="liquidGlass-tint"></div><div class="liquidGlass-shine"></div>
      <div class="card">
        <h2 class="card-title"><img src="https://i.ibb.co/0V2f5RmP/outils-dashboard.png" alt="outils-dashboard" width="30"> Outils spéciaux</h2>
        <button class="btn" onclick="showMessage('Accéder aux outils')" <?= $canUseTools ? '' : 'disabled' ?>>Accéder</button>
      </div>
    </div>

    <!-- Permissions -->
    <div class="liquidGlass-wrapper"><div class="liquidGlass-effect"></div><div class="liquidGlass-tint"></div><div class="liquidGlass-shine"></div>
      <div class="card">
        <h2 class="card-title"><img src="https://i.ibb.co/RT6rL5s0/cadenas-dashboard-removebg-preview.png" alt="cadenas-dashboard-removebg-preview" width="30"> Permissions</h2>
        <p>Changer les notes : <strong style="color:<?= $canChangeNotes ? '#8ef0b0' : '#ffb3b3' ?>"><?= $canChangeNotes ? 'Autorisé ✅' : 'Refusé ❌' ?></strong></p>
        <p>Utiliser outils spéciaux : <strong style="color:<?= $canUseTools ? '#8ef0b0' : '#ffb3b3' ?>"><?= $canUseTools ? 'Autorisé ✅' : 'Refusé ❌' ?></strong></p>
      </div>
    </div>
  </div>
</div>

<!-- Applications Polycademia -->
<div class="liquidGlass-wrapper">

  <div class="liquidGlass-effect"></div>
  <div class="liquidGlass-tint"></div>
  <div class="liquidGlass-shine"></div>

  <div class="card">

    <h2 class="card-title">
      🚀 Applications Polycademia
    </h2>

    <p style="margin-bottom:15px;">
      Accède aux fonctionnalités intelligentes de Polycademia.
    </p>

    <div class="apps-grid">

      <!-- POLYXAMS -->
      <div class="app-box" onclick="loadApp('polyxams')">

        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png">

        <span>Polyxams</span>

      </div>

      <!-- FUTURES APPLICATIONS -->

      <div class="app-box">

        <img src="https://cdn-icons-png.flaticon.com/512/1828/1828919.png">

        <span>PolySlides</span>

      </div>

      <div class="app-box">

        <img src="https://cdn-icons-png.flaticon.com/512/2920/2920277.png">

        <span>PolyDrive</span>

      </div>

      <div class="app-box">

        <img src="https://cdn-icons-png.flaticon.com/512/3079/3079165.png">

        <span>PolyCalc</span>

      </div>

    </div>

  </div>
</div>

<!-- BARRE DU BAS -->
<div class="bottom-bar">
  <div class="logo"><img src="https://i.ibb.co/cKjh6W5r/Polycademia.png" alt="Logo"></div>
  <button class="nav-btn" >Accueil</button>
  <button class="nav-btn" >Annonce</button>
  <button class="nav-btn" >Emploie du Temps</button>
  <button class="nav-btn" >Vie Scolaire</button>
  <button class="nav-btn" >Cours</button>
  <button class="nav-btn" >Logiciel</button>
  <button class="nav-btn" onclick="window.location.href='logout.php'">Déconnexion</button>
</div>

<script>
document.addEventListener("DOMContentLoaded",()=>{
  const logo=document.querySelector(".logo");
  const buttons=document.querySelectorAll(".nav-btn");
  let menuOpen=false;
  logo.addEventListener("click",()=>{
    menuOpen=!menuOpen;
    buttons.forEach((btn,i)=>{
      if(menuOpen){setTimeout(()=>btn.classList.add("show"),i*80);}
      else{setTimeout(()=>btn.classList.remove("show"),i*50);}
    });
  });
});
function showMessage(txt){
  const toast=document.createElement("div");
  toast.textContent=txt;
  toast.style.cssText="position:fixed;top:20px;right:20px;padding:12px 18px;background:rgba(246,124,30,0.95);color:white;border-radius:10px;font-weight:700;z-index:9999;";
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(),2000);
}
</script>
</body>
</html>
