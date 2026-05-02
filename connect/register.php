<?php
$success_message = "";
$error_message = "";

// Fichiers de stockage
$usersFile = __DIR__ . "/data/user.txt";
$permissionsFile = __DIR__ . "/data/json/authorizations.json";

// Fonction pour les permissions par défaut selon le rôle
function default_permissions($role) {
    switch($role) {
        case 'student':
            return ['changer_notes'=>false,'utiliser_outils'=>true];
        case 'teacher':
            return ['changer_notes'=>true,'utiliser_outils'=>true];
        case 'worker':
            return ['changer_notes'=>false,'utiliser_outils'=>true];
        case 'principal':
            return ['changer_notes'=>true,'utiliser_outils'=>true];
        default:
            return ['changer_notes'=>false,'utiliser_outils'=>false];
    }
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $prenom = trim($_POST['prenom'] ?? '');
    $nom = trim($_POST['nom'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $role = trim($_POST['role'] ?? '');

    if ($prenom === '' || $nom === '' || $password === '' || $role === '') {
        $error_message = "⚠️ Tous les champs sont obligatoires.";
    } elseif (preg_match("/[:\\r\\n]/", $prenom.$nom.$password.$role)) {
        $error_message = "⚠️ Caractères interdits détectés.";
    } else {
        // Génération du nom d'utilisateur
        $baseUser = strtolower(substr($prenom,0,2).".".preg_replace('/\s+/', '', $nom));
        $username = $baseUser;

        $userFolder = __DIR__ . "/data/users/" . $username;
        file_put_contents($userFolder . "/.htaccess", "Deny from all");
        if (!file_exists($userFolder)) {
            mkdir($userFolder, 0777, true);
            file_put_contents($userFolder . "/notes.json", json_encode([]));
            file_put_contents($userFolder . "/docs.json", json_encode([]));
            file_put_contents($userFolder . "/slides.json", json_encode([]));
            file_put_contents($userFolder . "/sheets.json", json_encode([]));
            file_put_contents($userFolder . "/calendar.json", json_encode([]));
            }

        // S'assurer de l'unicité
        $existingUsernames = [];
        if(file_exists($usersFile)){
            $lines = file($usersFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach($lines as $line){
                if(preg_match("/-\\s*([^:]+):/", $line, $m)){
                    $existingUsernames[] = trim($m[1]);
                }
            }
        }

        $suffix = 1;
        while(in_array($username, $existingUsernames)){
            $username = $baseUser.$suffix;
            $suffix++;
            if($suffix>1000){
                $error_message = "❌ Impossible de générer un identifiant unique.";
                break;
            }
        }

        // Écriture dans users.txt
        if($error_message === ""){
            $lineToWrite = "$prenom $nom - $username:$password:$role\n";
            $fp = @fopen($usersFile,"a");
            if($fp === false){
                $error_message = "❌ Impossible d'ouvrir users.txt pour écriture.";
            } else {
                if(flock($fp, LOCK_EX)){
                    fwrite($fp,$lineToWrite);
                    fflush($fp);
                    flock($fp, LOCK_UN);
                    fclose($fp);

                    // Ajouter automatiquement dans permissions.json
                    $permissions = [];
                    if(file_exists($permissionsFile)){
                        $permissions = json_decode(file_get_contents($permissionsFile), true) ?? [];
                    }
                    $permissions[$username] = default_permissions($role);
                    file_put_contents($permissionsFile, json_encode($permissions, JSON_PRETTY_PRINT));

                    $success_message = "<div style='text-align:center;'>
                        <p><strong>$prenom $nom</strong></p>
                        <p><strong>$username</strong> &nbsp;&nbsp; <em>$password</em></p>
                        <p style='margin-top:8px;color:#bcd;'>✅ Inscription réussie — votre identifiant est <b>$username</b></p>
                    </div>";
                } else {
                    fclose($fp);
                    $error_message = "❌ Impossible de verrouiller users.txt.";
                }
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Register Page</title>
<style>
@import url("https://fonts.goggleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap");
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Poppins", sans-serif;
}

body {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: url("https://i.ibb.co/My8bDG6g/360-F-867215296-TNno-PWXjsv642-J1-ZMRYQiz0-FIack0-Qe-T.jpg")no-repeat;
    background-size: cover;
    background-position: center;
}

.wrapper {
    width: 420px;
    background: transparent;
    border: 2px solid rgba(255, 255, 255, .2);
    backdrop-filter: blur(20px);
    box-shadow:  0 0 10px rgba(0, 0, 0, .2);
    color: #fff;
    border-radius: 10px;
    padding: 30px 40px;
}

.wrapper h1 {
    font-size: 36px;
    text-align: center;
}

.wrapper .input-box {
    position: relative;
    width: 100%;
    height: 50px;
    margin: 30px 0;
}

.input-box input {
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    border: 2px solid rgba(255, 255, 255, .2);
    border-radius: 40px;
    font-size: 16px;
    color: #fff;
    padding: 20px 45px 20px 20px;
}

.input-box input::placeholder {
    color: #fff;
}

.input-box i {
    position: absolute;
    right: 20px;
    top: 25px;
    transform: translateY(-50%);
    font-size: 20px;
}

.wrapper .remember-forgot {
    display: flex;
    justify-content: space-between;
    font-size: 14.5px;
    margin: -15px 0 15px;
}

.remember-forgot label input {
    accent-color: #fff;
    margin-right: 3px;
}

.remember-forgot a {
    color: #fff;
    text-decoration: none;
}

.remember-forgot a:hover {
    text-decoration: underline;
}

.wrapper .btn {
    width: 100%;
    height: 45px;
    background: #fff;
    border: none;
    outline: none;
    border-radius: 40px;
    box-shadow:  0 0 10px  rgba(0, 0, 0, .1);
    cursor: pointer;
    font-size: 16px;
    color: #333;
    font-weight: 600;
}

.wrapper .register-link {
    font-size: 14.5px;
    text-align: center;
    margin: 20px 0 15px;
}

.register-link p a {
    color: #fff;
    text-decoration: none;
    font-weight: 600;
}

.register-link p a:hover {
    text-decoration: underline;
}
</style>
</head>
<body>
<div class="wrapper">
<h1>Inscription</h1>

<?php if ($success_message !== ""): ?>
    <?= $success_message ?>
    <div style="text-align:center;margin-top:10px"><a href="login.php" style="color:#fff;text-decoration:underline">Se connecter</a></div>
<?php else: ?>
    <?php if ($error_message !== ""): ?>
        <div class="msg error"><?= htmlspecialchars($error_message) ?></div>
    <?php endif; ?>
    <form method="post" novalidate>
        <div class="input-box"><input type="text" name="prenom" placeholder="Prénom" required value="<?= isset($_POST['prenom'])?htmlspecialchars($_POST['prenom']):'' ?>"></div>
        <div class="input-box"><input type="text" name="nom" placeholder="Nom" required value="<?= isset($_POST['nom'])?htmlspecialchars($_POST['nom']):'' ?>"></div>
        <div class="input-box"><input type="password" name="password" placeholder="Mot de passe" required></div>
        <div class="input-box">
            <select name="role" required>
                <option value="">-- Choisissez un rôle --</option>
                <option value="student" <?= (isset($_POST['role']) && $_POST['role']==='student')?'selected':'' ?>>Étudiant</option>
                <option value="parent" <?= (isset($_POST['role']) && $_POST['role']==='parent')?'selected':'' ?>>Parent</option>
                <option value="teacher" <?= (isset($_POST['role']) && $_POST['role']==='teacher')?'selected':'' ?>>Enseignant</option>
                <option value="worker" <?= (isset($_POST['role']) && $_POST['role']==='worker')?'selected':'' ?>>Travailleur</option>
                <option value="principal" <?= (isset($_POST['role']) && $_POST['role']==='principal')?'selected':'' ?>>Directeur</option>
            </select>
        </div>
        <button type="submit" class="btn">S'inscrire</button>
        <div class="msg" style="margin-top:8px">Déjà un compte ? <a href="login.php" style="color:#fff;text-decoration:underline">Se connecter</a></div>
    </form>
<?php endif; ?>
</div>
</body>
</html>
