<?php
session_start();

// -- Contrôle d'accès : seulement les enseignants --
if (!isset($_SESSION["username"]) || $_SESSION["role"] !== "teacher") {
    header("Location: /../login.php");
    exit;
}

$username = $_SESSION["username"];
$prenom = "";
$nom = "";

// --- Helpers ---
function e($s) { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
function load_json_or_default($path, $default) {
    if (file_exists($path)) {
        $d = json_decode(file_get_contents($path), true);
        if (is_array($d)) return $d;
    }
    return $default;
}
function save_json_atomic($path, $data) {
    $tmp = $path . '.tmp';
    file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
    rename($tmp, $path);
}

// --- Lecture users.txt pour prénom/nom ---
$usersFile = __DIR__ . "/../data/users.txt";
if (file_exists($usersFile)) {
    $lines = file($usersFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (preg_match('/-\s*([^:]+):[^:]+:(.+)$/', $line, $m)) {
            $u = trim($m[1]);
            if ($u === $username) {
                $parts = explode(" - ", $line, 2);
                $namePart = trim($parts[0] ?? "");
                $nameParts = preg_split('/\s+/', $namePart, 2);
                $prenom = $nameParts[0] ?? "";
                $nom = $nameParts[1] ?? "";
                break;
            }
        }
    }
}

// --- Permissions de l'utilisateur ---
$permissionsFile = __DIR__ . "/../data/json/permissions.json";
$permissions = file_exists($permissionsFile) ? json_decode(file_get_contents($permissionsFile), true) : [];
$canChangeNotes = $permissions[$username]['changer_notes'] ?? true;
$canUseTools = $permissions[$username]['utiliser_outils'] ?? true;

// --- Chargements de données ---
$teacherClasses = load_json_or_default(__DIR__ . "/../data/json/teacher_classes.json", [
    // exemple : attribuer 1 classe à cet enseignant si fichier absent
    $username => [
        "Mathématiques Avancées" => ["eleves" => ["alice","bob","charlie"]],
    ]
]);
$assignments = load_json_or_default(__DIR__ . "/../data/json/assignments.json", [
    ["title"=>"Dissertation Français","due"=>"Demain","author"=>"Prof. Exemple"]
]);
$messages = load_json_or_default(__DIR__ . "/../data/json/messages.json", [
    ["from"=>"Administration", "text"=>"Rappel réunion pédagogique", "time"=>"Hier"]
]);
$studentNotes = load_json_or_default(__DIR__ . "/../data/json/student_notes.json", [
    // structure : username => [ ["course","grade","coef"]... ]
    "alice" => [["course"=>"Mathématiques Avancées","grade"=>"15/20","coef"=>3]]
]);

// --- Traitements POST ---
$feedback = "";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ajouter un devoir
    if (!empty($_POST['new_assignment_title']) && !empty($_POST['new_assignment_due'])) {
        $title = substr(trim($_POST['new_assignment_title']), 0, 200);
        $due = substr(trim($_POST['new_assignment_due']),0,100);
        $assignments[] = ["title"=>$title, "due"=>$due, "author"=>$prenom . " " . $nom];
        save_json_atomic(__DIR__ . "/../data/json/assignments.json", $assignments);
        $feedback = "Devoir ajouté.";
    }

    // Envoyer un message
    if (!empty($_POST['msg_text'])) {
        $text = substr(trim($_POST['msg_text']),0,500);
        $messages[] = ["from"=>$prenom . " " . $nom, "text"=>$text, "time"=>"À l'instant"];
        save_json_atomic(__DIR__ . "/../data/json/messages.json", $messages);
        $feedback = "Message envoyé.";
    }

    // Ajouter/modifier note d'un élève (si autorisé)
    if (!empty($_POST['note_student']) && isset($_POST['note_course']) && isset($_POST['note_grade']) && $canChangeNotes) {
        $s = preg_replace('/[^a-zA-Z0-9_\-]/','',$_POST['note_student']);
        $course = substr(trim($_POST['note_course']),0,120);
        $grade = substr(trim($_POST['note_grade']),0,20);
        $coef = (int)($_POST['note_coef'] ?? 1);
        if (!isset($studentNotes[$s])) $studentNotes[$s] = [];
        // On ajoute la note
        $studentNotes[$s][] = ["course"=>$course,"grade"=>$grade,"coef"=>$coef];
        save_json_atomic(__DIR__ . "/../data/json/student_notes.json", $studentNotes);
        $feedback = "Note enregistrée pour " . e($s) . ".";
    }
}

// --- Récupère les classes de cet enseignant (ou exemple) ---
$myClasses = $teacherClasses[$username] ?? $teacherClasses[array_keys($teacherClasses)[0]] ?? [];

?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Espace Enseignant - Polycademia</title>
<link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");
*{box-sizing:border-box;margin:0;padding:0;font-family:"Poppins",sans-serif}
body{min-height:100vh;background:linear-gradient(135deg,#8ec5ff 0%,#6a92ff 100%);color:#fff;overflow-x:hidden;}
.dashboard{min-height:100vh;padding:28px 20px 140px}
.header{text-align:center;margin-bottom:22px}
.welcome-title{font-size:2.2rem;font-weight:700;color:#fff;margin:0;text-shadow:0 2px 6px rgba(0,0,0,0.15)}
.user-name{font-size:1rem;color:#fff;margin-top:8px;opacity:0.95}

/* Grid */
.main-content{max-width:1200px;margin:18px auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;padding:0 12px}

/* Card glass (light variation) */
.card{position:relative;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:18px;box-shadow:0 8px 28px rgba(0,0,0,0.12);color:#fff}
.card-title{font-size:1.1rem;font-weight:600;display:flex;align-items:center;gap:10px;margin-bottom:10px}

/* Buttons */
.btn{display:inline-block;padding:10px 14px;border-radius:12px;background:#fff;color:#333;font-weight:700;border:none;cursor:pointer}
.small{padding:6px 8px;border-radius:8px;font-size:.9rem}
.input,textarea,select{width:100%;padding:8px;margin-top:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.03);color:#fff}
.small-muted{font-size:.9rem;opacity:0.9}
.feedback{margin-top:10px;padding:8px;background:rgba(0,0,0,0.2);border-radius:8px}
</style>
</head>
<body>
<div class="dashboard">
  <div class="header">
    <h1 class="welcome-title">Espace Enseignant — Polycademia</h1>
    <p class="user-name"><?= e("$prenom $nom") ?> — <em><?= e($username) ?></em></p>
  </div>

  <div class="main-content">
    <!-- Mes classes -->
    <div class="card">
      <div class="card-title"><i class="bx bx-book"></i> Mes classes</div>
      <?php if (!empty($myClasses) && is_array($myClasses)): ?>
        <?php foreach($myClasses as $className => $meta): ?>
          <div style="margin-bottom:10px;border-bottom:1px dashed rgba(255,255,255,0.06);padding-bottom:8px">
            <strong><?= e($className) ?></strong>
            <div class="small-muted">Élèves : <?= e(implode(", ", $meta['eleves'] ?? [])) ?></div>
          </div>
        <?php endforeach; ?>
      <?php else: ?>
        <p>Aucune classe assignée.</p>
      <?php endif; ?>
    </div>

    <!-- Notes des élèves -->
    <div class="card">
      <div class="card-title"><i class="bx bx-edit"></i> Gérer les notes</div>
      <p class="small-muted">Permission de modifier : <strong><?= $canChangeNotes ? 'Autorisé ✅' : 'Refusé ❌' ?></strong></p>
      <?php if ($canChangeNotes): ?>
        <form method="POST">
          <label>Nom d'utilisateur de l'élève :</label>
          <input class="input" name="note_student" placeholder="ex : alice" required>
          <label>Cours :</label>
          <input class="input" name="note_course" placeholder="ex : Mathématiques Avancées" required>
          <label>Note :</label>
          <input class="input" name="note_grade" placeholder="ex : 14/20" required>
          <label>Coef :</label>
          <input class="input" name="note_coef" type="number" value="1" min="1" max="10" required>
          <button class="btn" type="submit" style="margin-top:10px">Enregistrer la note</button>
        </form>
      <?php else: ?>
        <p>Tu n'as pas la permission d'éditer les notes. Demande au directeur.</p>
      <?php endif; ?>
    </div>

    <!-- Poster un devoir -->
    <div class="card">
      <div class="card-title"><i class="bx bx-clipboard"></i> Poster un devoir</div>
      <form method="POST">
        <label>Titre :</label>
        <input class="input" name="new_assignment_title" maxlength="200" required>
        <label>Échéance :</label>
        <input class="input" name="new_assignment_due" maxlength="100" required>
        <button class="btn" type="submit" style="margin-top:8px">Publier</button>
      </form>
    </div>

    <!-- Messages -->
    <div class="card">
      <div class="card-title"><i class="bx bx-message"></i> Messages</div>
      <?php foreach(array_reverse($messages) as $m): ?>
        <div style="margin-bottom:8px"><strong><?= e($m['from']) ?>:</strong> <?= e($m['text']) ?> <em style="opacity:.8">(<?= e($m['time']) ?>)</em></div>
      <?php endforeach; ?>
      <form method="POST" style="margin-top:8px">
        <label>Envoyer un message :</label>
        <textarea class="input" name="msg_text" rows="3" maxlength="500"></textarea>
        <button class="btn" type="submit" style="margin-top:8px">Envoyer</button>
      </form>
    </div>

    <!-- Outils -->
    <div class="card">
      <div class="card-title"><i class="bx bx-happy-heart-eyes"></i> Outils</div>
      <p class="small-muted">Accès aux outils spéciaux : <strong><?= $canUseTools ? 'Oui' : 'Non' ?></strong></p>
      <button class="btn small <?= $canUseTools ? '' : 'disabled' ?>" <?= $canUseTools ? '' : 'disabled' ?> onclick="alert('Accès aux outils')">Accéder aux outils</button>
    </div>
  </div>

  <?php if ($feedback): ?>
    <div style="max-width:1200px;margin:12px auto;padding:12px" class="feedback"><?= e($feedback) ?></div>
  <?php endif; ?>
</div>

<!-- Bottom bar similar to student but color matched -->
<div style="position:fixed;bottom:20px;left:30px;display:flex;align-items:center;gap:12px;">
  <div style="width:68px;height:68px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,0.15);cursor:pointer" onclick="window.location.href='index.php'">
    <img src="https://i.ibb.co/cKjh6W5r/Polycademia.png" style="width:56%;height:56%">
  </div>
  <button onclick="window.location.href='/../logout.php'" class="btn small">Déconnexion</button>
</div>
</body>
</html>