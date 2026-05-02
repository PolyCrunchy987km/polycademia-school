<?php
session_start();
$error_message = "";

$usersFile = __DIR__ . "/data/user.txt";
$permissionsFile = __DIR__ . "/data/json/authorizations.json";
// 📁 Dossier utilisateur

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = trim($_POST["username"] ?? '');
    $password = trim($_POST["password"] ?? '');
    $found = false;
    $role = "";

    // Vérifier les utilisateurs
    if (file_exists($usersFile)) {
        $lines = file($usersFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (preg_match("/- ([^:]+):([^:]+):(.+)$/", $line, $matches)) {
                $user = trim($matches[1]);
                $pass = trim($matches[2]);
                $r = trim($matches[3]);
                if ($user === $username && $pass === $password) {
                    $found = true;
                    $role = $r;
                    break;
                }
            }
        }
    }

    if ($found) {
        $_SESSION["username"] = $username;
        $_SESSION["role"] = $role;
        $_SESSION["user_folder"] = __DIR__ . "/data/users/" . $username;
        $_SESSION["notes_file"] = $_SESSION["user_folder"] . "/notes.json";
        $_SESSION["docs_file"] = $_SESSION["user_folder"] . "/docs.json";
        $_SESSION["slides_file"] = $_SESSION["user_folder"] . "/slides.json";
        $_SESSION["sheets_file"] = $_SESSION["user_folder"] . "/sheets.json";
        $_SESSION["calendar_file"] = $_SESSION["user_folder"] . "/calendar.json";

        // Charger permissions (si étudiant)
        if ($role === "student" && file_exists($permissionsFile)) {
            $permissions = json_decode(file_get_contents($permissionsFile), true) ?? [];
            $_SESSION["permissions"] = $permissions[$username] ?? [];
        }

        // Redirection selon le rôle
        switch ($role) {
            case "admin":
                header("Location: dashboard/admin.php");
                exit;
            case "parent":
                header("Location: dashboard/parent.php");
                exit;
            case "principal":
                header("Location: dashboard/principal.php");
                exit;
            case "student":
                header("Location: /dashboard/student.php");
                exit;
            case "teacher":
                header("Location: dashboard/teacher.php");
                exit;
            case "worker":
                header("Location: dashboard/worker.php");
                exit;
            default:
                $error_message = "Rôle inconnu.";
        }
    } else {
        $error_message = "Nom d'utilisateur ou mot de passe incorrect.";
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Login Page</title>
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
<h1>Connexion</h1>
<?php if ($error_message !== ""): ?>
    <div class="msg error"><?= htmlspecialchars($error_message) ?></div>
<?php endif; ?>
<form method="post" novalidate>
    <div class="input-box"><input type="text" name="username" placeholder="Nom d'utilisateur" required></div>
  <div class="input-box"><input type="password" name="password" placeholder="Mot de passe" required></div>
    <button type="submit" class="btn">Se connecter</button>
    <div class="msg" style="margin-top:8px">Pas encore inscrit ? <a href="register.php" style="color:#fff;text-decoration:underline">Créer un compte</a></div>
</form>
</div>
</body>
</html>
